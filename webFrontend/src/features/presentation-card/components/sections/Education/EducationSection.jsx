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
        <div className="presentation-card__education-list">
          {EDUCATION_ENTRIES.map((entry, index) => (
            <div key={entry.id}>
              {index > 0 && (
                <hr className="presentation-card__education-divider" />
              )}
              <EducationRow {...entry} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
