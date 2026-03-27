import { PRESENTATION_SECTION_IDS } from "../../constants/sections";

const NAV = [
  { id: PRESENTATION_SECTION_IDS.hero, label: "Intro" },
  { id: PRESENTATION_SECTION_IDS.projects, label: "Projects" },
  { id: PRESENTATION_SECTION_IDS.chat, label: "Chat" },
  { id: PRESENTATION_SECTION_IDS.social, label: "Contact" },
];

export function PresentationHeader() {
  return (
    <header className="presentation-card__header">
      <div className="presentation-card__header-inner">
        <p className="presentation-card__brand">Jesus Ojeda</p>
        <nav className="presentation-card__nav" aria-label="Page sections">
          {NAV.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className="presentation-card__nav-link">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}