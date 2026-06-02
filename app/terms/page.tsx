import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lastUpdated = "1 June 2026";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16 bg-white min-h-screen">
        <div className="bg-[#F8F9FC] border-b border-[#E2E8F0] py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-3">Legal</div>
            <h1 className="font-fraunces text-4xl font-bold text-[#0B1F3A] tracking-tight mb-3">Terms of Service</h1>
            <p className="text-sm text-[#64748B]">Last updated: {lastUpdated}</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-16">
          <style>{`
            .legal h2 { font-family: var(--font-fraunces); font-size: 1.35rem; font-weight: 700; color: #0B1F3A; margin-top: 2.5rem; margin-bottom: 0.75rem; }
            .legal h3 { font-size: 1rem; font-weight: 600; color: #0B1F3A; margin-top: 1.5rem; margin-bottom: 0.5rem; }
            .legal p { color: #475569; font-size: 0.9375rem; line-height: 1.75; margin-bottom: 1rem; }
            .legal ul { color: #475569; font-size: 0.9375rem; line-height: 1.75; padding-left: 1.25rem; margin-bottom: 1rem; }
            .legal li { margin-bottom: 0.4rem; }
            .legal a { color: #0D9488; }
          `}</style>
          <div className="legal">

          <p>These Terms of Service ("Terms") govern your access to and use of IntelliBranch, a product of SM Stratagem. By accessing or using IntelliBranch, you agree to be bound by these Terms. If you are using IntelliBranch on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.</p>

          <h2>1. Definitions</h2>
          <ul>
            <li><strong>"Platform"</strong> means the IntelliBranch software-as-a-service application and associated services</li>
            <li><strong>"Customer"</strong> means the individual or entity subscribing to the Platform</li>
            <li><strong>"Customer Data"</strong> means all data uploaded to or processed through the Platform by the Customer</li>
            <li><strong>"Subscription"</strong> means the paid or trial access arrangement set out in an Order Form or accepted online</li>
          </ul>

          <h2>2. Access and Use</h2>
          <p>Subject to these Terms and payment of applicable fees, SM Stratagem grants the Customer a non-exclusive, non-transferable right to access and use the Platform during the Subscription term for the Customer's internal business operations.</p>
          <p>The Customer agrees not to:</p>
          <ul>
            <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
            <li>Use the Platform for any unlawful purpose or in violation of applicable regulations</li>
            <li>Resell, sublicense, or otherwise transfer access to the Platform to third parties, except as permitted under an Enterprise or white-label agreement</li>
            <li>Attempt to gain unauthorised access to the Platform or its underlying infrastructure</li>
            <li>Use the Platform to transmit malicious code, spam, or any content that infringes third-party rights</li>
          </ul>

          <h2>3. Free Trial</h2>
          <p>SM Stratagem may offer a free trial period of up to 14 days. During the trial, all Platform features available under the applicable plan are accessible at no charge. At the end of the trial, continued access requires a paid subscription. No credit card is required to commence a trial. SM Stratagem reserves the right to modify or terminate free trial terms at any time.</p>

          <h2>4. Subscriptions and Payment</h2>
          <p>Subscriptions are billed monthly or annually in advance, as selected at checkout. All fees are stated in US dollars and are exclusive of applicable taxes. Invoices are due upon issuance. Where payment fails, access to the Platform may be suspended after a reasonable grace period.</p>
          <p>Pricing is subject to change. SM Stratagem will provide at least 30 days' written notice before any price increase takes effect for existing subscribers.</p>

          <h2>5. Customer Data</h2>
          <p>The Customer retains all ownership of Customer Data. SM Stratagem processes Customer Data solely to provide the Platform and associated services. SM Stratagem will not use Customer Data for any other purpose, including training AI models, advertising, or benchmarking against other customers' data.</p>
          <p>The Customer is responsible for ensuring it has the lawful right to submit Customer Data to the Platform, and that doing so does not violate any applicable law or third-party agreement.</p>

          <h2>6. Data Security and Availability</h2>
          <p>SM Stratagem will implement and maintain commercially reasonable technical and organisational measures to protect Customer Data. The Platform is provided with a 99.9% monthly uptime service level commitment. In the event of downtime exceeding this threshold, Customers on eligible plans may request service credits as set out in the applicable Order Form.</p>

          <h2>7. Confidentiality</h2>
          <p>Each party agrees to maintain the confidentiality of the other party's non-public information disclosed in connection with these Terms and not to disclose such information to third parties without prior written consent. This obligation survives termination of the agreement for a period of three years.</p>

          <h2>8. Intellectual Property</h2>
          <p>SM Stratagem retains all intellectual property rights in the Platform, including its design, algorithms, models, and documentation. No rights are granted to the Customer other than those expressly set out in these Terms. Feedback or suggestions provided by the Customer may be incorporated into the Platform without obligation or compensation.</p>

          <h2>9. Warranties and Disclaimers</h2>
          <p>SM Stratagem warrants that the Platform will perform materially in accordance with its documentation during the Subscription term. To the extent permitted by law, all other warranties — including implied warranties of merchantability and fitness for a particular purpose — are disclaimed. The Platform is not a substitute for professional financial, legal, or operational advice.</p>

          <h2>10. Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, SM Stratagem's total liability to the Customer arising out of or related to these Terms shall not exceed the fees paid by the Customer in the 12 months preceding the claim. SM Stratagem shall not be liable for indirect, consequential, incidental, or punitive damages, even if advised of the possibility of such damages.</p>

          <h2>11. Term and Termination</h2>
          <p>These Terms commence on the date the Customer first accesses the Platform and continue for the duration of the active Subscription. Either party may terminate for material breach upon 30 days' written notice if the breach is not remedied within that period. Upon termination, the Customer's access will cease and Customer Data will be deleted within 90 days, subject to legal retention obligations.</p>

          <h2>12. Governing Law</h2>
          <p>These Terms are governed by the laws of the United Arab Emirates. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of the Dubai International Financial Centre (DIFC), unless otherwise agreed in writing.</p>

          <h2>13. Changes to These Terms</h2>
          <p>SM Stratagem may update these Terms from time to time. Material changes will be communicated with at least 14 days' notice. Continued use of the Platform after that date constitutes acceptance of the updated Terms.</p>

          <h2>14. Contact</h2>
          <p>
            <strong>SM Stratagem</strong><br />
            in5 Tech, Dubai Internet City, Dubai, UAE<br />
            <a href="mailto:contact@sm-stratagem.com">contact@sm-stratagem.com</a>
          </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
