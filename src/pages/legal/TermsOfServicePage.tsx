import { Link } from 'react-router-dom';
import { FileText, Mail } from 'lucide-react';

export function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/" className="text-green-600 hover:text-green-700 text-sm font-medium">
          ← Back to Home
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-green-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Last Updated: November 4, 2025
      </p>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            These Terms of Service ("Terms") constitute a legally binding agreement between you and
            Forsmon Technologies Limited ("Placesi", "we", "us", or "our"), a company incorporated under
            the laws of Trinidad and Tobago, regarding your access to and use of the Placesi platform,
            website, and services.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            By accessing or using Placesi, you agree to be bound by these Terms. If you disagree with
            any part of these Terms, you may not access or use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Services</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Placesi is an AI-powered real estate marketplace platform that:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>Connects property buyers and renters with real estate agents and agencies in Trinidad and Tobago</li>
            <li>Provides AI-powered property search and recommendation services</li>
            <li>Facilitates communication between buyers, sellers, renters, and real estate professionals</li>
            <li>Offers mortgage calculation tools and connects users with financial institutions</li>
            <li>Enables real estate agents and agencies to list and manage properties</li>
            <li>Provides market insights and property analytics</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Placesi acts as a platform connecting parties and does not directly engage in real estate
            transactions, brokerage services, or mortgage lending.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts and Registration</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.1 Account Creation</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            To access certain features, you must register for an account. You agree to provide accurate,
            current, and complete information during registration and to update such information to keep
            it accurate, current, and complete.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.2 Account Types</h3>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li><strong>Buyers/Renters:</strong> Individual users searching for properties</li>
            <li><strong>Real Estate Agents:</strong> Licensed professionals representing clients (requires license verification)</li>
            <li><strong>Agencies:</strong> Real estate agencies managing multiple agents and listings (requires business registration)</li>
            <li><strong>Mortgage Institutions:</strong> Financial institutions offering mortgage services (requires institutional verification)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.3 Account Security</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and for
            all activities that occur under your account. You must immediately notify us of any unauthorized
            access or security breach.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.4 Account Verification</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Real estate agents and agencies must provide valid licensing and registration documentation.
            Mortgage institutions must provide proof of authorization to operate in Trinidad and Tobago.
            We reserve the right to verify credentials and suspend accounts pending verification.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. User Conduct and Prohibited Activities</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>Provide false, misleading, or fraudulent information</li>
            <li>Impersonate any person or entity or misrepresent your affiliation</li>
            <li>List properties without proper authorization or ownership rights</li>
            <li>Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or obscene</li>
            <li>Violate any applicable laws, including real estate licensing requirements and fair housing laws</li>
            <li>Engage in price manipulation, bid rigging, or other anti-competitive practices</li>
            <li>Use automated systems to scrape data or manipulate platform features</li>
            <li>Attempt to gain unauthorized access to any portion of the platform</li>
            <li>Transmit viruses, malware, or other malicious code</li>
            <li>Harass, abuse, or harm other users or real estate professionals</li>
            <li>Interfere with or disrupt the platform's operation or security</li>
            <li>Use the platform for any commercial purpose other than legitimate real estate activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Property Listings</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.1 Listing Requirements</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Real estate agents and agencies may list properties subject to the following:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>All listings must be accurate, complete, and current</li>
            <li>You must have proper authorization to list the property</li>
            <li>Property images must be genuine and representative</li>
            <li>Pricing must be honest and not misleading</li>
            <li>Property status must be updated promptly (e.g., sold, rented, off-market)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.2 Free Listing Service</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Placesi currently offers unlimited property listings free of charge to verified agents and
            agencies. We reserve the right to introduce pricing or limitations in the future with advance notice.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.3 Listing Removal</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We reserve the right to remove, modify, or refuse any listing that violates these Terms,
            applicable laws, or our content policies, without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Real Estate Transactions</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.1 Platform Role</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Placesi is a marketplace platform only. We do not represent buyers, sellers, or renters in
            real estate transactions. All transactions are between users and real estate professionals.
            We are not responsible for the conduct of any user or the accuracy of listings.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.2 Professional Obligations</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Real estate agents and agencies using Placesi must comply with all applicable laws and
            regulations in Trinidad and Tobago, including licensing requirements, fair housing laws,
            and professional ethical standards.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.3 User Due Diligence</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Users are responsible for conducting their own due diligence, including property inspections,
            title searches, legal review, and verification of agent credentials. We recommend consulting
            with legal and financial professionals before entering into any real estate transaction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Mortgage Services</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Placesi provides tools to calculate potential mortgage payments and connects users with
            participating financial institutions. We do not provide mortgage lending services, financial
            advice, or guarantee loan approval. All mortgage applications and decisions are made solely
            by the financial institutions. Users should carefully review all terms and conditions before
            accepting any mortgage offer.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Intellectual Property Rights</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8.1 Platform Content</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            The Placesi platform, including its design, features, text, graphics, logos, software, and
            other content (excluding user-generated content), is owned by Forsmon Technologies Limited
            and protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8.2 User Content License</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            By posting property listings, images, or other content on Placesi, you grant us a worldwide,
            non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display
            such content for the purpose of operating and promoting the platform. You retain ownership
            of your content and may remove it at any time.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8.3 Content Representations</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            You represent and warrant that you own or have the necessary rights to all content you post,
            and that such content does not infringe the intellectual property rights of any third party.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. AI Services and Data Usage</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Our AI-powered search uses machine learning algorithms to provide personalized property
            recommendations. By using these features, you consent to the collection and analysis of your
            search queries, preferences, and interaction patterns to improve service quality. AI recommendations
            are provided for informational purposes only and should not be solely relied upon for decision-making.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Privacy and Data Protection</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Your privacy is important to us. Our collection, use, and disclosure of personal information
            is governed by our{' '}
            <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Disclaimers and Limitation of Liability</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11.1 Service Availability</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Placesi is provided "as is" and "as available" without warranties of any kind, either express
            or implied. We do not guarantee uninterrupted, timely, secure, or error-free service.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11.2 Content Accuracy</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We do not warrant the accuracy, completeness, or reliability of any property listings, user
            content, or information on the platform. Users rely on such content at their own risk.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11.3 Third-Party Actions</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We are not responsible for the actions, omissions, or conduct of any user, real estate agent,
            agency, mortgage institution, or other third party. We do not guarantee the quality, safety,
            legality, or accuracy of any property or service offered through the platform.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11.4 Limitation of Liability</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            To the maximum extent permitted by Trinidad and Tobago law, Forsmon Technologies Limited,
            its officers, directors, employees, and agents shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, or any loss of profits, revenue, data, or goodwill
            arising from your use of or inability to use the platform, even if we have been advised of the
            possibility of such damages.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Our total liability to you for all claims arising from or relating to the platform shall not
            exceed TTD $1,000 or the amount you paid to us in the 12 months preceding the claim, whichever
            is greater.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Indemnification</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            You agree to indemnify, defend, and hold harmless Forsmon Technologies Limited and its officers,
            directors, employees, agents, and affiliates from any claims, liabilities, damages, losses, and
            expenses, including legal fees, arising from: (a) your use of the platform; (b) your violation
            of these Terms; (c) your violation of any rights of another party; (d) your property listings
            or content; or (e) your real estate or mortgage transactions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Termination</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13.1 By You</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            You may terminate your account at any time by contacting us or using the account deletion
            feature in your profile settings.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13.2 By Us</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We reserve the right to suspend or terminate your account and access to the platform at any
            time, with or without cause or notice, including if you violate these Terms or engage in
            fraudulent, abusive, or illegal activity.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13.3 Effect of Termination</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Upon termination, your right to use the platform will immediately cease. Provisions of these
            Terms that by their nature should survive termination shall survive, including ownership
            provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Dispute Resolution</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.1 Informal Resolution</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Before filing any formal action, you agree to contact us and attempt to resolve any dispute
            informally by sending a detailed notice to the contact information in Section 18.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.2 Governing Law</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the Republic
            of Trinidad and Tobago, without regard to its conflict of law provisions.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.3 Jurisdiction</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Any legal action or proceeding arising from or relating to these Terms or the platform shall
            be brought exclusively in the courts of Trinidad and Tobago. You consent to the personal
            jurisdiction of such courts and waive any objection to venue.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">15. Changes to Terms</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We reserve the right to modify these Terms at any time. We will provide notice of material
            changes by posting the updated Terms on the platform and updating the "Last Updated" date.
            Your continued use of Placesi after changes are posted constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">16. General Provisions</h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">16.1 Entire Agreement</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you
            and Forsmon Technologies Limited regarding the platform.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">16.2 Severability</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            If any provision of these Terms is found to be invalid or unenforceable, the remaining
            provisions shall remain in full force and effect.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">16.3 Waiver</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            No waiver of any term of these Terms shall be deemed a further or continuing waiver of such
            term or any other term.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">16.4 Assignment</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            You may not assign or transfer these Terms or your account without our prior written consent.
            We may assign these Terms without restriction.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">16.5 Force Majeure</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We shall not be liable for any failure or delay in performance due to circumstances beyond
            our reasonable control, including natural disasters, war, terrorism, riots, embargoes, acts
            of civil or military authorities, fire, floods, or communications failures.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">17. Compliance with Laws</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            You agree to comply with all applicable laws and regulations in Trinidad and Tobago, including
            but not limited to real estate licensing laws, fair housing laws, consumer protection laws,
            data protection laws, and anti-money laundering regulations. Real estate professionals must
            maintain all required licenses and professional insurance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">18. Contact Information</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            For questions about these Terms or to report violations, please contact us:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">Forsmon Technologies Limited</p>
            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p>Email: legal@placesi.ai</p>
                <p className="mt-2">Trinidad and Tobago</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">19. Acknowledgment</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            By using Placesi, you acknowledge that you have read, understood, and agree to be bound by
            these Terms of Service.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          For information about how we collect and use your data, please review our{' '}
          <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
