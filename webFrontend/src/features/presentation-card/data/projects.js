import { SPA_APP_PATH } from '../constants/routes';
import appScreenshot from '../assets/images/App_Screenshot.webp';
import IntrusionDetectionScreenshot from '../assets/images/ML-Project-SS.webp';
import OllamaAWSLLMServerScreenshot from '../assets/images/LLM-Project-SS.webp';

/**
 * Portfolio projects — vertical list with screenshot, description, stack, repo + optional app link.
 * Omit `appHref` (or set `null`) to hide the Live app button. Add `image` import per project or `image: null` for a placeholder.
 */
export const PROJECTS = [
  {
    id: 'spa-chatbot-social',
    title: 'SPA AI Chatbot with RAG + Full Social Media',
    description:
      'A cloud-native platform with real-time AI chat and Terraform-managed infrastructurea and CI/CD pipeline, AI-assisted conversations, communities, and subscriptions. Built as a single product in this monorepo with a focus on accessible UX and a maintainable API layer.',
    stack: ['AWS', 'Node.js', 'Terraform', 'PostgreSQL', 'Agentic AI', 'CI/CD'],
    image: appScreenshot,
    imageAlt: 'SPA Chatbot Social web application interface',
    repoHref: 'https://github.com/jesusalberto002/SPA-chatbot-social.git',
    appHref: SPA_APP_PATH,
  },
  {
    id: 'cnn-lstm-intrusion-detection',
    title: 'Hybrid CNN-LSTM Intrusion Detection System',
    description:
      'A deep learning-based security system designed to protect Internet of Medical Things (IoMT) networks by combining spatial and temporal traffic analysis. It features eXplainable AI (XAI) to provide transparent, interpretable security alerts for healthcare data protection.',
    stack: ['Python', 'Jupyter Notebook', 'TensorFlow', 'Keras', 'SHAP', 'Scikit-learn', 'Pandas', 'Matplotlib'],
    image: IntrusionDetectionScreenshot,
    imageAlt: 'Hybrid CNN-LSTM Intrusion Detection System',
    repoHref: 'https://github.com/jesusalberto002/CNN-LSTM-Intrusion-Detection.git',
  },
  {
    id: 'Ollama AWS LLM Server',
    title: 'AWS Orchestrated LLM Server with Ollama',
    description:
      'A containerized, multi-tier AI application architected for high availability on AWS. It features a decoupled microservices structure where the Frontend and Backend run as independent services (designed for ECS), communicating with a dedicated EC2-hosted Ollama server for high-performance LLM inference.',
    stack: ['React', 'FastAPI', 'Python', 'Ollama (EC2)', 'AWS ECS', 'AWS Cognito', 'Docker', 'PostgreSQL', 'pgvector'],
    image: OllamaAWSLLMServerScreenshot,
    imageAlt: 'AWS Orchestrated LLM Server with Ollama',
    repoHref: 'https://github.com/jesusalberto002/CAB432-LLM-PROJECT.git',
  },
];
