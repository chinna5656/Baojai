import { NextResponse } from "next/server";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";

const chatSchema = z.object({
  message: z.string().min(1).max(1200)
});

const blockedMedicalKeywords = [
  "ปรับยา",
  "หยุดยา",
  "เพิ่มยา",
  "อินซูลิน",
  "ฉุกเฉิน",
  "หมดสติ",
  "แน่นหน้าอก"
];

export async function POST(request: Request) {
  const { message } = chatSchema.parse(await request.json());
  const safetyFlags = blockedMedicalKeywords.filter((keyword) => message.includes(keyword));
  const reply =
    safetyFlags.length > 0
      ? "เรื่องยา อาการฉุกเฉิน หรือการรักษาเฉพาะบุคคลควรปรึกษาแพทย์หรือเภสัชกรโดยตรงค่ะ Baojai ช่วยแนะนำอาหารทั่วไปได้ เช่น เลือกมื้อที่น้ำตาลต่ำ คุม portion และเลี่ยงเครื่องดื่มหวาน"
      : "สำหรับมื้อถัดไป แนะนำเลือกเมนูที่มีโปรตีนและผักเป็นหลัก เช่น ต้มจืดเต้าหู้ อกไก่สมุนไพร หรือปลา/เต้าหู้ย่าง จับคู่คาร์บเชิงซ้อนใน portion พอดี และหลีกเลี่ยงเครื่องดื่มหวานค่ะ";

  await writeAuditLog({
    action: "chat.message.responded",
    resourceType: "chat_message",
    metadata: {
      promptLength: message.length,
      safetyFlags,
      model: "local-safety-template"
    }
  });

  return NextResponse.json({ reply, safetyFlags });
}
