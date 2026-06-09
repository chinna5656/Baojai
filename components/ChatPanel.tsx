"use client";

import { useState, useTransition } from "react";
import { Bot, Send, UserRound } from "lucide-react";
import { chatMessages } from "@/lib/mock-data";

type Message = {
  role: "assistant" | "user";
  text: string;
};

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(chatMessages as Message[]);
  const [input, setInput] = useState("มื้อเย็นวันนี้ควรกินอะไร ถ้าน้ำตาลหลังอาหารล่าสุด 126");
  const [isPending, startTransition] = useTransition();

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();

    if (!question) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");

    startTransition(async () => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question })
      });
      const payload = (await response.json()) as { reply: string };
      setMessages((current) => [...current, { role: "assistant", text: payload.reply }]);
    });
  }

  return (
    <section className="baojai-card flex min-h-[640px] flex-col rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 border-b border-emerald-900/10 pb-4">
        <div>
          <p className="text-sm font-bold text-emerald-700">Baojai chatbot</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">ที่ปรึกษาอาหารทั่วไป</h2>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
          <Bot size={22} />
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto py-5">
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
                {message.text}
              </div>
              {isUser ? (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon size={18} />
                </span>
              ) : null}
            </div>
          );
        })}
        {isPending ? <p className="text-sm font-semibold text-emerald-700">Baojai กำลังคิดคำแนะนำ...</p> : null}
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
          className="focus-ring grid h-12 w-12 place-items-center rounded-lg bg-emerald-700 text-white transition hover:bg-emerald-800"
          title="ส่งข้อความ"
          type="submit"
        >
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}
