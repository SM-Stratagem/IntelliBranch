"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

const industries = [
  "Retail Chains", "Restaurant & QSR", "Healthcare & Pharmacy",
  "Automotive & Dealerships", "Hospitality & Hotels", "Fitness & Wellness",
  "Education & Training", "Franchise Network", "Logistics & Field Ops", "Other",
];

const locationRanges = ["1 location", "2–5 locations", "6–15 locations", "16–50 locations", "50+ locations"];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", company: "", jobTitle: "",
    industry: "", locations: "", message: "", consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "A valid email address is required";
    if (!form.company.trim()) e.company = "Required";
    if (!form.industry) e.industry = "Please select your industry";
    if (!form.locations) e.locations = "Please select a range";
    if (!form.consent) e.consent = "You must agree to continue";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    // Simulate API call — replace with your actual endpoint
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const field = (name: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-[#0B1F3A] mb-1.5">{label}</label>
      <input
        type={type}
        value={form[name] as string}
        onChange={(e) => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: "" }); }}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg border text-sm text-[#0B1F3A] placeholder-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/40 transition-all ${errors[name] ? "border-red-400 bg-red-50/30" : "border-[#E2E8F0] hover:border-[#CBD5E1]"}`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-6 pt-16">
          <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-[#0D9488]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="text-[#0D9488]" size={28} />
            </div>
            <h2 className="font-fraunces text-2xl font-bold text-[#0B1F3A] mb-3">Request received.</h2>
            <p className="text-[#64748B] text-sm leading-relaxed mb-6">
              Thank you for reaching out. A member of our team will be in touch within one business day to arrange your demonstration.
            </p>
            <p className="text-xs text-[#94A3B8]">
              In the meantime, you can reach us directly at{" "}
              <a href="mailto:contact@sm-stratagem.com" className="text-[#0D9488]">contact@sm-stratagem.com</a>
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-16 bg-[#F8F9FC] min-h-screen">
        {/* Header */}
        <div className="bg-[#0B1F3A] py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#14B8A6] mb-3">Contact</div>
            <h1 className="font-fraunces text-4xl font-bold text-white tracking-tight mb-4">Request a Demonstration</h1>
            <p className="text-white/55 text-lg max-w-xl leading-relaxed">
              Tell us about your business and we will arrange a live walkthrough built around your specific use case and data profile.
            </p>
          </div>
        </div>

        {/* Form + Info */}
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} noValidate className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
              <h2 className="font-fraunces text-xl font-bold text-[#0B1F3A] mb-6">Your details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                {field("firstName", "First name", "text", "Alex")}
                {field("lastName", "Last name", "text", "Smith")}
              </div>
              <div className="mb-5">{field("email", "Work email address", "email", "alex@company.com")}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                {field("company", "Company name", "text", "Acme Group")}
                {field("jobTitle", "Job title", "text", "Head of Operations")}
              </div>

              {/* Industry select */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#0B1F3A] mb-1.5">Industry</label>
                <select
                  value={form.industry}
                  onChange={(e) => { setForm({ ...form, industry: e.target.value }); setErrors({ ...errors, industry: "" }); }}
                  className={`w-full px-4 py-3 rounded-lg border text-sm text-[#0B1F3A] bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/40 transition-all appearance-none ${errors.industry ? "border-red-400" : "border-[#E2E8F0] hover:border-[#CBD5E1]"}`}
                >
                  <option value="">Select your industry</option>
                  {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
                {errors.industry && <p className="text-xs text-red-500 mt-1">{errors.industry}</p>}
              </div>

              {/* Locations */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#0B1F3A] mb-1.5">Number of locations</label>
                <div className="flex flex-wrap gap-2">
                  {locationRanges.map((r) => (
                    <button
                      key={r} type="button"
                      onClick={() => { setForm({ ...form, locations: r }); setErrors({ ...errors, locations: "" }); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form.locations === r ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0D9488] hover:text-[#0D9488]"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {errors.locations && <p className="text-xs text-red-500 mt-1.5">{errors.locations}</p>}
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                  Tell us about your use case <span className="text-[#94A3B8] font-normal">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="What operational challenge are you trying to solve? Which systems are you currently using?"
                  className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0B1F3A] placeholder-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/40 resize-none transition-all hover:border-[#CBD5E1]"
                />
              </div>

              {/* Consent */}
              <div className="mb-7">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => { setForm({ ...form, consent: e.target.checked }); setErrors({ ...errors, consent: "" }); }}
                    className="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] accent-[#0D9488]"
                  />
                  <span className="text-sm text-[#64748B] leading-relaxed">
                    I agree to IntelliBranch's{" "}
                    <a href="/privacy" className="text-[#0D9488] underline underline-offset-2">Privacy Policy</a>{" "}
                    and{" "}
                    <a href="/terms" className="text-[#0D9488] underline underline-offset-2">Terms of Service</a>.
                    I consent to SM Stratagem processing my information to respond to this request.
                  </span>
                </label>
                {errors.consent && <p className="text-xs text-red-500 mt-1.5">{errors.consent}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B1F3A] text-white font-semibold py-3.5 rounded-lg text-sm hover:bg-[#132A4E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Submit Request"}
              </button>

              <p className="text-xs text-[#94A3B8] mt-4 text-center">
                We typically respond within one business day.
              </p>
            </form>
          </div>

          {/* Info sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#0B1F3A] text-sm mb-4">What to expect</h3>
              <ol className="space-y-4">
                {[
                  { n: "1", t: "Confirmation", b: "We'll acknowledge your request within one business day." },
                  { n: "2", t: "Discovery call", b: "A 30-minute call to understand your data environment, systems, and goals." },
                  { n: "3", t: "Live demonstration", b: "A tailored walkthrough of IntelliBranch built around your use case." },
                  { n: "4", t: "Free trial", b: "14 days of full access — no credit card required." },
                ].map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</span>
                    <div>
                      <div className="font-semibold text-[#0B1F3A] text-sm mb-0.5">{s.t}</div>
                      <div className="text-xs text-[#64748B] leading-relaxed">{s.b}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#0B1F3A] text-sm mb-3">Prefer email?</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                You can reach our team directly at any time.
              </p>
              <a href="mailto:contact@sm-stratagem.com" className="text-sm font-medium text-[#0D9488] hover:underline">
                contact@sm-stratagem.com
              </a>
            </div>

            <div className="bg-[#0B1F3A] rounded-2xl p-6">
              <h3 className="font-semibold text-white text-sm mb-2">A product by SM Stratagem</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                A Dubai-based digital product studio building software for enterprises, SMEs, and operators across the region and beyond.
              </p>
              <a
                href="https://www.sm-stratagem.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#14B8A6] hover:underline font-medium"
              >
                Visit sm-stratagem.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
