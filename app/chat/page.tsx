import { Server, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChatPanel } from "@/components/ChatPanel";
import { SectionTitle } from "@/components/SectionTitle";
import { getOllamaConfig } from "@/lib/ollama";
import { requireUser } from "@/lib/auth";

export default async function ChatPage() {
  const user = await requireUser();
  const ollama = getOllamaConfig();

  return (
    <AppShell active="chat" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Chatbot"
          title="แชทบอทพร้อมเชื่อมต่อ Ollama"
          detail="ตอบคำถามทั่วไปเรื่องอาหาร ฉลาก และแผนมื้ออาหาร โดยมี safety boundary ไม่วินิจฉัยโรคหรือปรับยา"
        />

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <ChatPanel />
          <aside className="space-y-5">
            <section className="baojai-card rounded-lg p-5">
              <div className="flex items-center gap-3">
                <Server className="text-emerald-700" size={22} />
                <h2 className="text-xl font-bold text-slate-950">Ollama connection</h2>
              </div>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                <p>
                  Base URL: <span className="font-bold text-slate-900">{ollama.baseUrl}</span>
                </p>
                <p>
                  Model: <span className="font-bold text-slate-900">{ollama.model}</span>
                </p>
                <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs leading-5 text-emerald-100">
                  <p>ollama serve</p>
                  <p>ollama pull {ollama.model}</p>
                </div>
              </div>
            </section>

            <section className="baojai-card rounded-lg p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-700" size={22} />
                <h2 className="text-xl font-bold text-slate-950">ขอบเขตความปลอดภัย</h2>
              </div>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                <li>• ไม่วินิจฉัยโรคหรือแปลผลแทนแพทย์</li>
                <li>• ไม่แนะนำปรับยา อินซูลิน หรือหยุดยา</li>
                <li>• ถ้ามีอาการฉุกเฉินให้ติดต่อหน่วยแพทย์ทันที</li>
                <li>• บันทึก prompt, response, model และ safety flags ลง audit log</li>
              </ul>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-950">ตัวอย่างคำถามที่เหมาะสม</p>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-amber-900">
                <p>มื้อเย็นวันนี้ควรลดคาร์บยังไง</p>
                <p>ฉลากนี้น้ำตาลสูงไปไหม</p>
                <p>มีเมนูไทยที่ไม่ใส่ถั่วลิสงไหม</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
