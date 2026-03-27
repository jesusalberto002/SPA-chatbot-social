import '../styles/presentation.css';
import { PresentationLayout } from '../components/layout/PresentationLayout';

/**
 * Entry page for the public presentation card. Split sections under components/sections/.
 */
export default function PresentationPage() {
  return (
    <div className="presentation-card">
      <PresentationLayout />
    </div>
  );
}
