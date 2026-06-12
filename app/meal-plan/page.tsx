import Link from "next/link";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { CalendarDays, CheckCircle2, RefreshCw, Search, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/SectionTitle";
import { getDb } from "@/db/client";
import { mealPlanItems, mealPlans } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { generateMealPlanAction, toggleMealPlanItemAction } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const slotLabels = {
  breakfast: "มื้อเช้า",
  lunch: "มื้อกลางวัน",
  dinner: "มื้อเย็น",
  snack: "ของว่าง",
  drink: "เครื่องดื่ม"
} as const;

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPercent(value: number, limit: number) {
  if (limit <= 0) {
    return "0%";
  }

  return `${Math.min(100, Math.round((value / limit) * 100))}%`;
}

function parseSelectedDate(value: string | string[] | undefined) {
  const rawValue = getParamValue(value);
  const parsedDate = rawValue ? new Date(`${rawValue}T12:00:00`) : new Date();

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDateTimeLocalValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return { start, end };
}

function formatThaiDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "full", timeZone: "Asia/Bangkok" }).format(date);
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export default async function MealPlanPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const selectedDate = parseSelectedDate(params.date);
  const selectedDateValue = toDateInputValue(selectedDate);
  const { start: selectedDayStart, end: selectedDayEnd } = getDayRange(selectedDate);
  const { start: todayStart } = getDayRange(new Date());
  const db = getDb();

  const savedPlan = db
    .select()
    .from(mealPlans)
    .where(
      and(
        eq(mealPlans.userId, user.id),
        eq(mealPlans.status, "active"),
        gte(mealPlans.planDate, selectedDayStart),
        lt(mealPlans.planDate, selectedDayEnd)
      )
    )
    .orderBy(desc(mealPlans.createdAt))
    .limit(1)
    .get();

  const upcomingPlans = db
    .select()
    .from(mealPlans)
    .where(and(eq(mealPlans.userId, user.id), eq(mealPlans.status, "active"), gte(mealPlans.planDate, todayStart)))
    .orderBy(asc(mealPlans.planDate), desc(mealPlans.createdAt))
    .limit(14)
    .all();

  const savedItems = savedPlan
    ? db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, savedPlan.id)).all()
    : [];
  const totals = savedPlan?.nutritionTotals ?? {
    sugarG: 0,
    carbG: 0,
    calories: 0,
    proteinG: 0,
    sodiumMg: 0
  };
  const items =
    savedItems.length > 0
      ? savedItems.map((item) => ({
          id: item.id,
          slot: slotLabels[item.slot],
          menu: item.menuName,
          note: item.note ?? "",
          sugarG: item.nutrition?.sugarG ?? 0,
          carbG: item.nutrition?.carbG ?? 0,
          calories: toNumber(item.nutrition?.calories),
          proteinG: toNumber(item.nutrition?.proteinG),
          fatG: toNumber(item.nutrition?.fatG),
          completed: item.completed
        }))
      : [];
  const title = savedPlan?.title ?? "ยังไม่มีแผนอาหารสำหรับวันที่เลือก";
  const rationale =
    savedPlan?.rationale ??
    "เลือกวันที่ล่วงหน้าแล้วกดสร้างแผน ระบบจะบันทึกแผนแยกตามวันเพื่อให้กลับมาดูภายหลังได้";
  const statusText = savedPlan ? "แผนที่บันทึกไว้สำหรับวันนี้" : "ยังไม่มีแผนสำหรับวันนี้";

  return (
    <AppShell active="meal-plan" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            eyebrow="แผนอาหารล่วงหน้า"
            title="วางแผนและดูแผนอาหาร"
            detail="สร้างแผนอาหารจากฐานข้อมูล SQLite สำหรับวันนี้หรือวันล่วงหน้า แล้วกลับมาเปิดดูตามวันที่ต้องการได้"
          />
          <div className="grid gap-3 rounded-lg border border-emerald-900/10 bg-white p-3 lg:grid-cols-2">
            <form action="/meal-plan" className="grid gap-2 sm:grid-cols-[150px_auto]">
              <label className="text-xs font-bold uppercase text-slate-500">
                ดูวันที่
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                  defaultValue={selectedDateValue}
                  name="date"
                  type="date"
                />
              </label>
              <button className="focus-ring flex h-10 items-center justify-center gap-2 self-end rounded-lg border border-emerald-700 px-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50">
                <Search size={17} />
                ดูแผน
              </button>
            </form>
            <form action={generateMealPlanAction} className="grid gap-2 sm:grid-cols-[150px_150px_auto]">
              <label className="text-xs font-bold uppercase text-slate-500">
                วันที่สร้าง
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                  defaultValue={selectedDateValue}
                  name="planDate"
                  type="date"
                />
              </label>
              <label className="text-xs font-bold uppercase text-slate-500">
                รูปแบบ
                <select
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                  defaultValue="balanced"
                  name="strategy"
                >
                  <option value="balanced">สมดุล</option>
                  <option value="lower_carb">คาร์บต่ำ</option>
                </select>
              </label>
              <button className="focus-ring flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800">
                <RefreshCw size={17} />
                สร้างแผน
              </button>
            </form>
          </div>
        </div>

        {getParamValue(params.saved) === "1" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            บันทึกแผนอาหารของวันที่ {formatThaiDate(selectedDate)} ลงฐานข้อมูลแล้ว
          </div>
        ) : null}

        {getParamValue(params.error) === "not-enough-food-data" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            ยังมีข้อมูลอาหารไม่พอสำหรับสร้างแผนตามเงื่อนไขนี้ กรุณานำเข้า db/data.sql อีกครั้งหรือเลือกแบบสมดุล
          </div>
        ) : null}

        {getParamValue(params.error) === "invalid-glucose" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            ค่าน้ำตาลหลังมื้อต้องอยู่ระหว่าง 20 ถึง 600 mg/dL
          </div>
        ) : null}

        {getParamValue(params.error) === "invalid-glucose-time" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            เวลาวัดค่าน้ำตาลหลังมื้อไม่ถูกต้อง
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-700">{formatThaiDate(selectedDate)}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{rationale}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800">{statusText}</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">แหล่งข้อมูล: db/data.sql</span>
                </div>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                <CalendarDays size={23} />
              </span>
            </div>

            {items.length > 0 ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                {items.map((item) => (
                  <article key={item.id} className="rounded-lg border border-emerald-900/10 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-emerald-700">{item.slot}</p>
                      {savedPlan ? (
                        <form action={toggleMealPlanItemAction}>
                          <input name="itemId" type="hidden" value={item.id} />
                          <input name="completed" type="hidden" value={String(item.completed)} />
                          <input name="selectedDate" type="hidden" value={selectedDateValue} />
                          <input name="measuredAt" type="hidden" value={toDateTimeLocalValue(new Date())} />
                          <button
                            className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                              item.completed
                                ? "border-emerald-700 bg-emerald-700 text-white"
                                : "border-emerald-900/10 bg-white text-slate-400 hover:text-emerald-700"
                            }`}
                            title="ทำเครื่องหมายว่าทานแล้ว"
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
                      <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800">น้ำตาลประมาณ {item.sugarG}g</span>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">คาร์บ {item.carbG}g</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-lg bg-white px-2 py-1 text-slate-700 ring-1 ring-slate-200">{item.calories} kcal</span>
                      <span className="rounded-lg bg-white px-2 py-1 text-slate-700 ring-1 ring-slate-200">โปรตีน {item.proteinG}g</span>
                      <span className="rounded-lg bg-white px-2 py-1 text-slate-700 ring-1 ring-slate-200">ไขมัน {item.fatG}g</span>
                    </div>
                    {!item.completed ? (
                      <form action={toggleMealPlanItemAction} className="mt-4 grid gap-2 border-t border-slate-100 pt-3">
                        <input name="itemId" type="hidden" value={item.id} />
                        <input name="completed" type="hidden" value={String(item.completed)} />
                        <input name="selectedDate" type="hidden" value={selectedDateValue} />
                        <input name="measuredAt" type="hidden" value={toDateTimeLocalValue(new Date())} />
                        <label className="text-xs font-bold text-slate-600">
                          ค่าน้ำตาลหลังมื้อ
                          <input
                            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm font-semibold text-slate-800"
                            inputMode="numeric"
                            max={600}
                            min={20}
                            name="glucoseValue"
                            placeholder="mg/dL"
                            type="number"
                          />
                        </label>
                        <button
                          className="focus-ring h-9 rounded-lg bg-emerald-700 px-3 text-xs font-bold text-white transition hover:bg-emerald-800"
                          type="submit"
                        >
                          ทำตามแผนและบันทึก
                        </button>
                      </form>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-dashed border-emerald-900/20 bg-emerald-50/60 p-6 text-sm leading-6 text-emerald-950">
                ยังไม่มีรายการอาหารสำหรับวันที่เลือก กด “สร้างแผน” เพื่อสร้างแผนจากฐานข้อมูลอาหารที่นำเข้าไว้
              </div>
            )}
          </section>

          <section className="baojai-card rounded-lg p-5">
            <p className="text-sm font-bold text-emerald-700">แผนที่บันทึกล่วงหน้า</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">เปิดดูตามวัน</h2>
            <div className="mt-4 grid gap-2">
              {upcomingPlans.length > 0 ? (
                upcomingPlans.map((plan) => {
                  const planDateValue = toDateInputValue(plan.planDate);
                  const isSelected = planDateValue === selectedDateValue;

                  return (
                    <Link
                      className={`rounded-lg border px-3 py-3 text-sm transition ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                      }`}
                      href={`/meal-plan?date=${planDateValue}`}
                      key={plan.id}
                    >
                      <span className="block font-bold">{formatThaiDate(plan.planDate)}</span>
                      <span className="mt-1 block text-xs">{plan.title}</span>
                    </Link>
                  );
                })
              ) : (
                <p className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  ยังไม่มีแผนล่วงหน้า เลือกวันที่ในอนาคตแล้วกดสร้างแผนเพื่อบันทึกไว้
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="baojai-card rounded-lg p-5">
            <p className="text-sm font-bold text-emerald-700">สารอาหารรวม</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">ภาพรวมของวันที่เลือก</h2>
            <div className="mt-5 grid gap-3">
              {[
                ["น้ำตาลประมาณ", `${totals.sugarG}g`, totals.sugarG, user.dailySugarLimitG],
                ["คาร์บ", `${totals.carbG}g`, totals.carbG, user.dailyCarbTargetG],
                ["พลังงาน", `${totals.calories} kcal`, totals.calories, 1800],
                ["โซเดียม", `${totals.sodiumMg}mg`, totals.sodiumMg, user.sodiumLimitMg]
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
              <Target className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">ข้อควรใช้จริง</h2>
            </div>
            <div className="mt-4 grid gap-3">
              <article className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-bold text-slate-950">วางแผนได้หลายวัน</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  การสร้างแผนใหม่จะเปลี่ยนเฉพาะแผนของวันที่เลือก ไม่ลบหรือปิดแผนของวันอื่น ทำให้เตรียมอาหารล่วงหน้าได้
                </p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-bold text-slate-950">ใช้เป็นข้อมูลประกอบ ไม่ใช่คำวินิจฉัย</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  ข้อมูลนำเข้าเป็นอาหารต่อ 100g ควรปรับปริมาณตามมื้อจริง และปรึกษาบุคลากรทางการแพทย์เมื่อมีโรคประจำตัว
                </p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-bold text-slate-950">ค่าน้ำตาลเป็นค่าประมาณ</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  ไฟล์ SQL มีค่าคาร์บแต่ไม่มีค่าน้ำตาลโดยตรง ระบบจึงประเมินน้ำตาลจากคาร์บเพื่อช่วยวางแผนเท่านั้น
                </p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
