/**
 * RAG / health calls for the recruiter assistant (same backend as portfolio-rag).
 */
import api from '../../../api/axios';

export async function fetchPresentationRagHealth() {
  const { data } = await api.get('portfolio-rag/health');
  return data;
}
