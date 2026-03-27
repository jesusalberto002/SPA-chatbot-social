import { PRESENTATION_SECTION_IDS } from '../../../constants/sections';
import { SOCIAL_LINKS } from '../../../data/social';
import { SocialCard } from '../../ui/SocialCard';

export function SocialSection() {
  return (
    <section
      id={PRESENTATION_SECTION_IDS.social}
      className="presentation-card__social"
      aria-label="Social links and contact"
    >
      <div className="presentation-card__section-inner">
        <div className="presentation-card__social-intro">
          <h2 className="presentation-card__social-heading">Social links &amp; contact</h2>
          <p className="presentation-card__social-lead">
            Reach out for roles, collaborations, or questions about my work. Prefer email for formal
            opportunities.
          </p>
        </div>
        <div className="presentation-card__social-grid">
          {SOCIAL_LINKS.map((link) => (
            <SocialCard key={link.id} {...link} />
          ))}
        </div>
      </div>
    </section>
  );
}
