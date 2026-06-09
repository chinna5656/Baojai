type Point = {
  label: string;
  value: number;
};

export function MiniTrendChart({
  points,
  stroke = "#15803d",
  targetMin = 80,
  targetMax = 140
}: {
  points: Point[];
  stroke?: string;
  targetMin?: number;
  targetMax?: number;
}) {
  const width = 520;
  const height = 180;
  const padding = 24;
  const values = points.map((point) => point.value);
  const min = Math.min(targetMin, ...values) - 12;
  const max = Math.max(targetMax, ...values) + 12;
  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  const coords = points.map((point, index) => {
    const x = padding + index * xStep;
    const y = height - padding - ((point.value - min) / (max - min)) * (height - padding * 2);
    return { ...point, x, y };
  });

  const polyline = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const targetTop = height - padding - ((targetMax - min) / (max - min)) * (height - padding * 2);
  const targetBottom = height - padding - ((targetMin - min) / (max - min)) * (height - padding * 2);

  return (
    <svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="กราฟแนวโน้มระดับน้ำตาล">
      <rect
        x={padding}
        y={targetTop}
        width={width - padding * 2}
        height={Math.max(0, targetBottom - targetTop)}
        rx="8"
        fill="#dcfce7"
      />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d8e7dd" />
      <polyline fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" points={polyline} />
      {coords.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="6" fill="white" stroke={stroke} strokeWidth="3" />
          <text x={point.x} y={height - 5} textAnchor="middle" className="fill-slate-500 text-[12px] font-semibold">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
