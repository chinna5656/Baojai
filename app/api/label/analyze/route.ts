import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeNutritionLabel } from "@/lib/nutrition";
import { writeAuditLog } from "@/lib/audit";

const nutritionSchema = z.object({
  name: z.string().optional(),
  servingSizeG: z.coerce.number().optional(),
  calories: z.coerce.number().optional(),
  carbG: z.coerce.number().optional(),
  sugarG: z.coerce.number().optional(),
  proteinG: z.coerce.number().optional(),
  fatG: z.coerce.number().optional(),
  saturatedFatG: z.coerce.number().optional(),
  sodiumMg: z.coerce.number().optional(),
  ingredients: z.string().optional(),
  allergens: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  const payload = nutritionSchema.parse(await request.json());
  const analysis = analyzeNutritionLabel(payload);

  await writeAuditLog({
    action: "nutrition_label.analyzed",
    resourceType: "nutrition_label",
    metadata: {
      name: payload.name,
      riskLevel: analysis.riskLevel,
      score: analysis.score
    }
  });

  return NextResponse.json({ analysis });
}
