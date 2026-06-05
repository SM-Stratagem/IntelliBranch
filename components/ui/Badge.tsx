import type { ReactNode } from "react";

type Variant = "primary" | "neutral" | "success" | "warning" | "danger" | "info" | "ai" | "outline";

const STYLES: Record<Variant, string> = {
  primary: "bg-primary-soft text-primary",
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-600",
  info: "bg-blue-50 text-blue-600",
  ai: "bg-violet-50 text-violet-700",
  outline: "border border-[#E2E8F0] text-[#64748B]",
};

export default function Badge({
  children,
  variant = "neutral",
  className = "",
  dot = false,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-5 ${STYLES[variant]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
