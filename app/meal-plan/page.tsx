import { desc, eq } from "drizzle-orm";
import { CalendarDays, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/SectionTitle";
import { getDb } from "@/db/client";
import { mealPlanItems, mealPlans } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { generateDailyMealPlan } from "@/lib/meal-planner";
import { menuRecommendations } from "@/lib/mock-data";
import { generateMealPlanAction, toggleMealPlanItemAction } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const slotLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  drink: "Drink"
} as const;

function getPercent(value: number, limit: number) {
  return `${Math.min(100, Math.round((value / limit) * 100))}%`;
}

export default async function MealPlanPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const db = getDb();
  const savedPlan = db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.userId, user.id))
    .orderBy(desc(mealPlans.createdAt))
    .limit(1)
    .get();
  const savedItems = savedPlan
    ? db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, savedPlan.id)).all()
    : [];
  const previewPlan = generateDailyMealPlan();
  const totals = savedPlan?.nutritionTotals ?? previewPlan.totals;
  const items =
    savedItems.length > 0
      ? savedItems.map((item) => ({
          id: item.id,
          slot: slotLabels[item.slot],
          menu: item.menuName,
          note: item.note ?? "",
          sugarG: item.nutrition?.sugarG ?? 0,
          carbG: item.nutrition?.carbG ?? 0,
          completed: item.completed
        }))
      : previewPlan.items.map((item) => ({
          id: item.slot,
          slot: item.slot,
          menu: item.menu,
          note: item.note,
          sugarG: item.sugarG,
          carbG: item.carbG,
          completed: false
        }));
  const title = savedPlan?.title ?? previewPlan.title;
  const rationale = savedPlan?.rationale ?? previewPlan.rationale;
  const date = savedPlan
    ? new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(savedPlan.planDate)
    : previewPlan.date;

  return (
    <AppShell active="meal-plan" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            eyebrow="Automatic meal plan"
            title="Meal Plan"
            detail="Generate and save a daily plan to your SQLite meal plan tables."
          />
          <form action={generateMealPlanAction}>
            <button className="focus-ring flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800">
              <RefreshCw size={17} />
              Generate New
            </button>
          </form>
        </div>

        {params.saved === "1" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            Meal plan saved to the database.
          </div>
        ) : null}

        <section className="baojai-card rounded-lg p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-emerald-700">{date}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{rationale}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <CalendarDays size={23} />
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-emerald-900/10 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-emerald-700">{item.slot}</p>
                  {savedPlan ? (
                    <form action={toggleMealPlanItemAction}>
                      <input name="itemId" type="hidden" value={item.id} />
                      <input name="completed" type="hidden" value={String(item.completed)} />
                      <button
                        className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                          item.completed
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-emerald-900/10 bg-white text-slate-400 hover:text-emerald-700"
                        }`}
                        title="Toggle completed"
                        type="submit"
                      >
                        <CheckCircle2 size={17} />
                      </button>
                    </form>
                  ) : null}
                </div>
                <h3 className="mt-2 min-h-14 text-lg font-bold leading-6 text-slate-950">{item.menu}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
                <div className="mt-4 flex gap-2 text-xs font-bold">
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800">Sugar {item.sugarG}g</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">Carb {item.carbG}g</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="baojai-card rounded-lg p-5">
            <p className="text-sm font-bold text-emerald-700">Nutrition total</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Daily Overview</h2>
            <div className="mt-5 grid gap-3">
              {[
                ["Sugar", `${totals.sugarG}g`, totals.sugarG, user.dailySugarLimitG],
                ["Carb", `${totals.carbG}g`, totals.carbG, user.dailyCarbTargetG],
                ["Calories", `${totals.calories} kcal`, totals.calories, 1800],
                ["Sodium", `${totals.sodiumMg}mg`, totals.sodiumMg, user.sodiumLimitMg]
              ].map(([label, displayValue, value, limit]) => (
                <div key={String(label)} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-bold text-slate-700">{label}</span>
                    <span className="font-bold text-emerald-800">{displayValue}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-600" style={{ width: getPercent(Number(value), Number(limit)) }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">Personal Recommendations</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {menuRecommendations.map((item) => (
                <article key={item.title} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <h3 className="font-bold text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.reason}</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-lg font-bold text-emerald-800">
                    {item.score}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
