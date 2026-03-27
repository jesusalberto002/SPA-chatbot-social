import { PresentationHeader } from './PresentationHeader';
import { PresentationFooter } from './PresentationFooter';
import { HeroSection } from '../sections/Hero/HeroSection';
import { ProjectsSection } from '../sections/Projects/ProjectsSection';
import { ChatSection } from '../sections/Chat/ChatSection';
import { SocialSection } from '../sections/Social/SocialSection';

export function PresentationLayout() {
  return (
    <>
      <PresentationHeader />
      <main className="presentation-card__main">
        <HeroSection />
        <ProjectsSection />
        <ChatSection />
        <SocialSection />
      </main>
      <PresentationFooter />
    </>
  );
}
