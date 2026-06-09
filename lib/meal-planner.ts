import { dailyPlan, demoUser, foodCatalog } from "@/lib/mock-data";

export type GeneratedMealPlan = {
  date: string;
  title: string;
  rationale: string;
  items: typeof dailyPlan;
  totals: {
    sugarG: number;
    carbG: number;
    calories: number;
    proteinG: number;
    sodiumMg: number;
  };
};

export function generateDailyMealPlan(): GeneratedMealPlan {
  const safeFoods = foodCatalog.filter(
    (food) => !food.allergens.some((allergen) => demoUser.allergies.includes(allergen))
  );

  const totals = safeFoods.reduce(
    (result, food) => ({
      sugarG: result.sugarG + food.sugarG,
      carbG: result.carbG + food.carbG,
      calories: result.calories + food.calories,
      proteinG: result.proteinG + food.proteinG,
      sodiumMg: result.sodiumMg + food.sodiumMg
    }),
    { sugarG: 0, carbG: 0, calories: 0, proteinG: 0, sodiumMg: 0 }
  );

  return {
    date: new Intl.DateTimeFormat("th-TH", {
      dateStyle: "full",
      timeZone: "Asia/Bangkok"
    }).format(new Date()),
    title: "แผนอาหารคุมน้ำตาลแบบค่อยเป็นค่อยไป",
    rationale:
      "ระบบเลือกเมนูที่น้ำตาลต่ำ โปรตีนพอ และหลีกเลี่ยงถั่วลิสง พร้อมลดโซเดียมในมื้อเย็นตามแนวโน้มล่าสุด",
    items: dailyPlan,
    totals
  };
}
