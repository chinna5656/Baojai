import { describe, expect, it } from "vitest";
import { analyzeNutritionLabel } from "@/lib/nutrition";

describe("analyzeNutritionLabel", () => {
  it("marks high sugar labels as high risk", () => {
    const result = analyzeNutritionLabel({
      name: "sweet drink",
      sugarG: 20,
      carbG: 54,
      sodiumMg: 120
    });

    expect(result.riskLevel).toBe("high");
    expect(result.warnings.some((warning) => warning.title === "น้ำตาลสูง")).toBe(true);
  });

  it("flags user allergens found in ingredients", () => {
    const result = analyzeNutritionLabel({
      name: "papaya salad",
      sugarG: 4,
      ingredients: "มะละกอ ถั่วลิสง น้ำปลา"
    });

    expect(result.warnings.some((warning) => warning.title.includes("สารก่อแพ้"))).toBe(true);
  });
});
