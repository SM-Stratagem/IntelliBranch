import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lastUpdated = "1 June 2026";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16 bg-white min-h-screen">
        <div className="bg-[#F8F9FC] border-b border-[#E2E8F0] py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-3">Legal</div>
            <h1 className="font-fraunces text-4xl font-bold text-[#0B1F3A] tracking-tight mb-3">Privacy Policy</h1>
            <p className="text-sm text-[#64748B]">Last updated: {lastUpdated}</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-16 prose prose-slate max-w-none">
          <style>{`
            .prose h2 { font-family: var(--font-fraunces); font-size: 1.4rem; font-weight: 700; color: #0B1F3A; margin-top: 2.5rem; margin-bottom: 0.75rem; }
            .prose h3 { font-size: 1rem; font-weight: 600; color: #0B1F3A; margin-top: 1.5rem; margin-bottom: 0.5rem; }
            .prose p { color: #475569; font-size: 0.9375rem; line-height: 1.75; margin-bottom: 1rem; }
            .prose ul { color: #475569; font-size: 0.9375rem; line-height: 1.75; padding-left: 1.25rem; }
            .prose li { margin-bottom: 0.4rem; }
            .prose a { color: #0D9488; }
          `}</style>

          <p>This Privacy Policy describes how SM Stratagem ("we", "us", or "our") collects, uses, and protects personal information submitted through the IntelliBranch platform and website (intellibranch.io). By accessing or using IntelliBranch, you agree to the terms of this policy.</p>

          <h2>1. Who We Are</h2>
          <p>IntelliBranch is a product of SM Stratagem, a digital product studio based in Dubai, United Arab Emirates. For all data protection enquiries, contact us at <a href="mailto:contact@sm-stratagem.com">contact@sm-stratagem.com</a>.</p>

          <h2>2. What Information We Collect</h2>
          <h3>Information you provide directly</h3>
          <ul>
            <li>Name, email address, company name, and job title when submitting a contact or demo request</li>
            <li>Account registration details including email and password (hashed and salted)</li>
            <li>Billing information, processed via a PCI-compliant third-party payment provider — we do not store card details</li>
            <li>Communications you send to our support or sales teams</li>
          </ul>
          <h3>Information collected automatically</h3>
          <ul>
            <li>Usage data including pages visited, features accessed, and session duration</li>
            <li>Device and browser information including IP address, operating system, and browser type</li>
            <li>Log data such as access times, error logs, and referring URLs</li>
          </ul>
          <h3>Operational data you connect</h3>
          <p>When you connect your POS, ERP, or other business systems to IntelliBranch, we process the operational and transactional data you authorise. This data is processed solely to provide the platform's analytics and intelligence services and is never used for any other purpose.</p>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain, and improve the IntelliBranch platform</li>
            <li>To respond to demo requests, support queries, and account enquiries</li>
            <li>To send service communications including onboarding emails, product updates, and security notices</li>
            <li>To detect and prevent fraud, abuse, and unauthorised access</li>
            <li>To comply with applicable legal obligations</li>
          </ul>
          <p>We do not sell, rent, or trade your personal information or operational data to third parties under any circumstances.</p>

          <h2>4. Legal Basis for Processing</h2>
          <p>Where GDPR or equivalent data protection law applies, we process personal data on the following legal bases:</p>
          <ul>
            <li><strong>Contract performance</strong> — to fulfil our obligations under your subscription agreement</li>
            <li><strong>Legitimate interests</strong> — to improve our services, detect misuse, and communicate service-related information</li>
            <li><strong>Consent</strong> — where you have explicitly opted in to marketing communications</li>
            <li><strong>Legal obligation</strong> — to comply with applicable laws and regulatory requirements</li>
          </ul>

          <h2>5. Data Storage and Security</h2>
          <p>All data is encrypted in transit using TLS 1.2 or higher and at rest using AES-256 encryption. Each client's data is stored in a fully isolated environment — no client's data is co-mingled with another's. We maintain immutable audit logs and enforce role-based access controls across the platform.</p>
          <p>Data is stored in regional data centres consistent with your data residency preferences. Enterprise customers may specify preferred regions at the time of contract.</p>

          <h2>6. Data Retention</h2>
          <p>We retain personal data for as long as your account is active or as necessary to provide services. Upon account termination, we will delete or anonymise your personal data within 90 days, unless a longer retention period is required by law. Operational data connected via integrations can be deleted on request at any time.</p>

          <h2>7. Third-Party Services</h2>
          <p>We use carefully selected third-party service providers to operate IntelliBranch, including cloud infrastructure providers, payment processors, and analytics tools. These providers are contractually bound to process data only on our instructions and in accordance with this policy. We do not permit third parties to use your data for their own purposes.</p>

          <h2>8. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access a copy of the personal data we hold about you</li>
            <li>Request correction of inaccurate or incomplete data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to or restrict certain processing activities</li>
            <li>Withdraw consent where processing is based on consent</li>
            <li>Lodge a complaint with your local data protection authority</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:contact@sm-stratagem.com">contact@sm-stratagem.com</a>. We will respond within 30 days.</p>

          <h2>9. Cookies</h2>
          <p>IntelliBranch uses strictly necessary cookies to operate the platform and analytical cookies to understand usage patterns. We do not use advertising or tracking cookies. You may disable non-essential cookies through your browser settings, though this may affect platform functionality.</p>

          <h2>10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Where changes are material, we will notify you by email or by a notice on the platform at least 14 days before the changes take effect. Continued use of the platform after that date constitutes acceptance of the updated policy.</p>

          <h2>11. Contact</h2>
          <p>For any questions or concerns regarding this Privacy Policy or how we handle your data, please contact:</p>
          <p>
            <strong>SM Stratagem</strong><br />
            in5 Tech, Dubai Internet City, Dubai, UAE<br />
            <a href="mailto:contact@sm-stratagem.com">contact@sm-stratagem.com</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
