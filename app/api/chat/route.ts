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
สำหรับอาหาร ให้แนะนำการคุม portion ลดน้ำหวาน เลือกโปรตีน ผัก คาร์บเชิงซ้อน และบันทึก glucose หลังอาหารเมื่อเหมาะสม
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

  return `ยังเชื่อมต่อ Ollama ไม่สำเร็จ (${detail})

ตรวจสอบบนเครื่อง:
1. เปิด Ollama
2. รันคำสั่ง ollama pull ${model}
3. ตรวจว่า server อยู่ที่ ${baseUrl}

ระหว่างนี้ Baojai จะแสดงคำตอบสำรองให้ก่อน: เลือกมื้อที่มีโปรตีนและผักเป็นหลัก ลดเครื่องดื่มหวาน คุมปริมาณคาร์บ และบันทึก glucose หลังอาหารเพื่อดูแนวโน้ม`;
}

function getMissingModelReply(model: string, baseUrl: string, models: string[]) {
  const installedModels = models.length > 0 ? models.join(", ") : "ยังไม่พบโมเดลในเครื่อง";

  return `ยังไม่พบโมเดล ${model} ใน Ollama

ให้รันคำสั่ง:
ollama pull ${model}

Ollama server: ${baseUrl}
โมเดลที่พบตอนนี้: ${installedModels}

ระหว่างนี้ Baojai จะแสดงคำตอบสำรองให้ก่อน: ถ้าต้องวางแผนมื้ออาหาร ให้เริ่มจากผักครึ่งจาน โปรตีนหนึ่งส่วน คาร์บเชิงซ้อนหนึ่งส่วน ลดน้ำหวาน และบันทึก glucose หลังอาหารเพื่อดูผลจริง`;
}

async function saveChatExchange(input: {
  userId?: string;
  sessionId?: string;
  userMessage: string;
  assistantReply: string;
  model: string;
  safetyFlags: string[];
}) {
  if (!input.userId || input.userId === "demo") {
    return undefined;
  }

  try {
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
  } catch (error) {
    console.warn("[chat] skipped database chat log", error);
    return undefined;
  }
}

async function safeAuditLog(input: {
  userId?: string;
  sessionId?: string;
  message: string;
  safetyFlags: string[];
  model: string;
  provider: string;
}) {
  try {
    await writeAuditLog({
      userId: input.userId === "demo" ? undefined : input.userId,
      action: "chat.message.responded",
      resourceType: "chat_message",
      resourceId: input.sessionId,
      metadata: {
        promptLength: input.message.length,
        safetyFlags: input.safetyFlags,
        model: input.model,
        provider: input.provider
      }
    });
  } catch (error) {
    console.warn("[chat] skipped audit log", error);
  }
}

export async function GET() {
  const status = await checkOllamaStatus();

  return NextResponse.json({
    provider: "ollama",
    ...status
  });
}

export async function POST(request: Request) {
  const parsed = chatSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      {
        reply: "กรุณาพิมพ์คำถามให้ถูกต้อง ความยาวไม่เกิน 1200 ตัวอักษร",
        safetyFlags: [],
        provider: "fallback",
        model: "validation"
      },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();
  const { message, sessionId } = parsed.data;
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
    const status = await checkOllamaStatus();

    if (!status.ok) {
      reply = getFallbackReply(new Error(status.error ?? "Ollama is not ready"));
      provider = "fallback";
    } else if (status.hasConfiguredModel === false) {
      reply = getMissingModelReply(status.model, status.baseUrl, status.models);
      provider = "fallback";
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
  }

  const savedSessionId = await saveChatExchange({
    userId: user?.id,
    sessionId,
    userMessage: message,
    assistantReply: reply,
    model,
    safetyFlags
  });

  await safeAuditLog({
    userId: user?.id,
    sessionId: savedSessionId,
    message,
    safetyFlags,
    model,
    provider
  });

  return NextResponse.json({
    reply,
    safetyFlags,
    provider,
    model,
    sessionId: savedSessionId ?? sessionId
  });
}
