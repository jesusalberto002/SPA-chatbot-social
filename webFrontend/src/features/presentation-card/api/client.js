/**
 * RAG / health calls for the recruiter assistant (same backend as portfolio-rag).
 */
import api from '../../../api/axios';

export async function fetchPresentationRagHealth() {
  const { data } = await api.get('portfolio-rag/health');
  return data;
}

/**
 * Send a message to the portfolio RAG assistant.
 * @param {string} message
 * @returns {Promise<{ reply: string, sources: Array<{ id: number, source: string, snippet: string }> }>}
 */
export async function postRagChat(message) {
  const { data } = await api.post('portfolio-rag/chat', { message });
  return data;
}
