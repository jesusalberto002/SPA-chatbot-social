/**
 * Vector similarity search against Supabase pgvector or your store.
 * Implement searchSimilar(embedding, options) -> chunks[] when you add RAG.
 */

async function searchSimilar(_embedding, _options = {}) {
  throw new Error('searchSimilar not implemented — add pgvector queries or Supabase RPC.');
}

module.exports = { searchSimilar };
