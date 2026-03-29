export function EducationRow({
  institution,
  location,
  credentialTitle,
  graduated,
  kind,
  description,
  logo,
  logoAlt,
  logoInitials,
}) {
  const badge = kind === 'certificate' ? 'Certificate' : 'Degree';
  const rowClass =
    kind === 'certificate'
      ? 'presentation-card__education-row presentation-card__education-row--certificate'
      : 'presentation-card__education-row';

  return (
    <article className={rowClass}>
      <div className="presentation-card__education-logo-wrap">
        {logo ? (
          <div className="presentation-card__education-logo-frame">
            <img className="presentation-card__education-logo-img" src={logo} alt={logoAlt || institution} />
          </div>
        ) : (
          <div
            className="presentation-card__education-logo-placeholder"
            role="img"
            aria-label={logoAlt || `${institution} logo placeholder`}
          >
            <span className="presentation-card__education-logo-initials">{logoInitials || '·'}</span>
            <span className="presentation-card__education-logo-hint">Add logo</span>
          </div>
        )}
      </div>

      <div className="presentation-card__education-body">
        <div className="presentation-card__education-meta">
          <span className="presentation-card__education-badge">{badge}</span>
          {location ? (
            <span className="presentation-card__education-location">{location}</span>
          ) : null}
        </div>
        <h3 className="presentation-card__education-degree">{credentialTitle}</h3>
        <p className="presentation-card__education-institution">{institution}</p>
        <p className="presentation-card__education-date">{graduated}</p>
        <p className="presentation-card__education-desc">{description}</p>
      </div>
    </article>
  );
}
