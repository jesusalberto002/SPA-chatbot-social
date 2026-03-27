/**
 * Recruiter / portfolio RAG API client.
 * Uses same axios instance as the app; path is under /api/portfolio-rag
 */
import api from '../../../api/axios';

export async function fetchPortfolioRagHealth() {
  const { data } = await api.get('portfolio-rag/health');
  return data;
}
