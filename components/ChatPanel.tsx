"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, UserRound } from "lucide-react";

type Message = {
  role: "assistant" | "user";
  text: string;
  meta?: string;
};

type ChatResponse = {
  reply?: string;
  provider?: "safety" | "ollama" | "fallback";
  model?: string;
  sessionId?: string;
};

type ChatStatus = {
  ok: boolean;
  baseUrl: string;
  model: string;
  models: string[];
  hasConfiguredModel?: boolean;
  error?: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    text: "สวัสดีค่ะ ฉันคือ Baojai ถามเรื่องอาหาร ฉลากโภชนาการ แผนมื้ออาหาร หรือแนวโน้มน้ำตาลหลังอาหารได้เลย",
    meta: "พร้อมตอบคำถาม"
  }
];

function getProviderLabel(provider?: ChatResponse["provider"], model?: string) {
  if (provider === "ollama") {
    return `Ollama · ${model ?? "local model"}`;
  }

  if (provider === "safety") {
    return "Safety guard";
  }

  return model ? `Fallback · ${model}` : "Fallback";
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("มื้อเย็นวันนี้ควรกินอะไร ถ้าน้ำตาลหลังอาหารล่าสุด 126");
  const [sessionId, setSessionId] = useState<string>();
  const [status, setStatus] = useState<ChatStatus>();
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/chat", { method: "GET" });
        const payload = (await response.json()) as ChatStatus;

        if (!cancelled) {
          setStatus(payload);
        }
      } catch {
        if (!cancelled) {
          setStatus({
            ok: false,
            baseUrl: "http://127.0.0.1:11434",
            model: "qwen2.5",
            models: [],
            error: "ไม่สามารถตรวจสอบ Ollama ได้"
          });
        }
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();

    if (!question || isSending) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, sessionId })
      });
      const payload = (await response.json().catch(() => ({}))) as ChatResponse;

      if (!response.ok && !payload.reply) {
        throw new Error(`Chat API returned ${response.status}`);
      }

      const assistantText = payload.reply?.trim() || "ขออภัยค่ะ ยังไม่มีคำตอบจากระบบ";

      setSessionId(payload.sessionId);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: assistantText,
          meta: getProviderLabel(payload.provider, payload.model)
        }
      ]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "ไม่สามารถส่งข้อความได้";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `ยังส่งข้อความไม่สำเร็จ: ${detail}`,
          meta: "Error"
        }
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="baojai-card flex min-h-[640px] flex-col rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 border-b border-emerald-900/10 pb-4">
        <div>
          <p className="text-sm font-bold text-emerald-700">Baojai chatbot</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">ที่ปรึกษาอาหารทั่วไป</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className={`rounded-lg px-2 py-1 ${status?.ok && status.hasConfiguredModel !== false ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
              {status?.ok && status.hasConfiguredModel !== false ? "Ollama พร้อมใช้งาน" : "ใช้คำตอบสำรอง"}
            </span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">Model: {status?.model ?? "qwen2.5"}</span>
          </div>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
          <Bot size={22} />
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-5">
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          const Icon = isUser ? UserRound : Bot;

          return (
            <div key={`${message.role}-${index}`} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser ? (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Icon size={18} />
                </span>
              ) : null}
              <div
                className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  isUser ? "bg-emerald-700 text-white" : "border border-emerald-900/10 bg-white text-slate-700"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.meta ? <p className={`mt-2 text-xs font-bold ${isUser ? "text-emerald-100" : "text-emerald-700"}`}>{message.meta}</p> : null}
              </div>
              {isUser ? (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon size={18} />
                </span>
              ) : null}
            </div>
          );
        })}
        {isSending ? <p className="text-sm font-semibold text-emerald-700">Baojai กำลังคิดคำแนะนำ...</p> : null}
      </div>

      <form onSubmit={submitMessage} className="flex gap-3 border-t border-emerald-900/10 pt-4">
        <input
          className="focus-ring h-12 min-w-0 flex-1 rounded-lg border border-emerald-900/10 bg-white px-4 text-sm"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="ถามเรื่องอาหาร ฉลาก หรือมื้อถัดไป"
        />
        <button
          aria-label="ส่งข้อความ"
          className="focus-ring grid h-12 w-12 place-items-center rounded-lg bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isSending}
          title="ส่งข้อความ"
          type="submit"
        >
          <Send size={18} />
        </button>
      </form>
      {status?.ok && status.hasConfiguredModel === false ? (
        <p className="mt-3 text-xs leading-5 text-amber-800">
          ยังไม่พบโมเดล {status.model} ใน Ollama ให้รันคำสั่ง `ollama pull {status.model}` หรือเปลี่ยน OLLAMA_MODEL ในไฟล์ .env.local
        </p>
      ) : null}
      {!status?.ok ? (
        <p className="mt-3 text-xs leading-5 text-amber-800">
          เปิด Ollama แล้วรัน `ollama pull {status?.model ?? "qwen2.5"}` หากต้องการใช้โมเดลในเครื่อง ตอนนี้ระบบจะแสดงคำตอบสำรองให้ก่อน
        </p>
      ) : null}
    </section>
  );
}
