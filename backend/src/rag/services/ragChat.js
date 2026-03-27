const { PORTFOLIO_RAG_SYSTEM_PROMPT } = require('../prompts/system');
const { createEmbedding } = require('./embeddings');
const { searchSimilar } = require('./retrieval');

/**
 * End-to-end RAG reply. Implement LLM call + citation formatting when ready.
 *
 * @param {string} userMessage
 * @returns {Promise<{ reply: string, sources?: Array<{ id: string, snippet: string }> }>}
 */
async function runPortfolioRagChat(userMessage) {
  void PORTFOLIO_RAG_SYSTEM_PROMPT;
  const embedding = await createEmbedding(userMessage);
  const chunks = await searchSimilar(embedding, { limit: 5 });
  void chunks;
  throw new Error('runPortfolioRagChat not implemented — add LLM completion after retrieval.');
}

module.exports = { runPortfolioRagChat };
