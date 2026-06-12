import { desc, eq } from "drizzle-orm";
import { Activity, Database, HeartPulse, KeyRound, Save, ShieldCheck, UserRound, Utensils } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/SectionTitle";
import { getDb } from "@/db/client";
import { allergies, auditLogs, userHealthSettings, userProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { sheetSources } from "@/lib/mock-data";
import { updateSettingsAction } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const sexLabels: Record<string, string> = {
  female: "หญิง",
  male: "ชาย",
  other: "อื่นๆ"
};

const ageLabels: Record<string, string> = {
  under_18: "ต่ำกว่า 18 ปี",
  "18_29": "18-29 ปี",
  "30_44": "30-44 ปี",
  "45_59": "45-59 ปี",
  "60_plus": "60 ปีขึ้นไป"
};

const dietaryLabels: Record<string, string> = {
  thai_balanced: "อาหารไทยสมดุล",
  lower_carb: "คาร์บต่ำ",
  high_protein: "โปรตีนสูง",
  vegetarian: "มังสวิรัติ"
};

function displayValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(date: Date) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  return formatted.replace(":", ".");
}

function parseGlucoseTarget(target: string) {
  const [min, max] = target.match(/\d+/g)?.map(Number) ?? [80, 140];

  return { min: min ?? 80, max: max ?? 140 };
}

