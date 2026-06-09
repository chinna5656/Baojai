import { CalendarDays, RefreshCw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/SectionTitle";
import { requireUser } from "@/lib/auth";
import { generateDailyMealPlan } from "@/lib/meal-planner";
import { menuRecommendations } from "@/lib/mock-data";

export default async function MealPlanPage() {
  const user = await requireUser();
  const plan = generateDailyMealPlan();

  return (
    <AppShell active="meal-plan" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            eyebrow="Automatic meal plan"
            title="สร้างแผนอาหารอัตโนมัติ"
            detail="แนะนำเมนูรายวันตามงบน้ำตาล คาร์บ สารก่อแพ้ ข้อมูลอาหารที่กิน และแนวโน้มระดับน้ำตาล"
          />
          <button className="focus-ring flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800">
            <RefreshCw size={17} />
            สร้างใหม่
          </button>
        </div>

        <section className="baojai-card rounded-lg p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-emerald-700">{plan.date}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{plan.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{plan.rationale}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <CalendarDays size={23} />
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {plan.items.map((item) => (
              <article key={item.slot} className="rounded-lg border border-emerald-900/10 bg-white p-4">
                <p className="text-sm font-bold text-emerald-700">{item.slot}</p>
                <h3 className="mt-2 min-h-14 text-lg font-bold leading-6 text-slate-950">{item.menu}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
                <div className="mt-4 flex gap-2 text-xs font-bold">
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800">น้ำตาล {item.sugarG}g</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">คาร์บ {item.carbG}g</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="baojai-card rounded-lg p-5">
            <p className="text-sm font-bold text-emerald-700">Nutrition total</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">ภาพรวมแผนวันนี้</h2>
            <div className="mt-5 grid gap-3">
              {[
                ["น้ำตาล", `${plan.totals.sugarG}g`, user.dailySugarLimitG],
                ["คาร์บ", `${plan.totals.carbG}g`, user.dailyCarbTargetG],
                ["พลังงาน", `${plan.totals.calories} kcal`, 1800],
                ["โซเดียม", `${plan.totals.sodiumMg}mg`, user.sodiumLimitMg]
              ].map(([label, value, limit]) => (
                <div key={String(label)} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-bold text-slate-700">{label}</span>
                    <span className="font-bold text-emerald-800">{value}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${Math.min(100, Math.round((Number(String(value).replace(/\D/g, "")) / Number(limit)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">เมนูที่แนะนำเฉพาะบุคคล</h2>
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
