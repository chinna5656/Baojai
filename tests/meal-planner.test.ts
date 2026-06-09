import { describe, expect, it } from "vitest";
import { generateDailyMealPlan } from "@/lib/meal-planner";
import { demoUser } from "@/lib/mock-data";

describe("generateDailyMealPlan", () => {
  it("returns a daily plan with nutrition totals", () => {
    const plan = generateDailyMealPlan();

    expect(plan.items.length).toBe(4);
    expect(plan.totals.sugarG).toBeGreaterThan(0);
    expect(plan.rationale).toContain(demoUser.allergies[0]);
  });
});
