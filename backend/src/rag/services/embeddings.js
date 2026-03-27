/**
 * Embedding helpers (OpenAI / Gemini, etc.).
 * Implement createEmbedding(text) -> number[] when you add RAG.
 */

async function createEmbedding(_text) {
  throw new Error('createEmbedding not implemented — wire your embedding provider.');
}

module.exports = { createEmbedding };
