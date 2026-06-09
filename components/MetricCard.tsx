import type { Metric } from "@/lib/mock-data";

const toneClass: Record<Metric["tone"], string> = {
  green: "border-emerald-700/20 bg-emerald-50 text-emerald-900",
  amber: "border-amber-500/25 bg-amber-50 text-amber-950",
  red: "border-rose-500/25 bg-rose-50 text-rose-950",
  neutral: "border-slate-200 bg-white text-slate-900"
};

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <section className={`rounded-lg border p-4 ${toneClass[metric.tone]}`}>
      <p className="text-sm font-semibold opacity-75">{metric.label}</p>
      <p className="mt-3 text-3xl font-bold">{metric.value}</p>
      <p className="mt-2 text-sm leading-5 opacity-80">{metric.helper}</p>
    </section>
  );
}
