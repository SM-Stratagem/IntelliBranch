/**
 * Shimmer loading placeholders. `.skeleton` (defined in globals.css) supplies
 * the animated gradient. Use <LoadingSkeleton variant=... /> per card type.
 */
export function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

export default function LoadingSkeleton({
  variant = "card",
  count = 1,
}: {
  variant?: "kpi" | "chart" | "table" | "card";
  count?: number;
}) {
  const items = Array.from({ length: count });

  if (variant === "kpi") {
    return (
      <>
        {items.map((_, i) => (
          <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <Shimmer className="mb-4 h-3 w-20" />
            <Shimmer className="mb-3 h-8 w-28" />
            <Shimmer className="h-3 w-16" />
          </div>
        ))}
      </>
    );
  }

  if (variant === "chart") {
    return (
      <>
        {items.map((_, i) => (
          <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <Shimmer className="mb-2 h-4 w-40" />
            <Shimmer className="mb-6 h-3 w-24" />
            <Shimmer className="h-56 w-full" />
          </div>
        ))}
      </>
    );
  }

  if (variant === "table") {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <Shimmer className="mb-5 h-4 w-40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="mb-3 h-9 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <Shimmer className="mb-3 h-4 w-32" />
          <Shimmer className="h-24 w-full" />
        </div>
      ))}
    </>
  );
}
