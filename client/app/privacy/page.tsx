import type { Metadata } from 'next';

import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy – Grainzz',
  description: 'Privacy Policy for Grainzz — how we collect, use, and protect your information.',
  path: '/privacy',
});

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-[48px] md:py-[64px]">
      <div className="max-w-[720px] mx-auto px-[20px] md:px-[40px]">
        {/* Title */}
        <h1 className="text-[32px] md:text-[40px] font-bold text-brand-black text-center tracking-tight leading-[1.15] mb-[8px]" style={{ fontFamily: 'serif' }}>
          Privacy Policy
        </h1>
        <p className="text-[13px] text-[#888] text-left mb-[40px] md:mb-[48px]">
          Last updated: January 21, 2025
        </p>

        {/* Content */}
        <div className="space-y-[32px] md:space-y-[40px] text-[14px] md:text-[15px] leading-[1.75] text-[#333] font-normal">

          {/* Scope */}
          <section>
            <h2 className="text-[18px] md:text-[20px] font-bold text-brand-black mb-[12px] leading-[1.3]">Scope of this Policy</h2>
            <p className="mb-[12px]">This privacy policy applies to:</p>
            <ol className="list-decimal pl-[24px] space-y-[6px] mb-[16px]">
              <li>GRAINZZ by Vitalicious and our affiliates (&quot;GRAINZZ,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;).</li>
              <li>GRAINZZ&apos;s online properties, including our websites, and websites or mobile applications that link to it, and our social media pages or handles (&quot;Sites&quot;).</li>
            </ol>
            <p className="mb-[12px]">
              This Policy applies when you interact with us through our Sites. It also applies anywhere it is linked. It does not apply to third-party websites, mobile applications, or services that may link to the Sites or be linked to from the Sites. Please review the privacy policies on those websites and applications directly to understand their privacy practices.
            </p>
            <p>
              We may change this Policy from time to time. If we do, we will notify you by posting the updated version.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-[22px] md:text-[24px] font-bold text-brand-black mb-[12px] leading-[1.3]">Information We Collect</h2>
            <p>
              We collect information from you directly, from the devices you use to interact with us, and from third parties. We may combine information from the Sites together and with other information we obtain from our business records. We may use and share information that we aggregate (compile to create statistics that cannot identify a particular individual) or de-identify (strip information of all unique identifiers such that it cannot be linked to a particular individual) at our discretion.
            </p>
          </section>

          {/* Information you give us */}
          <section>
            <h2 className="text-[18px] md:text-[20px] font-bold text-brand-black mb-[12px] leading-[1.3]">Information you give us</h2>
            <p className="mb-[12px]">You may provide the following information to us directly:</p>
            <ul className="list-disc pl-[24px] space-y-[6px]">
              <li>Contact and professional information, including name, postal address, email address, telephone number, and job title, as well as company name and size.</li>
              <li>Account registration information.</li>
              <li>Demographic information.</li>
              <li>Payment information, including credit card information.</li>
              <li>Content you may include in surveys, panels, or market research responses.</li>
              <li>Information contained in your communications to us, including communication to customer service.</li>
              <li>Information you provide when participating in special events, promotions, contests or sweepstakes.</li>
              <li>Information you make available to us via a social media platform.</li>
              <li>Any information or data you provide by interacting in our online forums and chatrooms, or by commenting on content posted on our Sites. Please note that these comments are also visible to other users of our Sites.</li>
              <li>Information you submit to inquire about or apply for a job with us.</li>
              <li>Any other information you submit to us.</li>
            </ul>
          </section>

          {/* Information we collect automatically */}
          <section>
            <h2 className="text-[18px] md:text-[20px] font-bold text-brand-black mb-[12px] leading-[1.3]">Information we collect automatically</h2>
            <p className="mb-[12px]">
              We and partners working on our behalf may use log files, cookies, or other digital tracking technologies to collect the following information from the device you use to interact with our Sites. We also create records when you make purchases or otherwise interact with the Sites.
            </p>
            <ul className="list-disc pl-[24px] space-y-[6px]">
              <li>Device information, including IP address, time zone or location, device identifiers, mobile ad identifiers, device model and operating system, mobile network carrier, and details about your web browser.</li>
              <li>Analytical information, including details about your interaction with our website, app, and electronic newsletters.</li>
              <li>Diagnostic information, including web traffic logs.</li>
              <li>Advertising information, including special advertising and other unique identifiers that enable us or third parties working on our behalf to target advertisements to you. Please be aware that our advertising partners may collect information about you when you visit third-party websites or use third-party apps. They may use that information to better target advertisements to you on our behalf.</li>
              <li>Business record information, including records of your purchases of products and services.</li>
            </ul>
            <p className="mt-[16px]">
              The following is a list of our partners who collect the information described above. Please follow the links to find out more information about the partner&apos;s privacy practices.
            </p>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-[22px] md:text-[24px] font-bold text-brand-black mb-[12px] leading-[1.3]">How We Use Information</h2>
            <p className="mb-[12px]">We may use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-[24px] space-y-[6px]">
              <li>To provide and manage the products and services you request, including processing transactions and sending related information such as purchase confirmations and order status updates.</li>
              <li>To communicate with you, including responding to your comments, questions, and requests, and providing customer service.</li>
              <li>To send you technical notices, updates, security alerts, and administrative messages.</li>
              <li>To personalize your experience and deliver content and product offerings relevant to your interests.</li>
              <li>To monitor and analyze trends, usage, and activities in connection with our services.</li>
              <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
              <li>To comply with legal obligations and enforce our terms and policies.</li>
            </ul>
          </section>

          {/* How We Share Information */}
          <section>
            <h2 className="text-[22px] md:text-[24px] font-bold text-brand-black mb-[12px] leading-[1.3]">How We Share Information</h2>
            <p className="mb-[12px]">We may share data about you in the following ways:</p>
            <ul className="list-disc pl-[24px] space-y-[6px]">
              <li><strong>With service providers:</strong> We share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
              <li><strong>For legal reasons:</strong> We may share information if we believe disclosure is in accordance with any applicable law, regulation, or legal process.</li>
              <li><strong>To protect rights:</strong> We may share information to protect the rights, property, and safety of Grainzz, our customers, or others.</li>
              <li><strong>With your consent:</strong> We may share information with your consent or at your direction.</li>
              <li><strong>In aggregated form:</strong> We may share aggregated or de-identified information that cannot reasonably be used to identify you.</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-[22px] md:text-[24px] font-bold text-brand-black mb-[12px] leading-[1.3]">Data Security</h2>
            <p>
              We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no internet or electronic storage system is completely secure, and we cannot guarantee the absolute security of your information. We encourage you to use appropriate security measures, such as using strong passwords and keeping your login credentials confidential.
            </p>
          </section>

          {/* Your Rights & Choices */}
          <section>
            <h2 className="text-[22px] md:text-[24px] font-bold text-brand-black mb-[12px] leading-[1.3]">Your Rights &amp; Choices</h2>
            <ul className="list-disc pl-[24px] space-y-[6px]">
              <li><strong>Account Information:</strong> You may update, correct, or delete your account information at any time by logging into your account settings.</li>
              <li><strong>Cookies:</strong> Most web browsers are set to accept cookies by default. You can usually choose to set your browser to remove or reject browser cookies.</li>
              <li><strong>Promotional Communications:</strong> You may opt out of receiving promotional emails from us by following the instructions in those messages. If you opt out, we may still send you non-promotional emails, such as those about your account or our ongoing business relations.</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-[22px] md:text-[24px] font-bold text-brand-black mb-[12px] leading-[1.3]">Children&apos;s Privacy</h2>
            <p>
              Our Sites are not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we learn we have collected or received personal information from a child under 13, we will delete that information promptly.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-[22px] md:text-[24px] font-bold text-brand-black mb-[12px] leading-[1.3]">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:contact@grainzzindia.com" className="text-brand-green underline hover:no-underline">contact@grainzzindia.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
