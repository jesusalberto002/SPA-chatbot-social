import { PROJECTS } from '../../../data/projects';
import { PRESENTATION_SECTION_IDS } from '../../../constants/sections';
import { ProjectRow } from '../../ui/ProjectRow';

export function ProjectsSection() {
  return (
    <section
      id={PRESENTATION_SECTION_IDS.projects}
      className="presentation-card__projects"
      aria-label="Projects"
    >
      <div className="presentation-card__section-inner">
        <h2 className="presentation-card__chat-title">
          Projects
        </h2>
        <p className="presentation-card__section-lead">
        </p>
        <div className="presentation-card__project-list">
          {PROJECTS.map((project) => (
            <ProjectRow key={project.id} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
