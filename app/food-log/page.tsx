import { Plus, Save, Utensils } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/SectionTitle";
import { requireUser } from "@/lib/auth";
import { recentMeals } from "@/lib/mock-data";

const totalSugar = recentMeals.reduce((sum, meal) => sum + meal.sugarG, 0);
const totalCarb = recentMeals.reduce((sum, meal) => sum + meal.carbG, 0);

export default async function FoodLogPage() {
  const user = await requireUser();
  const sugarPercent = Math.min(100, Math.round((totalSugar / user.dailySugarLimitG) * 100));
  const carbPercent = Math.min(100, Math.round((totalCarb / user.dailyCarbTargetG) * 100));

  return (
    <AppShell active="food-log" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Food log"
          title="บันทึกอาหารที่กินและงบน้ำตาล"
          detail="บันทึกอาหาร เครื่องดื่ม และ portion เพื่อคำนวณน้ำตาล/คาร์บต่อวัน พร้อมเก็บ log การแก้ไขในฐานข้อมูล"
        />

        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                <Plus size={20} />
              </span>
              <h2 className="text-xl font-bold text-slate-950">เพิ่มรายการอาหาร</h2>
            </div>

            <form className="mt-5 grid gap-4">
              <label className="text-sm font-bold text-slate-700">
                มื้ออาหาร
                <select className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm">
                  <option>เช้า</option>
                  <option>กลางวัน</option>
                  <option>เย็น</option>
                  <option>ของว่าง</option>
                  <option>เครื่องดื่ม</option>
                </select>
              </label>

              <label className="text-sm font-bold text-slate-700">
                ชื่ออาหาร
                <input className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm" defaultValue="ข้าวไรซ์เบอร์รีอกไก่สมุนไพร" />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["น้ำตาล g", "4"],
                  ["คาร์บ g", "42"],
                  ["พลังงาน kcal", "430"],
                  ["โซเดียม mg", "520"]
                ].map(([label, value]) => (
                  <label key={label} className="text-sm font-bold text-slate-700">
                    {label}
                    <input className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm" defaultValue={value} type="number" />
                  </label>
                ))}
              </div>

              <button className="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800" type="button">
                <Save size={17} />
                บันทึกอาหาร
              </button>
            </form>
          </section>

          <section className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="baojai-card rounded-lg p-5">
                <p className="text-sm font-bold text-emerald-700">น้ำตาลวันนี้</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <span className="text-4xl font-bold text-slate-950">{totalSugar}g</span>
                  <span className="text-sm font-bold text-slate-500">/{user.dailySugarLimitG}g</span>
                </div>
                <div className="mt-4 h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-emerald-600" style={{ width: `${sugarPercent}%` }} />
                </div>
              </div>

              <div className="baojai-card rounded-lg p-5">
                <p className="text-sm font-bold text-emerald-700">คาร์บวันนี้</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <span className="text-4xl font-bold text-slate-950">{totalCarb}g</span>
                  <span className="text-sm font-bold text-slate-500">/{user.dailyCarbTargetG}g</span>
                </div>
                <div className="mt-4 h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-lime-600" style={{ width: `${carbPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="baojai-card rounded-lg p-5">
              <div className="flex items-center gap-3">
                <Utensils className="text-emerald-700" size={22} />
                <h2 className="text-xl font-bold text-slate-950">รายการล่าสุด</h2>
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {recentMeals.map((meal) => (
                  <div key={meal.time} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-bold text-slate-900">{meal.meal}</p>
                      <p className="mt-1 text-sm text-slate-500">{meal.time} น. · {meal.status}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">น้ำตาล {meal.sugarG}g</span>
                      <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">คาร์บ {meal.carbG}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
