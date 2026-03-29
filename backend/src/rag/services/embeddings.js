const { PROJECT_ID, VERTEX_LOCATION, getVertexAccessToken } = require('../../lib/googleVertex');

/** Must match Postgres `vector(768)` and ingestion script. */
const EMBEDDING_MODEL_ID = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768;

/**
 * Vertex AI text embeddings (`:predict` on publisher model). Same GCP project/credentials as `assistantAI.js`.
 * @param {string} text
 * @param {{ taskType?: string }} [options]
 * @param {string} [options.taskType] RETRIEVAL_DOCUMENT for corpus chunks, RETRIEVAL_QUERY for user questions.
 * @returns {Promise<number[]>}
 */
async function createEmbedding(text, options = {}) {
  if (!text || typeof text !== 'string') {
    throw new Error('createEmbedding: text must be a non-empty string.');
  }

  const taskType = options.taskType || 'RETRIEVAL_DOCUMENT';
  const normalised = text.replace(/\s+/g, ' ').trim();

  const token = await getVertexAccessToken();
  const url = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${EMBEDDING_MODEL_ID}:predict`;

  const body = {
    instances: [{ content: normalised, task_type: taskType }],
    parameters: {
      autoTruncate: true,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Vertex embedding error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const values = data.predictions?.[0]?.embeddings?.values;
  if (!values || !Array.isArray(values)) {
    throw new Error('Vertex embedding: missing predictions[0].embeddings.values');
  }

  return values;
}

module.exports = { createEmbedding, EMBEDDING_DIMENSIONS };
