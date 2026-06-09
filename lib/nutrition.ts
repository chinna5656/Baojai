export type NutritionInput = {
  name?: string;
  servingSizeG?: number;
  calories?: number;
  carbG?: number;
  sugarG?: number;
  proteinG?: number;
  fatG?: number;
  saturatedFatG?: number;
  sodiumMg?: number;
  ingredients?: string;
  allergens?: string[];
};

export type RiskSeverity = "low" | "medium" | "high";

export type NutritionWarning = {
  title: string;
  message: string;
  severity: RiskSeverity;
};

export type NutritionAnalysis = {
  riskLevel: RiskSeverity;
  score: number;
  summary: string;
  warnings: NutritionWarning[];
  recommendations: string[];
};

const defaultProfile = {
  sugarLimitPerServingG: 8,
  sodiumLimitPerServingMg: 600,
  saturatedFatLimitG: 5,
  calorieLimitPerServing: 500,
  allergens: ["ถั่วลิสง"]
};

const severityScore: Record<RiskSeverity, number> = {
  low: 12,
  medium: 28,
  high: 45
};

export function analyzeNutritionLabel(
  input: NutritionInput,
  profile = defaultProfile
): NutritionAnalysis {
  const warnings: NutritionWarning[] = [];
  const sugarG = input.sugarG ?? 0;
  const sodiumMg = input.sodiumMg ?? 0;
  const saturatedFatG = input.saturatedFatG ?? 0;
  const calories = input.calories ?? 0;
  const carbG = input.carbG ?? 0;
  const ingredients = input.ingredients ?? "";
  const allergens = input.allergens ?? [];

  if (sugarG >= profile.sugarLimitPerServingG * 1.5) {
    warnings.push({
      title: "น้ำตาลสูง",
      message: `มีน้ำตาล ${sugarG}g ต่อหนึ่งหน่วยบริโภค สูงกว่างบที่แนะนำมาก ควรลดปริมาณหรือเลือกสูตรไม่หวาน`,
      severity: "high"
    });
  } else if (sugarG > profile.sugarLimitPerServingG) {
    warnings.push({
      title: "น้ำตาลควรระวัง",
      message: `มีน้ำตาล ${sugarG}g ต่อหนึ่งหน่วยบริโภค ใช้งบน้ำตาลต่อวันค่อนข้างมาก`,
      severity: "medium"
    });
  }

  if (sodiumMg > profile.sodiumLimitPerServingMg) {
    warnings.push({
      title: "โซเดียมสูง",
      message: `มีโซเดียม ${sodiumMg}mg ต่อหนึ่งหน่วยบริโภค ควรจับคู่กับอาหารสดและลดเค็มในมื้ออื่น`,
      severity: sodiumMg > 900 ? "high" : "medium"
    });
  }

  if (saturatedFatG > profile.saturatedFatLimitG) {
    warnings.push({
      title: "ไขมันอิ่มตัวสูง",
      message: `ไขมันอิ่มตัว ${saturatedFatG}g อาจไม่เหมาะกับการกินบ่อย แนะนำเลือกเมนูย่าง ต้ม หรือนึ่งแทน`,
      severity: "medium"
    });
  }

  if (calories > profile.calorieLimitPerServing) {
    warnings.push({
      title: "พลังงานต่อเสิร์ฟสูง",
      message: `พลังงาน ${calories} kcal ต่อหนึ่งหน่วยบริโภค ควรตรวจจำนวนเสิร์ฟบนฉลากก่อนกินจริง`,
      severity: "medium"
    });
  }

  if (carbG >= 55) {
    warnings.push({
      title: "คาร์โบไฮเดรตสูง",
      message: `คาร์บ ${carbG}g อาจทำให้น้ำตาลหลังอาหารขึ้นเร็ว ควรแบ่ง portion และเพิ่มโปรตีนหรือผัก`,
      severity: "medium"
    });
  }

  const allergenText = `${ingredients} ${allergens.join(" ")}`.toLowerCase();
  const matchedAllergens = profile.allergens.filter((item) =>
    allergenText.includes(item.toLowerCase())
  );

  if (matchedAllergens.length > 0) {
    warnings.push({
      title: "พบสารก่อแพ้ที่ผู้ใช้หลีกเลี่ยง",
      message: `พบข้อมูลเกี่ยวกับ ${matchedAllergens.join(", ")} ควรหลีกเลี่ยงหรือสอบถามผู้ผลิตก่อนกิน`,
      severity: "high"
    });
  }

  const score = Math.min(
    100,
    warnings.reduce((total, warning) => total + severityScore[warning.severity], 0)
  );
  const hasHighWarning = warnings.some((warning) => warning.severity === "high");
  const hasMediumWarning = warnings.some((warning) => warning.severity === "medium");
  const riskLevel: RiskSeverity = score >= 70 || hasHighWarning ? "high" : score >= 35 || hasMediumWarning ? "medium" : "low";

  const recommendations = buildRecommendations(input, riskLevel);

  return {
    riskLevel,
    score,
    summary:
      riskLevel === "low"
        ? "ฉลากนี้ดูเหมาะสมกับเป้าหมายปัจจุบัน แต่ยังควรดูปริมาณเสิร์ฟจริง"
        : riskLevel === "medium"
          ? "มีบางจุดที่ควรระวัง โดยเฉพาะน้ำตาล โซเดียม หรือคาร์บต่อเสิร์ฟ"
          : "ควรหลีกเลี่ยงหรือกินในปริมาณน้อยมาก เพราะมีความเสี่ยงสูงต่อเป้าหมายสุขภาพ",
    warnings,
    recommendations
  };
}

function buildRecommendations(input: NutritionInput, riskLevel: RiskSeverity) {
  const recommendations = [
    "อ่านจำนวนหน่วยบริโภคบนฉลากก่อนเสมอ เพราะหนึ่งแพ็กอาจมีมากกว่าหนึ่งเสิร์ฟ",
    "จับคู่คาร์บกับโปรตีนและผัก เพื่อช่วยให้ระดับน้ำตาลขึ้นช้าลง"
  ];

  if ((input.sugarG ?? 0) > 8) {
    recommendations.push("เลือกสูตรไม่หวาน หวาน 0% หรือแบ่งกินครึ่งหนึ่งแทนกินทั้งแพ็ก");
  }

  if ((input.sodiumMg ?? 0) > 600) {
    recommendations.push("ลดอาหารเค็มในมื้อถัดไป และดื่มน้ำเปล่าให้เพียงพอ");
  }

  if (riskLevel === "high") {
    recommendations.push("ถ้ามีโรคประจำตัวหรือแพ้อาหาร ให้ปรึกษาแพทย์หรือนักกำหนดอาหารก่อนตัดสินใจ");
  }

  return recommendations;
}
