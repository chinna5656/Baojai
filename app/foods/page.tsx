import { desc } from "drizzle-orm";
import { Database, Plus, Save, Utensils } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/SectionTitle";
import { getDb } from "@/db/client";
import { foods } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { addFoodAction } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const mealTypeLabels = {
  breakfast: "มื้อเช้า",
  lunch: "มื้อกลางวัน",
  dinner: "มื้อเย็น",
  snack: "ของว่าง",
  drink: "เครื่องดื่ม"
} as const;

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function displayValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function Field({
  children,
  className = "",
  label
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={`text-sm font-bold text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

export default async function FoodsPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const db = getDb();
  const recentFoods = db.select().from(foods).orderBy(desc(foods.createdAt)).limit(12).all();

  return (
    <AppShell active="foods" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Food database"
          title="เพิ่มข้อมูลเมนูอาหาร"
          detail="เพิ่มเมนูใหม่ลงตาราง foods ของ SQLite เพื่อใช้กับ meal plan, food log และการแนะนำอาหาร"
        />

        {getParamValue(params.saved) === "1" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            บันทึกเมนูอาหารลงฐานข้อมูลเรียบร้อยแล้ว
          </div>
        ) : null}

        {getParamValue(params.error) === "missing-name" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            กรุณากรอกชื่อเมนูอาหาร
          </div>
        ) : null}

        {getParamValue(params.error) === "invalid-meal-type" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            กรุณาเลือกประเภทมื้ออาหารที่ถูกต้อง
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                <Plus size={20} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-950">ฟอร์มเพิ่มเมนู</h2>
                <p className="text-sm text-slate-500">ใส่ข้อมูลต่อหนึ่งหน่วยบริโภค หรือ 100g ตามข้อมูลที่มี</p>
              </div>
            </div>

            <form action={addFoodAction} className="mt-5 grid gap-4">
              <Field label="ชื่อเมนูอาหาร">
                <input
                  className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                  maxLength={160}
                  name="name"
                  placeholder="เช่น ข้าวไรซ์เบอร์รีอกไก่สมุนไพร"
                  required
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ประเภทมื้อ">
                  <select
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue="lunch"
                    name="mealType"
                    required
                  >
                    <option value="breakfast">มื้อเช้า</option>
                    <option value="lunch">มื้อกลางวัน</option>
                    <option value="dinner">มื้อเย็น</option>
                    <option value="snack">ของว่าง</option>
                    <option value="drink">เครื่องดื่ม</option>
                  </select>
                </Field>

                <Field label="หน่วยบริโภค (g)">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    inputMode="numeric"
                    max={5000}
                    min={1}
                    name="servingSizeG"
                    placeholder="100"
                    type="number"
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["พลังงาน (kcal)", "calories", "430", 5000],
                  ["คาร์บ (g)", "carbG", "42", 1000],
                  ["น้ำตาล (g)", "sugarG", "4", 1000],
                  ["โปรตีน (g)", "proteinG", "32", 1000],
                  ["ไขมัน (g)", "fatG", "11", 1000],
                  ["โซเดียม (mg)", "sodiumMg", "520", 20000]
                ].map(([label, name, placeholder, max]) => (
                  <Field key={String(name)} label={String(label)}>
                    <input
                      className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                      inputMode="decimal"
                      max={Number(max)}
                      min={0}
                      name={String(name)}
                      placeholder={String(placeholder)}
                      step={name === "calories" || name === "sodiumMg" ? "1" : "0.1"}
                      type="number"
                    />
                  </Field>
                ))}
              </div>

              <Field label="แท็กอาหาร">
                <input
                  className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                  maxLength={400}
                  name="tags"
                  placeholder="เช่น อาหารไทย, โปรตีนสูง, ลดหวาน"
                />
              </Field>

              <Field label="สารก่อแพ้">
                <input
                  className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                  maxLength={400}
                  name="allergens"
                  placeholder="เช่น ถั่วลิสง, กุ้ง, นม"
                />
              </Field>

              <Field label="หมายเหตุเรื่องน้ำตาล/คาร์บ">
                <textarea
                  className="focus-ring mt-2 min-h-24 w-full rounded-lg border border-emerald-900/10 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500"
                  maxLength={500}
                  name="glycemicNote"
                  placeholder="เช่น ควรกินคู่ผักและโปรตีนเพื่อช่วยให้ระดับน้ำตาลขึ้นช้าลง"
                />
              </Field>

              <Field label="URL รูปภาพ (ถ้ามี)">
                <input
                  className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                  maxLength={500}
                  name="imageUrl"
                  placeholder="https://..."
                  type="url"
                />
              </Field>

              <button className="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800" type="submit">
                <Save size={17} />
                บันทึกเมนูลง foods
              </button>
            </form>
          </section>

          <section className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="baojai-card rounded-lg p-5">
                <p className="text-sm font-bold text-emerald-700">เมนูล่าสุด</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{recentFoods.length}</p>
              </div>
              <div className="baojai-card rounded-lg p-5">
                <p className="text-sm font-bold text-emerald-700">แหล่งข้อมูล</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">foods</p>
              </div>
              <div className="baojai-card rounded-lg p-5">
                <p className="text-sm font-bold text-emerald-700">ใช้กับ</p>
                <p className="mt-2 text-lg font-bold text-slate-950">Meal Plan</p>
              </div>
            </div>

            <section className="baojai-card rounded-lg p-5">
              <div className="flex items-center gap-3">
                <Database className="text-emerald-700" size={22} />
                <h2 className="text-xl font-bold text-slate-950">ข้อมูลล่าสุดใน foods</h2>
              </div>
              <div className="mt-5 overflow-hidden rounded-lg border border-emerald-900/10 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-emerald-50 text-xs font-bold uppercase text-emerald-900">
                    <tr>
                      <th className="px-4 py-3">เมนู</th>
                      <th className="px-4 py-3">มื้อ</th>
                      <th className="px-4 py-3">คาร์บ</th>
                      <th className="px-4 py-3">พลังงาน</th>
                      <th className="px-4 py-3">แหล่ง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/10">
                    {recentFoods.length > 0 ? (
                      recentFoods.map((food) => (
                        <tr key={food.id}>
                          <td className="px-4 py-3 font-bold text-slate-950">{food.name}</td>
                          <td className="px-4 py-3 text-slate-600">{food.mealType ? mealTypeLabels[food.mealType] : "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{displayValue(food.carbG, "-")} g</td>
                          <td className="px-4 py-3 text-slate-600">{displayValue(food.calories, "-")} kcal</td>
                          <td className="px-4 py-3 text-slate-600">{food.source}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                          ยังไม่มีข้อมูลอาหารในฐานข้อมูล
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-3">
                <Utensils className="text-amber-700" size={22} />
                <h2 className="text-lg font-bold text-amber-950">คำแนะนำการกรอก</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-amber-900">
                หากไม่มีข้อมูลครบทุกช่อง ให้กรอกเฉพาะชื่อเมนู ประเภทมื้อ และค่าที่ทราบก่อน ระบบจะบันทึกช่องที่เว้นว่างเป็นค่าว่างในฐานข้อมูล
              </p>
            </section>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
