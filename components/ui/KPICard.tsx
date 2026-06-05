import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Sparkline from "./Sparkline";

export default function KPICard({
  label,
  value,
  delta,
  icon: Icon,
  spark,
  sub,
  /** When true a positive delta is bad (e.g. costs) and shown red. */
  invertDelta = false,
}: {
  label: string;
  value: string;
  delta?: number;
  icon?: LucideIcon;
  spark?: number[];
  sub?: string;
  invertDelta?: boolean;
}) {
  const hasDelta = typeof delta === "number";
  const positive = (delta ?? 0) >= 0;
  const good = invertDelta ? !positive : positive;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="font-fraunces text-3xl font-bold leading-none tracking-tight text-[#0B1F3A]">{value}</div>
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasDelta && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                good ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {positive ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
              {Math.abs(delta!).toFixed(1)}%
            </span>
          )}
          {sub && <span className="text-xs text-[#94A3B8]">{sub}</span>}
        </div>
        {spark && spark.length > 1 && <Sparkline data={spark} width={72} height={24} />}
      </div>
    </div>
  );
}
