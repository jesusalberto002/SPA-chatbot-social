const prisma = require('../../middleware/prisma');

const DEFAULT_LIMIT = 8;
/** Drop results whose cosine similarity is below this threshold (lower = more recall, noisier matches). */
const MIN_SIMILARITY = Number(process.env.RAG_MIN_SIMILARITY) || 0.4;
/** When all rows are below MIN_SIMILARITY, still return the best matches (avoids empty context if ingest exists). */
const FETCH_MULTIPLIER = 3;
/** Always merge in top matches from this source (recruiter FAQ: roles, salary, visa). Set empty to disable. */
const FAQ_SOURCE = process.env.RAG_FAQ_SOURCE || 'faq/faq';
const FAQ_MERGE_LIMIT = Math.min(12, Number(process.env.RAG_FAQ_MERGE_LIMIT) || 8);

function dedupeByIdPreferHigherSimilarity(rows) {
  const byId = new Map();
  for (const r of rows) {
    const prev = byId.get(r.id);
    if (!prev || Number(r.similarity) > Number(prev.similarity)) {
      byId.set(r.id, r);
    }
  }
  return [...byId.values()].sort((a, b) => Number(b.similarity) - Number(a.similarity));
}

/**
 * Find the most semantically similar chunks to a query embedding.
 *
 * Uses pgvector cosine distance (<=>). Lower distance = more similar.
 * We return `1 - distance` as `similarity` so higher values are better.
 *
 * When no `source` filter is set, merges global nearest rows with nearest rows from `faq/faq` so recruiter
 * questions (visa, salary, role fit) are not crowded out by large project chunks.
 *
 * @param {number[]} embedding  Query embedding from createEmbedding()
 * @param {{ limit?: number, source?: string }} options
 * @returns {Promise<Array<{
 *   id: number,
 *   source: string,
 *   title: string|null,
 *   content: string,
 *   metadata: object|null,
 *   similarity: number
 * }>>}
 */
async function searchSimilar(embedding, options = {}) {
  const { limit = DEFAULT_LIMIT, source } = options;
  const fetchLimit = Math.min(64, Math.max(limit * FETCH_MULTIPLIER, limit));

  // pgvector expects the vector as a string literal: '[0.1,0.2,...]'
  const vectorLiteral = `[${embedding.join(',')}]`;

  let rows;

  if (source) {
    rows = await prisma.$queryRawUnsafe(
      `SELECT
         id,
         source,
         title,
         content,
         metadata,
         1 - (embedding <=> $1::vector) AS similarity
       FROM "Chunks"
       WHERE source = $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      vectorLiteral,
      source,
      fetchLimit,
    );
  } else {
    const globalPromise = prisma.$queryRawUnsafe(
      `SELECT
         id,
         source,
         title,
         content,
         metadata,
         1 - (embedding <=> $1::vector) AS similarity
       FROM "Chunks"
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      vectorLiteral,
      fetchLimit,
    );

    const faqPromise =
      FAQ_SOURCE.length > 0
        ? prisma.$queryRawUnsafe(
            `SELECT
               id,
               source,
               title,
               content,
               metadata,
               1 - (embedding <=> $1::vector) AS similarity
             FROM "Chunks"
             WHERE source = $2
             ORDER BY embedding <=> $1::vector
             LIMIT $3`,
            vectorLiteral,
            FAQ_SOURCE,
            FAQ_MERGE_LIMIT,
          )
        : Promise.resolve([]);

    const [globalRows, faqRows] = await Promise.all([globalPromise, faqPromise]);
    rows = dedupeByIdPreferHigherSimilarity([...globalRows, ...faqRows]);
  }

  const filtered = rows.filter((r) => Number(r.similarity) >= MIN_SIMILARITY);
  if (filtered.length > 0) {
    return filtered.slice(0, limit);

  }

  // Nothing passed the bar — still return best-effort nearest chunks so FAQ / paraphrased questions can answer.
  return rows.slice(0, limit);
}

module.exports = { searchSimilar };
