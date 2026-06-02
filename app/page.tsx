import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Minus } from "lucide-react";

const useCases = [
  { sector: "Retail", name: "Retail Chains & Multi-Brand Groups", desc: "Inventory ageing, basket size analysis, markdown optimisation, sell-through rates, and category-level margin tracking across every location." },
  { sector: "Food & Beverage", name: "Restaurant & QSR Groups", desc: "Menu engineering, waste tracking, delivery platform revenue splits, table turnover, kitchen throughput, and labour cost per cover." },
  { sector: "Healthcare", name: "Clinic & Pharmacy Networks", desc: "Product dispensing trends, appointment utilisation, compliance reporting, staff scheduling optimisation, and supplier reorder intelligence." },
  { sector: "Automotive", name: "Dealerships & Service Centres", desc: "Service bay utilisation, parts inventory tracking, technician productivity, service revenue vs vehicle sales mix, and warranty cost monitoring." },
  { sector: "Hospitality", name: "Hotels & Serviced Residences", desc: "RevPAR tracking, occupancy forecasting, F&B outlet performance, housekeeping labour efficiency, and cross-property benchmarking." },
  { sector: "Fitness & Wellness", name: "Gym & Spa Chains", desc: "Membership utilisation rates, class fill rates, personal training revenue, product retail mix, and peak hour staffing optimisation." },
  { sector: "Education", name: "Training Centres & Schools", desc: "Enrolment trends, student-to-staff ratios, facility utilisation, revenue per programme, and multi-campus performance comparison." },
  { sector: "Franchise", name: "Franchise Networks & Holding Groups", desc: "Franchisee-level dashboards with HQ oversight, royalty reconciliation, compliance tracking, and aggregated group P&L reporting." },
  { sector: "Logistics & Field Ops", name: "Distribution & Field Service Networks", desc: "Route performance, depot throughput, SLA adherence, technician utilisation, and cost-per-delivery or cost-per-job tracking." },
];

const features = [
  { cat: "Financial", name: "Live Revenue & P&L", desc: "Real-time gross revenue, net revenue, and margin by branch, by product category, or by time period. No waiting for month-end reports." },
  { cat: "Operational", name: "Daily Performance Heatmaps", desc: "Identify exactly which hours, days, and locations drive or drag performance. Staff, stock, and promote with precision rather than assumption." },
  { cat: "Intelligence", name: "AI Anomaly Alerts", desc: "Proactive notification when KPIs deviate from expected ranges — revenue drops, margin erosion, return spikes — before they compound.", badge: "AI" },
  { cat: "Planning", name: "Demand Forecasting", desc: "Forward-looking projections built on historical patterns, seasonality, promotional calendars, and local event data.", badge: "AI" },
  { cat: "Strategy", name: "What-If Scenario Modelling", desc: "Model the financial impact of pricing changes, headcount adjustments, opening hours, or new locations using your own data, not industry averages." },
  { cat: "Multi-Site", name: "Cross-Branch Benchmarking", desc: "Rank every location against each other and against a portfolio baseline. Surface structural underperformers and replicate what your best branches do differently." },
  { cat: "Supply Chain", name: "Inventory & Replenishment AI", desc: "Automated monitoring of stock velocity, ageing inventory, and reorder thresholds. Restocking prompts before shortfalls, markdown signals before write-offs.", badge: "AI" },
  { cat: "Workforce", name: "Staff Productivity Tracking", desc: "Revenue-per-head, transactions-per-hour, and labour cost as a percentage of revenue by role, by shift, and by location." },
  { cat: "Reporting", name: "Automated Daily Digest", desc: "Branch and portfolio summaries delivered to stakeholders each morning via email or messaging platforms. Yesterday's performance and today's priorities, automatically.", badge: "New" },
];

const diffs = [
  { n: "01", t: "No analysts required", b: "Every screen is designed for the operator, not the data scientist. Insights are surfaced in plain language with clear recommended actions." },
  { n: "02", t: "Native system integrations", b: "Direct connections to POS, ERP, inventory, and HR platforms. No manual exports, no CSV uploads, no data entry intermediaries." },
  { n: "03", t: "AI embedded throughout", b: "Machine learning underpins forecasting, anomaly detection, inventory intelligence, and the automated digest — not bolted on as an afterthought." },
  { n: "04", t: "Franchise and HQ architecture", b: "HQ and portfolio owners see the full picture. Franchisees and location managers see only their own data. Isolation and permissions are structural, not configured." },
  { n: "05", t: "Scales without replacement", b: "From a single pilot location to an estate of hundreds of sites, across geographies, without migrating platforms or renegotiating contracts." },
];

