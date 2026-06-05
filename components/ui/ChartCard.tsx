"use client";

import type { ReactNode } from "react";
import { Download } from "lucide-react";
import Badge from "./Badge";

/**
 * Standard wrapper for every chart/table panel: title, optional subtitle, an
 * actions slot (filters/toggles) on the right, and an optional export button.
 */
export default function ChartCard({
  title,
  subtitle,
  actions,
  children,
  onExport,
  aiBadge = false,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  onExport?: () => void;
  aiBadge?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`flex flex-col rounded-xl border border-[#E2E8F0] bg-white ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF1F6] px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-fraunces text-base font-semibold text-[#0B1F3A]">{title}</h3>
            {aiBadge && <Badge variant="ai">AI</Badge>}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-[#94A3B8]">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium text-[#64748B] transition-colors hover:border-primary hover:text-primary"
            >
              <Download size={14} />
              Export
            </button>
          )}
        </div>
      </header>
      <div className={`flex-1 p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
