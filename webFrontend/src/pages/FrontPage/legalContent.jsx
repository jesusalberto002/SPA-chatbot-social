// legalContent.jsx
import React from 'react';

export const PRIVACY_POLICY = (
  <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">1. Commitment to Privacy</h4>
      <p>
        This demo application is committed to protecting your privacy in accordance with the <strong>Privacy Act 1988 (Cth)</strong> and the <strong>Australian Privacy Principles (APPs)</strong>. This policy outlines how we handle your personal and sensitive information when you use this AI-powered wellness demo.
      </p>
    </section>

    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">2. Information We Collect</h4>
      <p className="mb-2">We collect information necessary to provide a personalized and secure experience:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Account Data:</strong> Your first name, last name, and email address provided during registration.
        </li>
        <li>
          <strong>Sensitive Wellness Data:</strong> To personalize the AI, we collect "Interests" or "Tags" (such as Mental Health, Mindfulness, or Stress Management) that you explicitly select.
        </li>
        <li>
          <strong>Profile Information:</strong> Your chosen avatar selection and subscription tier (Bronze or Platinum).
        </li>
        <li>
          <strong>Payment Information:</strong> Financial transactions are processed securely via Stripe. This demo does not store your full credit card details on our servers.
        </li>
      </ul>
    </section>

    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">3. How We Use Your Data</h4>
      <p className="mb-2">Your data is used strictly for:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Personalization:</strong> Using your selected tags to tailor AI interactions and community content.</li>
        <li><strong>Authentication:</strong> Using Secure JWT tokens to manage your session and protect your account.</li>
        <li><strong>Communication:</strong> Sending essential service updates and subscription notifications.</li>
      </ul>
    </section>

    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">4. Data Security & Storage</h4>
      <p>
        We implement industry-standard encryption, including password hashing (Bcrypt) and secure tokenization (JWT), to protect your information. We do not sell your identifiable health or personal data to third parties for marketing purposes.
      </p>
    </section>

    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">5. Your Rights and Access</h4>
      <p>
        Under the APPs, you have the right to access, correct, or request the deletion of your personal information at any time. You can manage your profile settings or contact us at <strong>support@example.com</strong> for data inquiries.
      </p>
    </section>

    <section className="bg-gray-50 p-4 rounded-lg border border-gray-100">
      <h4 className="font-bold text-gray-900 uppercase mb-2 text-xs">6. Consent</h4>
      <p className="text-xs italic">
        By checking the agreement box and clicking "Next," you provide <strong>explicit consent</strong> for this application to collect and process your sensitive wellness data as described in this policy.
      </p>
    </section>
  </div>
);

export const TERMS_AND_CONDITIONS = (
  <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">1. Medical Disclaimer</h4>
      <p className="bg-amber-50 p-3 border-l-4 border-amber-400 italic">
        This demo is a supportive AI-powered wellness tool and does NOT provide medical advice, clinical diagnosis, or treatment. The AI models and community groups are intended for reflection and peer support only. If you are in crisis or experiencing a medical emergency, please contact emergency services (000 in Australia) or a licensed healthcare professional immediately.
      </p>
    </section>

    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">2. Eligibility and Registration</h4>
      <p>
        To use this application, you must provide accurate registration details, including your name and a valid email address. You are responsible for maintaining the security of your account credentials. The operator reserves the right to suspend accounts that provide false information or violate our community standards.
      </p>
    </section>

    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">3. Subscriptions and Free Trials</h4>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>7-Day Free Trial:</strong> New subscribers may be eligible for a 7-day trial period. A valid payment method is required to start the trial to ensure uninterrupted service.
        </li>
        <li>
          <strong>Automatic Renewal:</strong> Unless cancelled at least 24 hours before the end of the trial, your account will automatically convert to a paid subscription (Bronze or Platinum) based on your selection.
        </li>
        <li>
          <strong>Billing Cycles:</strong> You may choose between Monthly or Yearly billing cycles. Fees are processed via Stripe and are billed in advance of the service period.
        </li>
      </ul>
    </section>

    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">4. User Conduct and Community</h4>
      <p>
        This demo provides a "Safe Place" for growth. By participating in our community sections, you agree not to post content that is harassing, illegal, or harmful. Our system includes reporting mechanisms for community safety. Violation of these rules may result in immediate account suspension or termination without refund.
      </p>
    </section>

    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">5. Limitation of Liability</h4>
      <p>
        This demo provides its services "as is". To the maximum extent permitted by Australian Consumer Law, the operator shall not be liable for any indirect, incidental, or consequential damages arising from your use of the AI platform or community interactions.
      </p>
    </section>

    <section>
      <h4 className="font-bold text-gray-900 uppercase mb-2">6. Changes to Terms</h4>
      <p>
        We may update these terms to reflect changes in our service or legal obligations. Continued use of this application after such changes constitutes your acceptance of the new terms.
      </p>
    </section>
  </div>
);