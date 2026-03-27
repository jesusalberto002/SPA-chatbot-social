/**
 * Social & contact links — replace hrefs and display text with your own.
 * `kind` selects the icon: github | linkedin | email | phone | website
 */
export const SOCIAL_LINKS = [
  {
    id: 'github',
    kind: 'github',
    title: 'GitHub',
    description: 'Repositories, contributions, and open source work.',
    href: 'https://github.com/your-username',
    actionLabel: 'View profile',
  },
  {
    id: 'linkedin',
    kind: 'linkedin',
    title: 'LinkedIn',
    description: 'Experience, recommendations, and professional updates.',
    href: 'https://www.linkedin.com/in/your-profile/',
    actionLabel: 'Connect',
  },
  {
    id: 'email',
    kind: 'email',
    title: 'Email',
    description: 'Best for opportunities and collaboration.',
    href: 'mailto:you@example.com',
    displayValue: 'you@example.com',
    actionLabel: 'Send email',
  },
  {
    id: 'phone',
    kind: 'phone',
    title: 'Phone',
    description: 'Available during business hours (your timezone).',
    href: 'tel:+15550000000',
    displayValue: '+1 (555) 000-0000',
    actionLabel: 'Call',
  },
];
