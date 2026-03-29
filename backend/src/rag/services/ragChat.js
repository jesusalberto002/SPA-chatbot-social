const { PORTFOLIO_RAG_SYSTEM_PROMPT } = require('../prompts/system');
const { createEmbedding } = require('./embeddings');
const { searchSimilar } = require('./retrieval');
const { getVertexAI } = require('../../lib/googleVertex');

/** Same default as `assistantAI.js` text model; override with GEMINI_CHAT_MODEL if needed. */
const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-2.0-flash';

const portfolioRagModel = getVertexAI().getGenerativeModel({
  model: CHAT_MODEL,
  systemInstruction: {
    parts: [{ text: PORTFOLIO_RAG_SYSTEM_PROMPT }],
  },
});

function extractTextFromVertexResponse(result) {
  const response = result.response;
  const textPart = response?.candidates?.[0]?.content?.parts?.find((p) => p.text);
  return (textPart?.text ?? '').trim();
}

/**
 * End-to-end RAG pipeline for the portfolio / recruiter assistant (Vertex AI — same project/credentials as assistant).
 *
 * 1. Embed the user's question (RETRIEVAL_QUERY).
 * 2. Retrieve the top-k most relevant chunks from Postgres/pgvector.
 * 3. Build a grounded prompt from the retrieved context.
 * 4. Ask Gemini on Vertex to answer — staying within what the context provides.
 *
 * @param {string} userMessage
 * @returns {Promise<{
 *   reply: string,
 *   sources: Array<{ id: number, source: string, snippet: string }>
 * }>}
 */
async function runPortfolioRagChat(userMessage) {
  const embedding = await createEmbedding(userMessage, { taskType: 'RETRIEVAL_QUERY' });

  const chunks = await searchSimilar(embedding, { limit: 9 });

  let contextBlock;

  if (chunks.length === 0) {
    contextBlock =
      '(No passages met the retrieval threshold for this question. Say briefly that this specific topic is not covered in your uploaded materials, and invite them to ask about your projects, technical skills, work experience, or education.)';
  } else {
    contextBlock = chunks
      .map((c, i) => {
        const label = c.title ? `[${i + 1}] ${c.title} (${c.source})` : `[${i + 1}] ${c.source}`;
        return `${label}\n${c.content.trim()}`;
      })
      .join('\n\n---\n\n');
  }

  const fullPrompt = [
    '## Context retrieved from knowledge base',
    contextBlock,
    '',
    '## Question',
    userMessage,
    '',
    '## Answer',
  ].join('\n');

  const result = await portfolioRagModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
  });

  let reply = extractTextFromVertexResponse(result);
  if (!reply) {
    reply = 'I could not generate a reply just now. Please try again.';
  }

  const sources = chunks.map((c) => ({
    id: c.id,
    source: c.source,
    snippet: c.content.slice(0, 160).trim() + (c.content.length > 160 ? '…' : ''),
  }));

  return { reply, sources };
}

module.exports = { runPortfolioRagChat };
