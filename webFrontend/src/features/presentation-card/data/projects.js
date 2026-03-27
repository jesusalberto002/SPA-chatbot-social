import { SPA_APP_PATH } from '../constants/routes';
import appScreenshot from '../assets/images/App_Screenshot.webp';

/**
 * Portfolio projects — vertical list with screenshot, description, stack, repo + app links.
 * Add `image` import per project or `image: null` for a placeholder.
 */
export const PROJECTS = [
  {
    id: 'spa-chatbot-social',
    title: 'SPA Chatbot Social',
    description:
      'A full-stack wellness platform with real-time chat, AI-assisted conversations, communities, and subscriptions. Built as a single product in this monorepo with a focus on accessible UX and a maintainable API layer.',
    stack: ['React', 'Vite', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Stripe'],
    image: appScreenshot,
    imageAlt: 'SPA Chatbot Social web application interface',
    repoHref: 'https://github.com/your-username/SPA-chatbot-social',
    appHref: SPA_APP_PATH,
  },
];
