/**
 * Shared Vertex AI setup — same credentials and region as `assistantAI.js` (GCP service account, us-central1).
 * Used by the mental-health assistant, portfolio RAG chat, and Vertex text embeddings (REST predict).
 */

const fs = require('fs');
const path = require('path');
const { VertexAI } = require('@google-cloud/vertexai');
const { GoogleAuth } = require('google-auth-library');

const DEFAULT_GCP_PROJECT_ID = 'coral-hydra-471209-b4';

const loadGoogleServiceAccount = () => {
  const fromEnvJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (fromEnvJson) {
    try {
      const parsed = JSON.parse(fromEnvJson);
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      return parsed;
    } catch (error) {
      console.error('FATAL ERROR: GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON.', error);
      process.exit(1);
    }
  }

  const credentialsPathEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const candidatePaths = [];
  if (credentialsPathEnv) {
    candidatePaths.push(
      path.isAbsolute(credentialsPathEnv)
        ? credentialsPathEnv
        : path.resolve(process.cwd(), credentialsPathEnv)
    );
  }

  // Local development fallback (file lives at backend root when present).
  candidatePaths.push(path.join(__dirname, '..', '..', 'coral-hydra-471209-b4-d065fd90bf50.json'));

  for (const filePath of candidatePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const keyFileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(keyFileContent);
      }
    } catch (error) {
      console.error('FATAL ERROR: Could not read or parse Google service account file at', filePath, error);
      process.exit(1);
    }
  }

  console.error(
    'FATAL ERROR: No Google credentials found. Set GOOGLE_APPLICATION_CREDENTIALS_JSON (recommended for ECS) or GOOGLE_APPLICATION_CREDENTIALS path.'
  );
  process.exit(1);
};

const serviceAccount = loadGoogleServiceAccount();

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || serviceAccount.project_id || DEFAULT_GCP_PROJECT_ID;
const VERTEX_LOCATION = process.env.VERTEX_LOCATION || 'us-central1';

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: VERTEX_LOCATION,
  googleAuthOptions: {
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
  },
});

let googleAuthSingleton;
function getGoogleAuth() {
  if (!googleAuthSingleton) {
    googleAuthSingleton = new GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }
  return googleAuthSingleton;
}

/**
 * OAuth access token for Vertex REST calls (e.g. text-embeddings predict).
 */
async function getVertexAccessToken() {
  const auth = getGoogleAuth();
  const client = await auth.getClient();
  const res = await client.getAccessToken();
  if (!res.token) {
    throw new Error('getVertexAccessToken: failed to obtain access token.');
  }
  return res.token;
}

function getVertexAI() {
  return vertexAI;
}

module.exports = {
  loadGoogleServiceAccount,
  serviceAccount,
  DEFAULT_GCP_PROJECT_ID,
  PROJECT_ID,
  VERTEX_LOCATION,
  getVertexAI,
  getVertexAccessToken,
};
