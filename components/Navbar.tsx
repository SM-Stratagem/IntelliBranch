"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Use Cases", href: "/#usecases" },
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/#security" },
  { label: "Pricing", href: "/#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm"
          : "bg-white/90 backdrop-blur-sm border-b border-[#E2E8F0]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Left: logo + by line */}
        <div className="flex items-center gap-4">
          <Link href="/" className="font-fraunces text-xl font-bold text-[#0B1F3A] tracking-tight">
            Intelli<span className="text-[#0D9488]">Branch</span>
          </Link>
          <span className="hidden sm:block text-xs text-[#94A3B8] font-medium">
            by{" "}
            <a
              href="https://www.sm-stratagem.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0D9488] transition-colors"
            >
              SM Stratagem
            </a>
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-[#64748B] hover:text-[#0B1F3A] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="bg-[#0B1F3A] text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-[#132A4E] transition-colors"
          >
            Request Demo
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#0B1F3A] p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-[#E2E8F0] shadow-lg md:hidden">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-[#64748B] hover:text-[#0B1F3A]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="bg-[#0B1F3A] text-white text-sm font-semibold px-5 py-2.5 rounded-md text-center hover:bg-[#132A4E] transition-colors"
            >
              Request Demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
