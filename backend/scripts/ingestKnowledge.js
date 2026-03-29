/**
 * Walks repo knowledge/ (all .md files), chunks text, embeds via Vertex AI (`gemini-embedding-001` predict),
 * and replaces rows in Postgres `Chunks` (pgvector 768) per logical source.
 *
 * Usage (from backend/):
 *   node scripts/ingestKnowledge.js
 *   node scripts/ingestKnowledge.js certifications/certifications   # prefix filter
 *
 * Requires: DATABASE_URL, same GCP credentials as `assistantAI.js` (GOOGLE_APPLICATION_CREDENTIALS_JSON or file),
 * Postgres with pgvector + Chunks migration applied.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const { createEmbedding } = require('../src/rag/services/embeddings');

const prisma = new PrismaClient();

const KNOWLEDGE_ROOT = path.resolve(__dirname, '..', '..', 'knowledge');
const MAX_CHARS = 1400;

/** @returns {Promise<string[]>} */
async function collectMarkdownFiles(dir) {
  const out = [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await collectMarkdownFiles(full)));
    } else if (e.isFile() && e.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Split markdown into chunks: prefer `##` sections; fall back to paragraph windows.
 * @param {string} text
 * @returns {Array<{ title: string|null, body: string }>}
 */
function chunkMarkdown(text) {
  const trimmed = text.replace(/\r\n/g, '\n').trim();
  if (!trimmed) return [];

  const h1 = trimmed.match(/^#\s+(.+)$/m);
  const docTitle = h1 ? h1[1].trim() : null;

  const sectionParts = trimmed.split(/\n(?=##\s)/);
  const sections = [];

  for (const part of sectionParts) {
    const lines = part.split('\n');
    let secTitle = docTitle;
    let bodyLines = lines;

    if (lines[0]?.startsWith('## ')) {
      secTitle = lines[0].replace(/^##\s+/, '').trim();
      bodyLines = lines.slice(1);
    } else if (lines[0]?.startsWith('# ')) {
      bodyLines = lines.slice(1);
    }

    const body = bodyLines.join('\n').trim();
    if (!body && !secTitle) continue;

    const piece = `${secTitle ? `## ${secTitle}\n\n` : ''}${body}`.trim();
    if (!piece) continue;

    if (piece.length <= MAX_CHARS) {
      sections.push({ title: secTitle, body: piece });
    } else {
      let start = 0;
      let i = 0;
      while (start < piece.length) {
        const slice = piece.slice(start, start + MAX_CHARS);
        sections.push({
          title: secTitle ? `${secTitle} (part ${++i})` : `Part ${++i}`,
          body: slice,
        });
        start += MAX_CHARS;
      }
    }
  }

  if (sections.length === 0) {
    return [{ title: docTitle, body: trimmed.slice(0, MAX_CHARS) }];
  }

  return sections;
}

function toSourceKey(absFile) {
  const rel = path.relative(KNOWLEDGE_ROOT, absFile);
  return rel.replace(/\\/g, '/').replace(/\.md$/i, '');
}

/**
 * @param {number[]} values
 */
function toVectorLiteral(values) {
  return `[${values.join(',')}]`;
}

async function ingestFile(absPath, sourceFilter) {
  const sourceKey = toSourceKey(absPath);
  if (sourceFilter && !sourceKey.startsWith(sourceFilter)) {
    return { skipped: true, sourceKey };
  }

  const raw = await fs.promises.readFile(absPath, 'utf8');
  const chunks = chunkMarkdown(raw);
  if (chunks.length === 0) {
    console.warn(`No chunks for ${sourceKey}, skipping.`);
    return { skipped: true, sourceKey };
  }

  await prisma.$executeRawUnsafe(`DELETE FROM "Chunks" WHERE source = $1`, sourceKey);

  for (let i = 0; i < chunks.length; i++) {
    const { title, body } = chunks[i];
    const embedding = await createEmbedding(body);
    const vectorLiteral = toVectorLiteral(embedding);
    const metadata = {
      filePath: path.relative(path.resolve(KNOWLEDGE_ROOT, '..'), absPath).replace(/\\/g, '/'),
      section: title,
      chunkIndex: i,
    };

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Chunks" (source, title, "chunkIndex", content, metadata, embedding, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector, NOW(), NOW())`,
      sourceKey,
      title,
      i,
      body,
      JSON.stringify(metadata),
      vectorLiteral,
    );
  }

  console.log(`Ingested ${chunks.length} chunk(s): ${sourceKey}`);
  return { skipped: false, sourceKey, count: chunks.length };
}

async function main() {
  const sourceFilter = (process.argv[2] || '').replace(/\\/g, '/').replace(/\.md$/i, '');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Load backend/.env with a Postgres URL.');
    process.exit(1);
  }

  if (!fs.existsSync(KNOWLEDGE_ROOT)) {
    console.error(`Knowledge directory not found: ${KNOWLEDGE_ROOT}`);
    process.exit(1);
  }

  const files = await collectMarkdownFiles(KNOWLEDGE_ROOT);
  files.sort();

  if (files.length === 0) {
    console.log('No .md files under knowledge/.');
    return;
  }

  let total = 0;
  for (const f of files) {
    const r = await ingestFile(f, sourceFilter || null);
    if (!r.skipped) total += r.count;
  }

  if (sourceFilter) {
    console.log(`Done (filter: "${sourceFilter}"). Total chunks written in this run: ${total}`);
  } else {
    console.log(`Done. Total chunks written: ${total}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
