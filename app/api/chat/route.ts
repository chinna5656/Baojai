import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { chatMessages, chatSessions } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { askOllama, checkOllamaStatus, getOllamaConfig, type OllamaChatMessage } from "@/lib/ollama";

const chatSchema = z.object({
  message: z.string().min(1).max(1200),
  sessionId: z.string().optional()
});

const blockedMedicalKeywords = [
  "ปรับยา",
  "หยุดยา",
  "เพิ่มยา",
  "ลดอินซูลิน",
  "เพิ่มอินซูลิน",
  "ฉุกเฉิน",
  "หมดสติ",
  "แน่นหน้าอก",
  "หายใจไม่ออก",
  "insulin dose",
  "stop medication",
  "change medication",
  "emergency"
];

const safetySystemPrompt = `
คุณคือ Baojai ผู้ช่วยภาษาไทยด้านอาหาร ฉลากโภชนาการ การวางแผนมื้ออาหาร และการติดตามน้ำตาลในเลือด
ตอบเป็นภาษาไทย กระชับ ใช้ภาษาที่เข้าใจง่าย และเน้นคำแนะนำทั่วไปที่ปลอดภัย
ห้ามวินิจฉัยโรค ห้ามสั่งยา ห้ามปรับยา อินซูลิน หรือแผนรักษาเฉพาะบุคคล
ถ้าคำถามเกี่ยวกับอาการฉุกเฉิน ยา หรือผลตรวจที่เสี่ยง ให้แนะนำพบแพทย์หรือเภสัชกรโดยตรง
สำหรับอาหาร ให้แนะนำการคุม portion ลดน้ำหวาน เลือกโปรตีน/ผัก/คาร์บเชิงซ้อน และบันทึก glucose หลังอาหารเมื่อเหมาะสม
`.trim();

function getSafetyFlags(message: string) {
  const normalizedMessage = message.toLowerCase();

  return blockedMedicalKeywords.filter((keyword) => normalizedMessage.includes(keyword.toLowerCase()));
}

function getSafetyReply() {
  return "เรื่องยา อินซูลิน อาการฉุกเฉิน หรือการรักษาเฉพาะบุคคลควรปรึกษาแพทย์หรือเภสัชกรโดยตรงนะคะ Baojai ช่วยแนะนำเรื่องอาหารทั่วไปได้ เช่น เลือกมื้อที่น้ำตาลต่ำ คุม portion เพิ่มผักและโปรตีน และหลีกเลี่ยงเครื่องดื่มหวาน";
}

function getFallbackReply(error: unknown) {
  const { baseUrl, model } = getOllamaConfig();
  const detail = error instanceof Error ? error.message : "ไม่สามารถเชื่อมต่อ Ollama ได้";

  return `ยังเชื่อมต่อ Ollama ไม่สำเร็จ (${detail})\n\nตรวจสอบบนเครื่อง:\n1. เปิด Ollama\n2. รันคำสั่ง ollama pull ${model}\n3. ตรวจว่า server อยู่ที่ ${baseUrl}\n\nระหว่างนี้ Baojai ยังพร้อมตอบด้วยระบบ fallback: ถามเรื่องอาหาร ฉลาก หรือแผนมื้ออาหารได้ และควรเลี่ยงคำแนะนำด้านยา/การรักษาเฉพาะบุคคล`;
}

async function saveChatExchange(input: {
  userId?: string;
  sessionId?: string;
  userMessage: string;
  assistantReply: string;
  model: string;
  safetyFlags: string[];
}) {
  if (!input.userId) {
    return undefined;
  }

  const db = getDb();
  const sessionId =
    input.sessionId ??
    db
      .insert(chatSessions)
      .values({
        userId: input.userId,
        title: input.userMessage.slice(0, 80)
      })
      .returning({ id: chatSessions.id })
      .get().id;

  db.insert(chatMessages)
    .values([
      {
        sessionId,
        userId: input.userId,
        role: "user",
        content: input.userMessage,
        model: input.model,
        safetyFlags: input.safetyFlags
      },
      {
        sessionId,
        userId: input.userId,
        role: "assistant",
        content: input.assistantReply,
        model: input.model,
        safetyFlags: input.safetyFlags
      }
    ])
    .run();

  return sessionId;
}

export async function GET() {
  const status = await checkOllamaStatus();

  return NextResponse.json({
    provider: "ollama",
    ...status
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const { message, sessionId } = chatSchema.parse(await request.json());
  const safetyFlags = getSafetyFlags(message);
  const config = getOllamaConfig();

  let reply: string;
  let provider: "safety" | "ollama" | "fallback";
  let model = config.model;

  if (safetyFlags.length > 0) {
    reply = getSafetyReply();
    provider = "safety";
    model = "local-safety-guard";
  } else {
    try {
      const messages: OllamaChatMessage[] = [
        { role: "system", content: safetySystemPrompt },
        { role: "user", content: message }
      ];
      const result = await askOllama(messages);

      reply = result.content;
      model = result.model;
      provider = "ollama";
    } catch (error) {
      reply = getFallbackReply(error);
      provider = "fallback";
    }
  }

  const savedSessionId = await saveChatExchange({
    userId: user?.id,
    sessionId,
    userMessage: message,
    assistantReply: reply,
    model,
    safetyFlags
  });

  await writeAuditLog({
    userId: user?.id,
    action: "chat.message.responded",
    resourceType: "chat_message",
    resourceId: savedSessionId,
    metadata: {
      promptLength: message.length,
      safetyFlags,
      model,
      provider
    }
  });

  return NextResponse.json({
    reply,
    safetyFlags,
    provider,
    model,
    sessionId: savedSessionId
  });
}
