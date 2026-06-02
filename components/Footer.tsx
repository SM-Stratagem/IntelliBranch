import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-fraunces text-xl font-bold text-[#0B1F3A] mb-1">
              Intelli<span className="text-[#0D9488]">Branch</span>
            </div>
            <p className="text-xs text-[#94A3B8] mb-4">
              A product by{" "}
              <a
                href="https://www.sm-stratagem.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0D9488] transition-colors"
              >
                SM Stratagem
              </a>{" "}
              · Dubai, UAE
            </p>
            <p className="text-sm text-[#64748B] leading-relaxed max-w-xs">
              Branch intelligence for multi-location businesses. Live P&L, AI alerts, and operational clarity — from day one.
            </p>
          </div>

          {/* Platform */}
          <div>
            <div className="text-xs font-bold text-[#0B1F3A] tracking-widest uppercase mb-4">Platform</div>
            <ul className="space-y-2.5">
              {[
                { label: "Use Cases", href: "/#usecases" },
                { label: "Features", href: "/#features" },
                { label: "Security", href: "/#security" },
                { label: "Pricing", href: "/#pricing" },
                { label: "Request a Demo", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[#64748B] hover:text-[#0D9488] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Contact */}
          <div>
            <div className="text-xs font-bold text-[#0B1F3A] tracking-widest uppercase mb-4">Legal</div>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Security", href: "/security" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[#64748B] hover:text-[#0D9488] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <div className="text-xs font-bold text-[#0B1F3A] tracking-widest uppercase mb-3">Contact</div>
              <a
                href="mailto:contact@sm-stratagem.com"
                className="text-sm text-[#64748B] hover:text-[#0D9488] transition-colors"
              >
                contact@sm-stratagem.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#CBD5E1]">
            © {new Date().getFullYear()} SM Stratagem. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-xs text-[#CBD5E1] hover:text-[#64748B] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-[#CBD5E1] hover:text-[#64748B] transition-colors">
              Terms of Service
            </Link>
            <Link href="/security" className="text-xs text-[#CBD5E1] hover:text-[#64748B] transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
