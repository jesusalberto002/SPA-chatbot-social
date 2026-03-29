import { EDUCATION_ENTRIES } from '../../../data/education';
import { PRESENTATION_SECTION_IDS } from '../../../constants/sections';
import { EducationRow } from '../../ui/EducationRow';

export function EducationSection() {
  return (
    <section
      id={PRESENTATION_SECTION_IDS.education}
      className="presentation-card__education"
      aria-label="Education and qualifications"
    >
      <div className="presentation-card__section-inner">
        <h2 className="presentation-card__chat-title">Education</h2>
        <p className="presentation-card__section-lead">
          Degrees and professional training—each card includes space for the institution’s logo and a short note on the
          program and how it shaped my formation.
        </p>
        <div className="presentation-card__education-list">
          {EDUCATION_ENTRIES.map((entry) => (
            <EducationRow key={entry.id} {...entry} />
          ))}
        </div>
      </div>
    </section>
  );
}
