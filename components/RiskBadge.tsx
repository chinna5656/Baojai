import type { RiskSeverity } from "@/lib/nutrition";

const riskLabels: Record<RiskSeverity, string> = {
  low: "เสี่ยงต่ำ",
  medium: "เสี่ยงกลาง",
  high: "เสี่ยงสูง"
};

const riskClasses: Record<RiskSeverity, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-rose-200 bg-rose-50 text-rose-800"
};

export function RiskBadge({ level }: { level: RiskSeverity }) {
  return (
    <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold ${riskClasses[level]}`}>
      {riskLabels[level]}
    </span>
  );
}