const secTags = ["AES-256 Encryption","GDPR Compliant","SOC 2 Aligned","Full Tenant Isolation","Role-Based Access Control","Immutable Audit Logs","99.9% Uptime SLA","Regional Data Residency"];

const plans = [
  { tier: "Starter", price: "$149", per: "/mo", featured: false, desc: "For single-location businesses beginning their data intelligence journey.", items: [{ t: "1 location", ok: true },{ t: "Live revenue, P&L and heatmaps", ok: true },{ t: "Product and sales analytics", ok: true },{ t: "1 system integration", ok: true },{ t: "Email support", ok: true },{ t: "AI forecasting and alerts", ok: false },{ t: "Multi-branch benchmarking", ok: false },{ t: "What-if modelling", ok: false },{ t: "Automated daily digest", ok: false }] },
  { tier: "Growth", price: "$399", per: "/mo", featured: true, desc: "For expanding multi-location businesses needing real-time intelligence across their estate. Up to 10 locations.", items: [{ t: "Up to 10 locations", ok: true },{ t: "Everything in Starter", ok: true },{ t: "AI forecasting and anomaly alerts", ok: true },{ t: "Multi-branch benchmarking", ok: true },{ t: "What-if scenario modelling", ok: true },{ t: "Staff productivity and inventory AI", ok: true },{ t: "Automated daily digest", ok: true },{ t: "All system integrations", ok: true },{ t: "Priority support and onboarding call", ok: true }] },
  { tier: "Enterprise", price: "Custom", per: "", featured: false, desc: "For chains, franchise groups, and holding companies with complex multi-site or multi-market requirements.", items: [{ t: "Unlimited locations", ok: true },{ t: "Everything in Growth", ok: true },{ t: "Franchisee portal with HQ oversight", ok: true },{ t: "SSO and advanced access controls", ok: true },{ t: "Regional data residency options", ok: true },{ t: "Custom ERP and finance integrations", ok: true },{ t: "Dedicated account management", ok: true },{ t: "White-label licensing available", ok: true },{ t: "SLA credits and quarterly reviews", ok: true }] },
];

