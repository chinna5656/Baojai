import { Activity, Gauge, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MiniTrendChart } from "@/components/MiniTrendChart";
import { SectionTitle } from "@/components/SectionTitle";
import { requireUser } from "@/lib/auth";
import { glucosePoints, monthlyGlucosePoints } from "@/lib/mock-data";

export default async function GlucosePage() {
  const user = await requireUser();

  return (
    <AppShell active="glucose" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Blood glucose"
          title="วิเคราะห์แนวโน้มระดับน้ำตาลในเลือด"
          detail="ติดตามค่าน้ำตาลตามช่วงเวลาและบริบท เช่น ก่อนอาหาร หลังอาหาร หรือก่อนนอน เพื่อดูแนวโน้มโดยไม่วินิจฉัยโรค"
        />

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-700">7-day trend</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">หลังอาหารเฉลี่ย 126 mg/dL</h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                <Activity size={22} />
              </span>
            </div>
            <div className="mt-5 h-72 rounded-lg border border-emerald-900/10 bg-white p-4">
              <MiniTrendChart points={glucosePoints} />
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                <Plus size={20} />
              </span>
              <h2 className="text-xl font-bold text-slate-950">เพิ่มค่าน้ำตาล</h2>
            </div>

            <form className="mt-5 grid gap-4">
              <label className="text-sm font-bold text-slate-700">
                ค่า glucose
                <input className="focus-ring mt-2 h-12 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm" defaultValue="126" type="number" />
              </label>
              <label className="text-sm font-bold text-slate-700">
                บริบท
                <select className="focus-ring mt-2 h-12 w-full rounded-lg border border-emerald-900/10 bg-white px-3 text-sm">
                  <option>หลังอาหาร 2 ชั่วโมง</option>
                  <option>ก่อนอาหาร</option>
                  <option>ตอนเช้าอดอาหาร</option>
                  <option>ก่อนนอน</option>
                </select>
              </label>
              <label className="text-sm font-bold text-slate-700">
                หมายเหตุ
                <textarea className="focus-ring mt-2 min-h-24 w-full rounded-lg border border-emerald-900/10 bg-white px-3 py-3 text-sm" defaultValue="กินข้าวไรซ์เบอร์รีและแกงเลียง" />
              </label>
              <button className="focus-ring h-11 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800" type="button">
                บันทึกค่าน้ำตาล
              </button>
            </form>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <section className="baojai-card rounded-lg p-5 xl:col-span-2">
            <p className="text-sm font-bold text-emerald-700">Monthly average</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">ค่าเฉลี่ยรายสัปดาห์ลดลงต่อเนื่อง</h2>
            <div className="mt-5 h-52 rounded-lg border border-emerald-900/10 bg-white p-4">
              <MiniTrendChart points={monthlyGlucosePoints} stroke="#65a30d" />
            </div>
          </section>

          <section className="baojai-card rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Gauge className="text-emerald-700" size={22} />
              <h2 className="text-xl font-bold text-slate-950">Pattern insight</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              ค่าเกินกรอบมักเกิดหลังเครื่องดื่มหวานช่วงบ่าย แนะนำเปลี่ยนเป็นชาไม่หวานหรือของว่างที่มีโปรตีนร่วมกับไฟเบอร์
            </p>
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              หากมีค่าน้ำตาลต่ำ/สูงผิดปกติซ้ำ ๆ หรือมีอาการไม่สบาย ควรติดต่อบุคลากรทางการแพทย์
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