function ProfileField({
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-900/10 bg-white p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{displayValue(value)}</p>
    </div>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const db = getDb();
  const profile = db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  const healthSettings = db
    .select()
    .from(userHealthSettings)
    .where(eq(userHealthSettings.userId, user.id))
    .get();
  const userAllergies = db.select().from(allergies).where(eq(allergies.userId, user.id)).all();
  const recentAuditLogs = db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, user.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(5)
    .all();

  const glucoseTarget = parseGlucoseTarget(user.glucoseTarget);
  const allergyText = userAllergies.map((item) => item.name).join(", ");
  const displayName = profile?.displayName ?? user.name;
  const dailySugarLimitG = healthSettings?.dailySugarLimitG ?? user.dailySugarLimitG;
  const dailyCarbTargetG = healthSettings?.dailyCarbTargetG ?? user.dailyCarbTargetG;
  const sodiumLimitMg = healthSettings?.sodiumLimitMg ?? user.sodiumLimitMg;
  const glucoseTargetMin = healthSettings?.glucoseTargetMin ?? glucoseTarget.min;
  const glucoseTargetMax = healthSettings?.glucoseTargetMax ?? glucoseTarget.max;
  const envRows = [
    ["SQLITE_DB_PATH", process.env.SQLITE_DB_PATH ?? "./db/baojai.sqlite"],
    ["AUTH_SECRET", process.env.AUTH_SECRET ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"],
    ["GOOGLE_SERVICE_ACCOUNT_EMAIL", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"],
    ["GOOGLE_PRIVATE_KEY", process.env.GOOGLE_PRIVATE_KEY ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"],
    ["GOOGLE_SHEET_ID", process.env.GOOGLE_SHEET_ID ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า"],
    ["OLLAMA_BASE_URL", process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434"],
    ["OLLAMA_MODEL", process.env.OLLAMA_MODEL ?? "llama3.1"]
  ];

  return (
    <AppShell active="settings" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Settings"
          title="ข้อมูลโปรไฟล์สุขภาพ"
          detail="จัดรูปแบบข้อมูลส่วนตัว เป้าหมายสุขภาพ และข้อจำกัดอาหารเพื่อใช้กับ meal plan, glucose และ dashboard"
        />

        {getParamValue(params.saved) === "1" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว
          </div>
        ) : null}

        {getParamValue(params.error) === "missing-name" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            กรุณากรอกชื่อที่ต้องการแสดง
          </div>
        ) : null}

        <section className="grid gap-4 rounded-lg border border-emerald-900/10 bg-emerald-50 p-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-emerald-700 text-xl font-bold text-white">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">Profile summary</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{displayName}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-lg bg-white px-2 py-1 text-emerald-800">{dietaryLabels[profile?.dietaryStyle ?? ""] ?? "ยังไม่ระบุรูปแบบอาหาร"}</span>
                <span className="rounded-lg bg-white px-2 py-1 text-slate-700">{allergyText || "ไม่มีข้อมูลแพ้อาหาร"}</span>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem label="น้ำตาล/วัน" value={`${dailySugarLimitG} g`} />
            <SummaryItem label="คาร์บ/วัน" value={`${dailyCarbTargetG} g`} />
            <SummaryItem label="โซเดียม/วัน" value={`${sodiumLimitMg} mg`} />
            <SummaryItem label="Glucose target" value={`${glucoseTargetMin}-${glucoseTargetMax} mg/dL`} />
          </div>
        </section>

        <form action={updateSettingsAction} className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
            <section className="baojai-card rounded-lg p-5">
              <div className="flex items-center gap-3">
                <UserRound className="text-emerald-700" size={22} />
                <div>
                  <h2 className="text-xl font-bold text-slate-950">1. ข้อมูลส่วนตัว</h2>
                  <p className="text-sm text-slate-500">ข้อมูลพื้นฐานที่ใช้แสดงผลและปรับคำแนะนำ</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ProfileField label="ชื่อที่แสดง">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={displayName}
                    name="displayName"
                    required
                  />
                </ProfileField>

                <ProfileField label="อีเมล">
                  <input
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                    defaultValue={user.email}
                    disabled
                  />
                </ProfileField>

                <ProfileField label="เพศ">
                  <select
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={profile?.sex ?? ""}
                    name="sex"
                  >
                    <option value="">ไม่ระบุ</option>
                    <option value="female">{sexLabels.female}</option>
                    <option value="male">{sexLabels.male}</option>
                    <option value="other">{sexLabels.other}</option>
                  </select>
                </ProfileField>

                <ProfileField label="ช่วงอายุ">
                  <select
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={profile?.ageRange ?? ""}
                    name="ageRange"
                  >
                    <option value="">ไม่ระบุ</option>
                    {Object.entries(ageLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </ProfileField>

                <ProfileField label="ส่วนสูง (cm)">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={profile?.heightCm ?? ""}
                    inputMode="numeric"
                    max={250}
                    min={80}
                    name="heightCm"
                    type="number"
                  />
                </ProfileField>

                <ProfileField label="น้ำหนัก (kg)">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={profile?.weightKg ?? ""}
                    inputMode="decimal"
                    max={300}
                    min={20}
                    name="weightKg"
                    step="0.1"
                    type="number"
                  />
                </ProfileField>
              </div>
            </section>

            <section className="baojai-card rounded-lg p-5">
              <div className="flex items-center gap-3">
                <Activity className="text-emerald-700" size={22} />
                <div>
                  <h2 className="text-xl font-bold text-slate-950">2. บริบทสุขภาพ</h2>
                  <p className="text-sm text-slate-500">ใช้เป็นข้อมูลประกอบ ไม่ใช่คำวินิจฉัย</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <ProfileField label="ภาวะ/กิจกรรม">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={profile?.activityLevel ?? ""}
                    name="activityLevel"
                    placeholder="เช่น เบาหวานชนิดที่ 2, เดินเบาๆ"
                  />
                </ProfileField>

                <ProfileField label="เป้าหมายสุขภาพ">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={profile?.healthGoals?.[0] ?? user.goal}
                    name="healthGoal"
                    placeholder="เช่น คุมระดับน้ำตาล"
                  />
                </ProfileField>

                <label className="flex items-start gap-3 rounded-lg border border-emerald-900/10 bg-white p-3 text-sm leading-6 text-slate-700">
                  <input
                    className="mt-1 h-4 w-4 accent-emerald-700"
                    defaultChecked={healthSettings?.medicalDisclaimerAccepted ?? false}
                    name="medicalDisclaimerAccepted"
                    type="checkbox"
                  />
                  <span>ยอมรับว่าข้อมูลในระบบเป็นข้อมูลประกอบการดูแลสุขภาพ ไม่ใช่คำวินิจฉัยหรือคำสั่งรักษา</span>
                </label>
              </div>
            </section>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="baojai-card rounded-lg p-5">
              <div className="flex items-center gap-3">
                <Utensils className="text-emerald-700" size={22} />
                <div>
                  <h2 className="text-xl font-bold text-slate-950">3. รูปแบบอาหาร</h2>
                  <p className="text-sm text-slate-500">ข้อมูลนี้ใช้ช่วยจัด meal plan และคำแนะนำอาหาร</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <ProfileField label="รูปแบบอาหาร">
                  <select
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={profile?.dietaryStyle ?? user.dietaryStyle ?? ""}
                    name="dietaryStyle"
                  >
                    <option value="">ไม่ระบุ</option>
                    {Object.entries(dietaryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </ProfileField>

                <ProfileField label="อาหารที่แพ้หรือควรเลี่ยง">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={allergyText}
                    name="allergies"
                    placeholder="เช่น ถั่วลิสง, กุ้ง, นม"
                  />
                </ProfileField>
              </div>
            </section>

            <section className="baojai-card rounded-lg p-5">
              <div className="flex items-center gap-3">
                <HeartPulse className="text-emerald-700" size={22} />
                <div>
                  <h2 className="text-xl font-bold text-slate-950">4. เป้าหมายตัวเลข</h2>
                  <p className="text-sm text-slate-500">ใช้คำนวณภาพรวมใน dashboard, glucose และ meal plan</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ProfileField label="น้ำตาลต่อวัน (g)">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={dailySugarLimitG}
                    inputMode="numeric"
                    min={1}
                    name="dailySugarLimitG"
                    type="number"
                  />
                </ProfileField>

                <ProfileField label="คาร์บต่อวัน (g)">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={dailyCarbTargetG}
                    inputMode="numeric"
                    min={1}
                    name="dailyCarbTargetG"
                    type="number"
                  />
                </ProfileField>

                <ProfileField label="โซเดียมต่อวัน (mg)">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={sodiumLimitMg}
                    inputMode="numeric"
                    min={1}
                    name="sodiumLimitMg"
                    type="number"
                  />
                </ProfileField>

                <ProfileField label="Glucose ต่ำสุด">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={glucoseTargetMin}
                    inputMode="numeric"
                    min={40}
                    name="glucoseTargetMin"
                    type="number"
                  />
                </ProfileField>

                <ProfileField label="Glucose สูงสุด">
                  <input
                    className="focus-ring mt-2 h-11 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                    defaultValue={glucoseTargetMax}
                    inputMode="numeric"
                    min={40}
                    name="glucoseTargetMax"
                    type="number"
                  />
                </ProfileField>
              </div>
            </section>
          </div>

          <div className="sticky bottom-4 z-10 flex justify-end">
            <button
              className="focus-ring flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800"
              type="submit"
            >
              <Save size={17} />
              บันทึกข้อมูลโปรไฟล์
            </button>
          </div>
        </form>

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Database className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">แหล่งข้อมูล</h2>
            </div>
            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {sheetSources.map((source) => (
                <div key={source.name} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-bold text-slate-950">{source.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {source.range} · sync {source.lastSync}
                    </p>
                  </div>
                  <span className="self-start rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                    {source.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <KeyRound className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">สภาพแวดล้อมระบบ</h2>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              {envRows.map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <code className="font-semibold text-slate-700">{label}</code>
                  <span className={value === "ยังไม่ตั้งค่า" ? "font-bold text-red-700" : "font-bold text-emerald-700"}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="baojai-card rounded-lg p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-700" size={22} />
            <h2 className="text-xl font-bold text-slate-950">ประวัติการใช้งานล่าสุด</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {recentAuditLogs.length > 0 ? (
              recentAuditLogs.map((event) => (
                <div key={event.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-slate-950">{event.action}</p>
                    <span className="text-xs font-bold text-slate-500">{formatDateTime(event.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {displayValue(event.resourceType, "system")}
                    {event.resourceId ? ` · ${event.resourceId}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
                ยังไม่มี audit log สำหรับผู้ใช้นี้
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
