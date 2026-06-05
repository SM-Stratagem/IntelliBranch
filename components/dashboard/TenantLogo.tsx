"use client";

import { useTenant } from "@/components/TenantProvider";

/** Renders the tenant logo, or an initials mark in the brand colour as fallback. */
export default function TenantLogo({
  size = "md",
  showName = true,
  onDark = false,
}: {
  size?: "sm" | "md";
  showName?: boolean;
  onDark?: boolean;
}) {
  const { tenant } = useTenant();
  const initials = tenant.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const box = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {tenant.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tenant.logoUrl} alt={tenant.name} className={`${box} rounded-lg object-contain`} />
      ) : (
        <span className={`flex ${box} flex-shrink-0 items-center justify-center rounded-lg bg-primary font-fraunces font-bold text-white`}>
          {initials}
        </span>
      )}
      {showName && (
        <div className="min-w-0">
          <p className={`truncate font-fraunces text-sm font-bold leading-tight ${onDark ? "text-white" : "text-[#0B1F3A]"}`}>
            {tenant.productName}
          </p>
          <p className={`truncate text-[11px] leading-tight ${onDark ? "text-white/45" : "text-[#94A3B8]"}`}>{tenant.name}</p>
        </div>
      )}
    </div>
  );
}
