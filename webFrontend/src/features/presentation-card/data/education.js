/**
 * Education & professional credentials.
 *
 * Logos (optional): add e.g. `udlap.png` under `assets/images/education/`, then:
 *   import logoUdlap from '../assets/images/education/udlap.png';
 * and set `logo: logoUdlap` on that entry (clear `logoInitials` or keep as fallback).
 */

import logoQut from '../assets/images/education/QUT-Logo.webp';
import logoUdlap from '../assets/images/education/UDLAP-Logo.webp';
import logoIBM from '../assets/images/education/IBM-Logo.webp';

export const EDUCATION_ENTRIES = [
  {
    id: 'qut-master-it',
    kind: 'degree',
    institution: 'Queensland University of Technology (QUT)',
    location: 'Brisbane, Australia',
    credentialTitle: 'Master of Information Technology (Computer Science focus)',
    graduated: 'November 2025',
    logoInitials: 'QUT',
    logo: logoQut,
    logoAlt: 'Queensland University of Technology logo',
    description:
      'QUT is known for applied IT, software engineering, and industry-connected postgraduate study. The program strengthened full-stack architecture, modern tooling, and production-oriented development in cloud and AI-adjacent contexts.',
  },
  {
    id: 'udlap-electronic-engineering',
    kind: 'degree',
    institution: 'Universidad de las Américas Puebla (UDLAP)',
    location: 'Puebla, Mexico',
    credentialTitle: 'Bachelor of Electronic Engineering',
    graduated: 'June 2024',
    logoInitials: 'UD',
    logo: logoUdlap,
    logoAlt: 'Universidad de las Américas Puebla logo',
    description:
      'UDLAP is one of the leading private universities in Mexico, with strong engineering and technology programs. The degree built a systems-and-hardware mindset—signals, embedded context, and rigorous analysis—that complements my software and AI work today.',
  },
  {
    id: 'ibm-rag-coursera',
    kind: 'certificate',
    institution: 'Coursera (IBM)',
    location: 'Online',
    credentialTitle: 'IBM Retrieval-Augmented Generation (RAG) and Agentic AI',
    graduated: 'Professional certificate',
    logoInitials: 'IBM',
    logo: logoIBM,
    logoAlt: 'IBM or Coursera logo',
    description:
      'Focused on RAG architectures, grounding LLM outputs in enterprise data, and patterns for agentic AI workflows—aligned with the retrieval and automation layers in this portfolio.',
  },
];
