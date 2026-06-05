"use client";

import { MapPin } from "lucide-react";
import type { Alert } from "@/lib/types";
import { relativeTime } from "@/lib/format";
import { SEVERITY_META } from "@/components/ui/AlertBadge";

/** One alert row. Optional `actions` slot renders controls (resolve/snooze). */
export default function AlertCard({
  alert,
  actions,
  compact = false,
}: {
  alert: Alert;
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  const m = SEVERITY_META[alert.severity];
  const Icon = m.icon;
  const resolved = alert.status === "resolved";

  return (
    <div
      className={`flex gap-3 rounded-xl border ${m.border} ${m.bg} ${compact ? "p-3" : "p-4"} ${
        resolved ? "opacity-60" : ""
      }`}
    >
      <Icon size={18} className={`mt-0.5 flex-shrink-0 ${m.text}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-[#0B1F3A]">{alert.title}</p>
          <span className="flex-shrink-0 text-[11px] text-[#94A3B8]">{relativeTime(alert.createdAt)}</span>
        </div>
        <p className={`mt-0.5 text-xs leading-relaxed text-[#64748B] ${compact ? "line-clamp-2" : ""}`}>{alert.message}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#475569]">
            <MapPin size={11} /> {alert.branchName}
          </span>
          <span className={`rounded-md bg-white/70 px-1.5 py-0.5 text-[11px] font-semibold ${m.text}`}>
            {alert.metric}: {alert.value}
          </span>
          {resolved && <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">Resolved</span>}
        </div>
        {actions && <div className="mt-2.5 flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
