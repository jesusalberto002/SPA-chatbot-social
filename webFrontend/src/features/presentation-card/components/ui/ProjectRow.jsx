import { Link } from 'react-router-dom';
import { ExternalLink, Github, ImageIcon } from 'lucide-react';

function isInternalHref(href) {
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
}

export function ProjectRow({
  title,
  description,
  stack,
  image,
  imageAlt,
  repoHref,
  appHref,
}) {
  const liveClassName =
    'presentation-card__project-btn presentation-card__project-btn--live';

  return (
    <article className="presentation-card__project-row">
      <div className="presentation-card__project-shot-wrap">
        <div className="presentation-card__project-shot">
          {image ? (
            <img
              src={image}
              alt={imageAlt || `${title} screenshot`}
              className="presentation-card__project-img"
              loading="lazy"
            />
          ) : (
            <div className="presentation-card__project-shot-placeholder">
              <ImageIcon size={36} strokeWidth={1.5} aria-hidden />
              <span>Screenshot placeholder</span>
            </div>
          )}
        </div>
      </div>

      <div className="presentation-card__project-main">
        <h3 className="presentation-card__project-title">{title}</h3>
        <p className="presentation-card__project-desc">{description}</p>

        <div className="presentation-card__project-stack" aria-label="Technologies">
          {stack.map((tech) => (
            <span key={tech} className="presentation-card__project-tag">
              {tech}
            </span>
          ))}
        </div>

        <div className="presentation-card__project-actions">
          <a
            href={repoHref}
            className="presentation-card__project-btn presentation-card__project-btn--repo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={18} strokeWidth={2} aria-hidden />
            GitHub
          </a>
          {isInternalHref(appHref) ? (
            <Link to={appHref} className={liveClassName}>
              <ExternalLink size={18} strokeWidth={2} aria-hidden />
              Live app
            </Link>
          ) : (
            <a
              href={appHref}
              className={liveClassName}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={18} strokeWidth={2} aria-hidden />
              Live app
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