export default function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="bg-[#0B1F3A] pt-16 min-h-[92vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2.5 text-[#14B8A6] text-xs font-semibold tracking-[0.12em] uppercase mb-6">
              <span className="w-6 h-px bg-[#14B8A6]" />
              Branch Intelligence Platform
            </div>
            <h1 className="font-fraunces text-5xl lg:text-[58px] font-bold leading-[1.06] tracking-[-0.03em] text-white mb-6">
              Your operational data should{" "}
              <em className="text-[#14B8A6] not-italic italic">drive</em>{" "}
              your decisions.
            </h1>
            <p className="text-lg text-white/55 leading-relaxed mb-10 max-w-[460px]">
              IntelliBranch connects to your existing systems and transforms operational data into live P&L, AI-powered alerts, cross-branch benchmarking, and forward-looking forecasts — without analysts, without delay.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="bg-[#0D9488] text-white font-semibold text-sm px-7 py-3.5 rounded-md hover:bg-[#14B8A6] transition-colors">
                Request a Demo
              </Link>
              <Link href="#features" className="border border-white/20 text-white/75 font-medium text-sm px-7 py-3.5 rounded-md hover:border-white/40 hover:text-white transition-all">
                Explore the Platform
              </Link>
            </div>
          </div>
          <div className="animate-fade-up-delay hidden lg:block">
            <div className="bg-[#0D1E35] border border-white/[0.08] rounded-2xl p-7 shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative">
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#0D9488]/50 to-transparent" />
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-bold tracking-[0.12em] text-white/30 uppercase">Branch Performance Overview</span>
                <span className="text-[10px] font-semibold text-[#14B8A6] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-blink" /> Live
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[{ l:"Revenue Today",v:"+18,420",d:"+12% vs prior week",t:true},{l:"Avg Transaction",v:"247.00",d:"+4.1% this period",t:false},{l:"Gross Margin",v:"63.2%",d:"−1.3% vs target",t:false,neg:true},{l:"Staff Utilisation",v:"91%",d:"Within target range",t:true}].map((k)=>(
                  <div key={k.l} className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3.5">
                    <div className="text-[9px] text-white/30 uppercase tracking-[0.1em] mb-1.5 font-semibold">{k.l}</div>
                    <div className={`font-fraunces text-xl font-semibold leading-none mb-1 ${k.t?"text-[#14B8A6]":"text-white"}`}>{k.v}</div>
                    <div className={`text-[10px] ${(k as any).neg?"text-red-400":"text-emerald-400"}`}>{k.d}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-1 h-14 mb-3">
                {[34,54,70,88,62,76,44,100,58,50,38,68].map((h,i)=>(
                  <div key={i} className={`flex-1 rounded-t-sm ${h===100||h===88?"bg-[#0D9488]":"bg-[#0D9488]/20"}`} style={{height:`${h}%`}} />
                ))}
              </div>
              <div className="bg-[#B45309]/10 border border-[#B45309]/20 rounded-lg px-3 py-2.5 text-[11px] text-yellow-200/80 flex gap-2 items-start">
                <span className="font-bold text-yellow-400 flex-shrink-0 mt-px">!</span>
                Slow-moving inventory detected across 3 SKUs — markdown review recommended
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-3">The Problem</div>
            <h2 className="font-fraunces text-[42px] font-bold text-[#0B1F3A] leading-tight tracking-tight mb-4">Multi-location businesses carry data they cannot use.</h2>
            <p className="text-[#64748B] text-lg leading-relaxed">Your POS, your ERP, your spreadsheets, and your managers' reports contain everything you need — but none of it speaks to each other, and none of it tells you what to do next.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[{n:"01",t:"Decisions made without data",b:"Teams default to intuition and memory. Margin erosion, stockouts, and underperformance go undetected for weeks at a time."},{n:"02",t:"Fragmented systems, no single view",b:"Sales, inventory, staffing, and finance live in separate platforms. Reconciling them takes hours of manual work every week."},{n:"03",t:"Scale without visibility",b:"As locations multiply, comparing branch-level performance and holding each site accountable becomes a structural problem spreadsheets cannot solve."}].map((p)=>(
              <div key={p.n} className="border border-[#E2E8F0] rounded-xl p-8 bg-white hover:shadow-lg transition-shadow">
                <div className="font-fraunces text-5xl font-bold text-[#E2E8F0] leading-none mb-4">{p.n}</div>
                <h3 className="font-semibold text-[#0B1F3A] text-base mb-3">{p.t}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{p.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="usecases" className="py-24 bg-[#F8F9FC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-3">Use Cases</div>
            <h2 className="font-fraunces text-[42px] font-bold text-[#0B1F3A] leading-tight tracking-tight mb-4">Built for any business with multiple locations.</h2>
            <p className="text-[#64748B] text-lg leading-relaxed">IntelliBranch is sector-agnostic. If your business has branches, locations, or franchises that generate operational data, the platform is built for you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc)=>(
              <div key={uc.sector} className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:border-[#0D9488]/40 hover:shadow-md transition-all">
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-2">{uc.sector}</div>
                <h4 className="font-semibold text-[#0B1F3A] text-[15px] mb-2 leading-snug">{uc.name}</h4>
                <p className="text-[#64748B] text-[13px] leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-3">Platform Capabilities</div>
            <h2 className="font-fraunces text-[42px] font-bold text-[#0B1F3A] leading-tight tracking-tight mb-4">Every layer of your operation, on a single screen.</h2>
            <p className="text-[#64748B] text-lg leading-relaxed">Connect your data sources once. IntelliBranch handles ingestion, normalisation, and analysis — giving every stakeholder a view calibrated to their role.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f)=>(
              <div key={f.name} className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:border-[#0D9488]/40 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#0D9488]">{f.cat}</span>
                  {f.badge&&<span className="text-[9px] font-bold bg-[#0D9488]/10 text-[#0D9488] px-1.5 py-0.5 rounded tracking-wide">{f.badge}</span>}
                </div>
                <h3 className="font-semibold text-[#0B1F3A] text-[15px] mb-2">{f.name}</h3>
                <p className="text-[#64748B] text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-[#F8F9FC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#E2E8F0] border border-[#E2E8F0] rounded-2xl overflow-hidden">
            {[{v:"2",u:"hrs",l:"Average time to first insight"},{v:"20",u:"+",l:"System integrations supported"},{v:"6",u:"mo",l:"Typical payback period"},{v:"99.9",u:"%",l:"Contractual uptime SLA"}].map((s)=>(
              <div key={s.l} className="bg-white px-8 py-10 text-center">
                <div className="font-fraunces text-5xl font-bold text-[#0B1F3A] leading-none mb-1">{s.v}<span className="text-[#0D9488]">{s.u}</span></div>
                <div className="text-sm text-[#64748B] mt-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY + SECURITY */}
      <section id="security" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-3">Why IntelliBranch</div>
            <h2 className="font-fraunces text-[42px] font-bold text-[#0B1F3A] leading-tight tracking-tight mb-4">Purpose-built for operators. Not repurposed from elsewhere.</h2>
            <p className="text-[#64748B] text-lg leading-relaxed">Generic BI tools require analysts and months of configuration. IntelliBranch is pre-configured for multi-location operations and live from day one.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-7">
              {diffs.map((d)=>(
                <div key={d.n} className="flex gap-5">
                  <span className="font-fraunces text-sm font-bold text-[#0D9488] mt-0.5 w-7 flex-shrink-0">{d.n}</span>
                  <div>
                    <h4 className="font-semibold text-[#0B1F3A] text-[15px] mb-1.5">{d.t}</h4>
                    <p className="text-[#64748B] text-sm leading-relaxed">{d.b}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#0B1F3A] rounded-2xl p-9 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0D9488] to-[#14B8A6]" />
              <h3 className="font-fraunces text-2xl font-bold text-white mb-4">Data Security & Compliance</h3>
              <p className="text-sm text-white/55 leading-relaxed mb-4">Operational and financial data is among the most sensitive information a business holds. IntelliBranch is architected on the principle that no two clients' data should ever share an environment — full tenant isolation is structural, not configured at runtime.</p>
              <p className="text-sm text-white/55 leading-relaxed mb-6">All data is encrypted in transit and at rest. Access is governed by role-based controls down to the individual report and branch level. Audit logs are immutable and available to compliance teams on demand.</p>
              <div className="flex flex-wrap gap-2">
                {secTags.map((t)=>(<span key={t} className="text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-md bg-[#0D9488]/10 border border-[#0D9488]/25 text-[#14B8A6] uppercase">{t}</span>))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-[#F8F9FC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#0D9488] mb-3">Pricing</div>
            <h2 className="font-fraunces text-[42px] font-bold text-[#0B1F3A] leading-tight tracking-tight mb-4">Transparent pricing. Designed to scale with you.</h2>
            <p className="text-[#64748B] text-lg leading-relaxed">No per-user fees. No hidden charges. Pay by number of locations. All plans include a 14-day trial — no payment details required.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {plans.map((p)=>(
              <div key={p.tier} className={`relative rounded-2xl p-8 border transition-shadow ${p.featured?"bg-[#0B1F3A] border-[#0B1F3A] shadow-[0_20px_60px_rgba(11,31,58,0.28)]":"bg-white border-[#E2E8F0] hover:shadow-lg"}`}>
                {p.featured&&(<>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] rounded-t-2xl" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0D9488] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-full whitespace-nowrap">Most Popular</div>
                </>)}
                <div className={`text-[11px] font-bold tracking-[0.12em] uppercase mb-3 ${p.featured?"text-white/40":"text-[#64748B]"}`}>{p.tier}</div>
                <div className={`font-fraunces font-bold leading-none mb-2 ${p.featured?"text-white":"text-[#0B1F3A]"}`}>
                  <span className={p.price==="Custom"?"text-4xl":"text-5xl"}>{p.price}</span>
                  {p.per&&<span className={`text-sm font-normal ml-1 ${p.featured?"text-white/40":"text-[#64748B]"}`}>{p.per}</span>}
                </div>
                <p className={`text-sm leading-relaxed pb-5 mb-5 border-b ${p.featured?"text-white/50 border-white/10":"text-[#64748B] border-[#E2E8F0]"}`}>{p.desc}</p>
                <ul className="space-y-3 mb-7">
                  {p.items.map((item)=>(
                    <li key={item.t} className="flex gap-3 items-start">
                      {item.ok?<CheckCircle size={15} className="text-[#0D9488] flex-shrink-0 mt-0.5" />:<Minus size={15} className={`flex-shrink-0 mt-0.5 ${p.featured?"text-white/20":"text-[#E2E8F0]"}`} />}
                      <span className={`text-sm ${item.ok?(p.featured?"text-white/80":"text-[#64748B]"):(p.featured?"text-white/25":"text-[#CBD5E1]")}`}>{item.t}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className={`block w-full text-center py-3 rounded-lg text-sm font-semibold transition-all ${p.featured?"bg-white/10 text-white border border-white/20 hover:bg-white/16":p.tier==="Enterprise"?"border border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488] hover:text-white":"border border-[#E2E8F0] text-[#0B1F3A] hover:border-[#0D9488] hover:text-[#0D9488]"}`}>
                  {p.tier==="Enterprise"?"Contact Sales":"Start Free Trial"}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#94A3B8] mt-7 italic">All plans include a 14-day free trial · No credit card required · Cancel at any time</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0B1F3A] py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="font-fraunces text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-5">See your business with clarity.</h2>
          <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-xl mx-auto">IntelliBranch is deployed and producing insights within hours of connection. Request a demonstration and we will walk through a live build against your own data profile.</p>
          <Link href="/contact" className="inline-block bg-[#0D9488] text-white font-semibold text-base px-9 py-4 rounded-lg hover:bg-[#14B8A6] transition-colors">Request a Demonstration</Link>
          <p className="text-white/30 text-xs mt-5">14-day free trial · No credit card required · Live in under 2 hours</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
