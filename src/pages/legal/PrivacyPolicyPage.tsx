import { Link } from 'react-router-dom';
import { Shield, Mail } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/" className="text-green-600 hover:text-green-700 text-sm font-medium">
          ← Back to Home
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-green-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Last Updated: November 4, 2025
      </p>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Forsmon Technologies Limited ("Placesi", "we", "us", or "our") operates the Placesi platform,
            an AI-powered real estate marketplace serving Trinidad and Tobago. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you use our services.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We are committed to protecting your privacy and complying with applicable data protection laws
            in Trinidad and Tobago. By using Placesi, you consent to the data practices described in this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.1 Personal Information</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            When you register or use our services, we may collect:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>Full name and contact information (email address, phone number)</li>
            <li>Account credentials (username, password)</li>
            <li>Profile information (profile picture, bio, professional details)</li>
            <li>Real estate agent or agency licensing information</li>
            <li>Property preferences and search history</li>
            <li>Communication records with agents and other users</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.2 Financial Information</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            For mortgage applications and financial services:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>Income and employment information</li>
            <li>Credit history and financial documents</li>
            <li>Bank account details (for mortgage institutions)</li>
            <li>Tax identification numbers</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.3 Property Information</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            For users listing properties, we collect property details including location, specifications,
            images, pricing, and related documentation.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.4 Usage and Technical Information</h3>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, features used, time spent)</li>
            <li>Cookies and similar tracking technologies</li>
            <li>AI chat interactions and property search queries</li>
            <li>Location data (with your permission)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            We use the collected information for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>Providing and maintaining our real estate platform services</li>
            <li>Processing property searches and AI-powered recommendations</li>
            <li>Facilitating communication between buyers, sellers, and agents</li>
            <li>Processing mortgage applications and connecting users with financial institutions</li>
            <li>Verifying agent and agency credentials</li>
            <li>Sending service notifications, updates, and promotional communications</li>
            <li>Improving our AI algorithms and platform features</li>
            <li>Analyzing usage patterns and conducting market research</li>
            <li>Preventing fraud and ensuring platform security</li>
            <li>Complying with legal obligations under Trinidad and Tobago law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Information Sharing and Disclosure</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 With Real Estate Professionals</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            When you express interest in a property or request contact, we share your information with
            the relevant real estate agents or agencies to facilitate the transaction.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.2 With Mortgage Institutions</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            When you apply for mortgage pre-approval, we share necessary financial information with
            participating financial institutions to process your application.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.3 With Service Providers</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We may share information with trusted third-party service providers who assist in operating
            our platform, including cloud hosting, AI processing, analytics, and customer support services.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.4 Legal Requirements</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We may disclose your information when required by law, court order, or governmental request,
            or to protect the rights, property, or safety of Placesi, our users, or others.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.5 Business Transfers</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred
            to the acquiring entity.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data Security</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication and access controls</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Restricted access to personal information on a need-to-know basis</li>
            <li>Secure cloud infrastructure with enterprise-grade protection</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            While we strive to protect your information, no method of transmission over the internet
            or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Data Retention</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We retain your personal information for as long as necessary to fulfill the purposes outlined
            in this Privacy Policy, unless a longer retention period is required or permitted by law.
            When you delete your account, we will remove your personal information within 90 days,
            except where retention is required for legal compliance, dispute resolution, or fraud prevention.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Your Rights and Choices</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            You have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
            <li><strong>Data Portability:</strong> Request transfer of your data in a machine-readable format</li>
            <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            To exercise these rights, please contact us using the information provided in Section 13.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Cookies and Tracking Technologies</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            We use cookies and similar technologies to enhance your experience:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li><strong>Essential Cookies:</strong> Required for platform functionality and security</li>
            <li><strong>Performance Cookies:</strong> Help us understand how users interact with our platform</li>
            <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytics Cookies:</strong> Collect anonymous usage statistics</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            You can control cookies through your browser settings, but disabling certain cookies may
            affect platform functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Children's Privacy</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Placesi is not intended for users under the age of 18. We do not knowingly collect personal
            information from children. If you believe we have inadvertently collected information from a
            child, please contact us immediately, and we will take steps to delete such information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Third-Party Links</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Our platform may contain links to third-party websites, including mortgage institution sites
            and external property resources. We are not responsible for the privacy practices of these
            external sites. We encourage you to review their privacy policies before providing any information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. International Data Transfers</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            While our primary operations are in Trinidad and Tobago, we may use cloud service providers
            that store data on servers located outside of Trinidad and Tobago. When we transfer your
            information internationally, we ensure appropriate safeguards are in place to protect your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Changes to This Privacy Policy</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices or
            for legal, operational, or regulatory reasons. We will notify you of any material changes by
            posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued
            use of Placesi after changes are posted constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Contact Information</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">Forsmon Technologies Limited</p>
            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p>Email: privacy@placesi.ai</p>
                <p className="mt-2">Trinidad and Tobago</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Governing Law</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            This Privacy Policy is governed by and construed in accordance with the laws of the
            Republic of Trinidad and Tobago. Any disputes arising from this policy shall be subject
            to the exclusive jurisdiction of the courts of Trinidad and Tobago.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          For additional legal information, please review our{' '}
          <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
