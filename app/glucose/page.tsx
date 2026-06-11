import { desc, eq } from "drizzle-orm";
import { Activity, Gauge, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MiniTrendChart } from "@/components/MiniTrendChart";
import { SectionTitle } from "@/components/SectionTitle";
import { getDb } from "@/db/client";
import { glucoseLogs } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { glucosePoints, monthlyGlucosePoints } from "@/lib/mock-data";
import { deleteGlucoseLogAction, logGlucoseAction } from "./actions";

const contextLabels = {
  fasting: "Fasting",
  before_meal: "Before meal",
  after_meal: "After meal",
  bedtime: "Bedtime",
  other: "Other"
} as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function toDateTimeLocalValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 16);
}

export default async function GlucosePage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const db = getDb();
  const logs = db
    .select()
    .from(glucoseLogs)
    .where(eq(glucoseLogs.userId, user.id))
    .orderBy(desc(glucoseLogs.measuredAt))
    .limit(12)
    .all();

  const chartPoints =
    logs.length > 0
      ? logs
          .slice(0, 7)
          .reverse()
          .map((log) => ({
            label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(log.measuredAt),
            value: log.value
          }))
      : glucosePoints;
  const latestValue = logs[0]?.value;
  const sevenDayAverage = logs.length > 0 ? average(logs.slice(0, 7).map((log) => log.value)) : 126;

  return (
    <AppShell active="glucose" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Blood glucose"
          title="วิเคราะห์แนวโน้มระดับน้ำตาลในเลือด"
          detail="ติดตามค่าน้ำตาลตามช่วงเวลาและบริบท เช่น ก่อนอาหาร หลังอาหาร หรือก่อนนอน เพื่อดูแนวโน้มโดยไม่วินิจฉัยโรค"
        />

        {params.saved === "1" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            ค่าน้ำตาลในเลือดถูกบันทึกแล้ว
          </div>
        ) : null}

        {params.deleted === "1" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            ค่าน้ำตาลในเลือดถูกลบแล้ว
          </div>
        ) : null}

        {params.error === "invalid-value" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            ป้อนค่าน้ำตาลในเลือดระหว่าง 20 ถึง 600 mg/dL
          </div>
        ) : null}

        {params.error === "invalid-time" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            เลือกวันที่และเวลาที่ถูกต้อง
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="baojai-card rounded-lg border border-emerald-900/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-700">แนวโน้มล่าสุด</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {latestValue ? `${latestValue} mg/dL ล่าสุด` : `${sevenDayAverage} mg/dL ค่าเฉลี่ย`}
                </h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                <Activity size={22} />
              </span>
            </div>
            <div className="mt-5 h-72 rounded-lg border border-emerald-900/10 bg-white p-4">
              <MiniTrendChart points={chartPoints} />
            </div>
          </section>

          <section className="baojai-card rounded-lg border border-emerald-900/5 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                <Plus size={20} />
              </span>
              <h2 className="text-xl font-bold text-slate-950">เพิ่มค่าน้ำตาล</h2>
            </div>

            <form action={logGlucoseAction} className="mt-5 grid gap-4">
              <label className="text-sm font-bold text-slate-700">
                ค่าน้ำตาลในเลือด (mg/dL)
                <input
                  name="glucoseValue"
                  className="focus-ring mt-2 h-12 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                  defaultValue={latestValue ?? 126}
                  inputMode="numeric"
                  max={600}
                  min={20}
                  required
                  type="number"
                />
              </label>

              <label className="text-sm font-bold text-slate-700">
                บริบท
                <select
                  name="context"
                  className="focus-ring mt-2 h-12 w-full cursor-pointer rounded-lg border border-emerald-900/10 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-500"
                  defaultValue="after_meal"
                >
                  <option value="fasting">อดอาหาร</option>
                  <option value="before_meal">ก่อนอาหาร</option>
                  <option value="after_meal">หลังอาหาร</option>
                  <option value="bedtime">ก่อนนอน</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </label>

              <label className="text-sm font-bold text-slate-700">
                เวลาวัด
                <input
                  name="measuredAt"
                  className="focus-ring mt-2 h-12 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-500"
                  defaultValue={toDateTimeLocalValue(new Date())}
                  type="datetime-local"
                />
              </label>

              <label className="text-sm font-bold text-slate-700">
                หมายเหตุ
                <textarea
                  name="notes"
                  className="focus-ring mt-2 min-h-24 w-full rounded-lg border border-emerald-900/10 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500"
                  placeholder="อาหาร, กิจกรรม, อาการ, หรือเวลา"
                />
              </label>

              <button
                className="focus-ring h-11 w-full rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-[0.99]"
                type="submit"
              >
                บันทึกค่าน้ำตาล
              </button>
            </form>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <section className="baojai-card rounded-lg border border-emerald-900/5 bg-white p-5 shadow-sm xl:col-span-2">
            <p className="text-sm font-bold text-emerald-700">แนวโน้มล่าสุด</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {logs.length > 0 ? `${logs.length} ค่าที่บันทึกไว้` : "ยังไม่มีค่าน้ำตาลในเลือดที่บันทึกไว้"}
            </h2>

            <div className="mt-5 overflow-hidden rounded-lg border border-emerald-900/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-emerald-50 text-xs font-bold uppercase text-emerald-900">
                  <tr>
                    <th className="px-4 py-3">เวลา</th>
                    <th className="px-4 py-3">ค่า</th>
                    <th className="px-4 py-3">บริบท</th>
                    <th className="px-4 py-3">หมายเหตุ</th>
                    <th className="px-4 py-3 text-right">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/10">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3 font-semibold text-slate-700">{formatDateTime(log.measuredAt)}</td>
                        <td className="px-4 py-3 font-bold text-slate-950">{log.value} mg/dL</td>
                        <td className="px-4 py-3 text-slate-600">{contextLabels[log.context]}</td>
                        <td className="px-4 py-3 text-slate-600">{log.notes || "-"}</td>
                        <td className="px-4 py-3">
                          <form action={deleteGlucoseLogAction} className="flex justify-end">
                            <input name="logId" type="hidden" value={log.id} />
                            <button
                              className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                              title="Delete glucose reading"
                              type="submit"
                            >
                              <Trash2 size={16} />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                        เพิ่มค่าน้ำตาลในเลือดแรกของคุณ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="baojai-card rounded-lg border border-emerald-900/5 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Gauge className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">สรุป</h2>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-3">
                <dt className="font-semibold text-emerald-900">เฉลี่ย</dt>
                <dd className="font-bold text-emerald-950">{sevenDayAverage} mg/dL</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-3 py-3 ring-1 ring-emerald-900/10">
                <dt className="font-semibold text-slate-700">เป้าหมาย</dt>
                <dd className="font-bold text-slate-950">{user.glucoseTarget}</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-3 py-3 ring-1 ring-emerald-900/10">
                <dt className="font-semibold text-slate-700">บันทึก</dt>
                <dd className="font-bold text-slate-950">{logs.length}</dd>
              </div>
            </dl>
            <div className="mt-5 h-44 rounded-lg border border-emerald-900/10 bg-white p-4">
              <MiniTrendChart points={monthlyGlucosePoints} stroke="#65a30d" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
