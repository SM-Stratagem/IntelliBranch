import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const pillars = [
  {
    title: "Data Isolation",
    body: "Every client operates in a fully isolated data environment. No two clients' data shares a database, schema, or storage container. Tenant isolation is enforced at the architecture level — not through runtime access controls.",
    tags: ["Dedicated Tenants", "Logical Isolation", "No Data Co-mingling"],
  },
  {
    title: "Encryption",
    body: "All data transmitted to and from the platform is encrypted using TLS 1.2 or higher. All data stored within the platform is encrypted at rest using AES-256. Encryption keys are managed through a dedicated key management service and rotated on a defined schedule.",
    tags: ["TLS 1.2+", "AES-256 at Rest", "Key Rotation"],
  },
  {
    title: "Access Controls",
    body: "The platform enforces role-based access control (RBAC) at the organisation, location, and report level. HQ and portfolio owners have full visibility. Location managers and franchisees see only their own data. All permission changes are logged.",
    tags: ["RBAC", "Granular Permissions", "Franchisee Isolation"],
  },
  {
    title: "Audit Logging",
    body: "All user actions within the platform — including logins, data access, permission changes, and exports — are recorded in immutable audit logs. Logs are retained for a minimum of 12 months and are available to compliance teams on request.",
    tags: ["Immutable Logs", "12-Month Retention", "Compliance Ready"],
  },
  {
    title: "Availability",
    body: "IntelliBranch is hosted on enterprise-grade cloud infrastructure with automated failover and geographic redundancy. We maintain a 99.9% monthly uptime SLA, with real-time status monitoring and incident response procedures in place.",
    tags: ["99.9% SLA", "Auto Failover", "Real-Time Monitoring"],
  },
  {
    title: "Data Residency",
    body: "Enterprise customers may specify their preferred data residency region. Data is stored and processed within the agreed region and does not cross regional boundaries without explicit authorisation. Available regions are confirmed at time of contract.",
    tags: ["Regional Hosting", "Cross-Border Controls", "Enterprise Option"],
  },
];

const compliance = [
  { name: "GDPR", desc: "Aligned with EU General Data Protection Regulation requirements for data processing, retention, and subject rights." },
  { name: "SOC 2 Aligned", desc: "Platform controls are aligned to SOC 2 Trust Services Criteria covering security, availability, and confidentiality." },
  { name: "UAE Data Protection", desc: "Compliant with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection." },
  { name: "ISO 27001 Aligned", desc: "Information security management practices aligned to ISO 27001 standards." },
];

export default function SecurityPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16 bg-white min-h-screen">
        <div className="bg-[#0B1F3A] py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#14B8A6] mb-3">Trust & Security</div>
            <h1 className="font-fraunces text-4xl font-bold text-white tracking-tight mb-4">Security at IntelliBranch</h1>
            <p className="text-white/55 text-lg max-w-2xl leading-relaxed">
              Operational and financial data is among the most sensitive information a business holds. Our security architecture reflects that. Every design decision starts with the question: what happens if this fails?
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="bg-[#F8F9FC] py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-3">Security Architecture</div>
              <h2 className="font-fraunces text-3xl font-bold text-[#0B1F3A] tracking-tight mb-4">Six pillars of platform security</h2>
              <p className="text-[#64748B] leading-relaxed">Each layer of the platform is designed with security and data integrity as a primary constraint, not an afterthought.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pillars.map((p) => (
                <div key={p.title} className="bg-white border border-[#E2E8F0] rounded-xl p-7">
                  <h3 className="font-semibold text-[#0B1F3A] text-base mb-3">{p.title}</h3>
                  <p className="text-[#64748B] text-sm leading-relaxed mb-4">{p.body}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[10px] font-bold tracking-wide px-2.5 py-1 rounded bg-[#0D9488]/08 border border-[#0D9488]/20 text-[#0D9488] uppercase">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-3">Compliance</div>
              <h2 className="font-fraunces text-3xl font-bold text-[#0B1F3A] tracking-tight mb-4">Standards and frameworks</h2>
              <p className="text-[#64748B] leading-relaxed">IntelliBranch's security controls are aligned to recognised international and regional standards.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {compliance.map((c) => (
                <div key={c.name} className="flex gap-4 p-6 border border-[#E2E8F0] rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-[#0D9488] flex-shrink-0 mt-2" />
                  <div>
                    <div className="font-semibold text-[#0B1F3A] text-sm mb-1">{c.name}</div>
                    <div className="text-xs text-[#64748B] leading-relaxed">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Responsible disclosure */}
        <div className="py-16 px-6 bg-[#F8F9FC] border-t border-[#E2E8F0]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-fraunces text-2xl font-bold text-[#0B1F3A] mb-4">Responsible Disclosure</h2>
            <p className="text-[#64748B] text-sm leading-relaxed mb-6">
              If you believe you have discovered a security vulnerability in IntelliBranch, please report it to us privately before public disclosure. We investigate all reports promptly and will acknowledge receipt within 2 business days.
            </p>
            <a
              href="mailto:contact@sm-stratagem.com?subject=Security Disclosure"
              className="inline-block bg-[#0B1F3A] text-white font-semibold text-sm px-7 py-3.5 rounded-md hover:bg-[#132A4E] transition-colors"
            >
              Report a Vulnerability
            </a>
            <p className="text-xs text-[#94A3B8] mt-4">
              For all other enquiries, see our <Link href="/contact" className="text-[#0D9488]">Contact page</Link>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
