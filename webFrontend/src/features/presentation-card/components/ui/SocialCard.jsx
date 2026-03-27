import { ArrowUpRight, Github, Linkedin, Mail, Phone, Globe } from 'lucide-react';

const ICONS = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  phone: Phone,
  website: Globe,
};

export function SocialCard({ title, description, href, kind, displayValue, actionLabel }) {
  const Icon = ICONS[kind] ?? Globe;
  const isExternal = href.startsWith('http');

  return (
    <a
      href={href}
      className="presentation-card__social-card"
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="presentation-card__social-card-icon" aria-hidden>
        <Icon size={22} strokeWidth={2} />
      </span>
      <div className="presentation-card__social-card-body">
        <span className="presentation-card__social-card-title">{title}</span>
        {displayValue ? (
          <>
            <span className="presentation-card__social-card-value">{displayValue}</span>
            <span className="presentation-card__social-card-desc">{description}</span>
          </>
        ) : (
          <span className="presentation-card__social-card-desc">{description}</span>
        )}
      </div>
      <span className="presentation-card__social-card-action">
        <span className="presentation-card__social-card-action-text">{actionLabel ?? 'Open'}</span>
        <ArrowUpRight size={16} strokeWidth={2} aria-hidden />
      </span>
    </a>
  );
}
