import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import type { AlertSeverity } from "@/lib/types";

export const SEVERITY_META: Record<
  AlertSeverity,
  { label: string; icon: typeof Info; text: string; bg: string; border: string; dot: string }
> = {
  critical: { label: "Critical", icon: AlertOctagon, text: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
  warning: { label: "Warning", icon: AlertTriangle, text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  info: { label: "Info", icon: Info, text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500" },
};

/** Compact severity chip with icon + label. */
export default function AlertBadge({ severity, showLabel = true }: { severity: AlertSeverity; showLabel?: boolean }) {
  const m = SEVERITY_META[severity];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md ${m.bg} ${m.text} px-2 py-0.5 text-[11px] font-semibold`}>
      <Icon size={13} />
      {showLabel && m.label}
    </span>
  );
}
