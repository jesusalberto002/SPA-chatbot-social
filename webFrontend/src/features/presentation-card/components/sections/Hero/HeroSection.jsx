import { PRESENTATION_SECTION_IDS } from '../../../constants/sections';
import { HERO } from '../../../data/hero';
import photo from '../../../assets/images/Photo-Jesus.webp';

export function HeroSection() {
  return (
    <section
      id={PRESENTATION_SECTION_IDS.hero}
      className="presentation-card__hero"
      aria-label="Introduction"
    >
      <div className="presentation-card__hero-backdrop" aria-hidden />
      <div className="presentation-card__hero-blobs" aria-hidden>
        <span className="presentation-card__hero-blob presentation-card__hero-blob--a" />
        <span className="presentation-card__hero-blob presentation-card__hero-blob--b" />
        <span className="presentation-card__hero-blob presentation-card__hero-blob--c" />
      </div>

      <div className="presentation-card__section-inner presentation-card__hero-inner">
        <div className="presentation-card__hero-grid">
          <div className="presentation-card__hero-visual">
            <div className="presentation-card__hero-photo-ring">
              <div className="presentation-card__hero-photo-inner">
                <img
                  src={photo}
                  alt="Portrait of Jesus Ojeda"
                  width={400}
                  height={400}
                  className="presentation-card__hero-photo"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <div className="presentation-card__hero-copy">
            <p className="presentation-card__hero-eyebrow">{HERO.eyebrow}</p>
            <h1 className="presentation-card__hero-name">{HERO.name}</h1>
            <p className="presentation-card__hero-tagline">{HERO.tagline}</p>
            <p className="presentation-card__hero-bio">{HERO.bio}</p>
            <ul className="presentation-card__hero-highlights" aria-label="Focus areas">
              {HERO.highlights.map((label) => (
                <li key={label} className="presentation-card__hero-pill">
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
