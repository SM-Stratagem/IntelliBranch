/**
 * Horizontal labelled progress bar. `tone` controls the fill colour; defaults
 * to the tenant primary. Used for stock days, labour %, utilisation, etc.
 */
export default function StatBar({
  label,
  value,
  max = 100,
  display,
  tone = "primary",
  className = "",
}: {
  label?: string;
  value: number;
  max?: number;
  display?: string;
  tone?: "primary" | "success" | "warning" | "danger";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill =
    tone === "success" ? "bg-emerald-500"
    : tone === "warning" ? "bg-amber-500"
    : tone === "danger" ? "bg-red-500"
    : "bg-primary";

  return (
    <div className={className}>
      {(label || display) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          {label && <span className="text-[#64748B]">{label}</span>}
          {display && <span className="font-semibold text-[#0B1F3A]">{display}</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${fill} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
