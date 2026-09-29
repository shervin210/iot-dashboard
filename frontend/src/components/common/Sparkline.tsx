interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  min?: number;
  max?: number;
}
export function Sparkline({
  values,
  width = 280,
  height = 64,
  color = "var(--color-accent)",
  min,
  max,
}: SparklineProps) {
  if (values.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-sm border border-dashed border-border text-[11px] text-faint"
        style={{ width, height }}
      >
        Collecting data…
      </div>
    );
  }

  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const range = hi - lo || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - lo) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = values[values.length - 1];
  const lastX = width;
  const lastY = height - ((last - lo) / range) * height;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Telemetry trend"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={3} fill={color} />
    </svg>
  );
}
