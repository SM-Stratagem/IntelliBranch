/**
 * Tiny inline SVG sparkline — hand-rolled (no Recharts) so it's cheap to render
 * hundreds of times inside data tables. Stroke colour defaults to the tenant
 * primary via CSS var.
 */
export default function Sparkline({
  data,
  width = 96,
  height = 28,
  color = "var(--primary)",
  fill = true,
  className = "",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  className?: string;
}) {
  if (!data || data.length < 2) return <svg width={width} height={height} className={className} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const up = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {fill && (
        <path d={area} fill={color} opacity={0.1} />
      )}
      <path d={line} fill="none" stroke={up ? color : "#DC2626"} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
