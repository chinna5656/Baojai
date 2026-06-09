import { AppShell } from "@/components/AppShell";
import { LabelAnalyzer } from "@/components/LabelAnalyzer";
import { SectionTitle } from "@/components/SectionTitle";
import { requireUser } from "@/lib/auth";

export default async function LabelPage() {
  const user = await requireUser();

  return (
    <AppShell active="label" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionTitle
          eyebrow="Nutrition label"
          title="วิเคราะห์ฉลากโภชนาการ"
          detail="กรอกค่าจากฉลากหรือใช้ข้อมูลที่ OCR ดึงมาในอนาคต ระบบจะเตือนอาหารเสี่ยงตามเป้าหมายสุขภาพและกฎจาก Google Sheets"
        />
        <LabelAnalyzer />
      </div>
    </AppShell>
  );
}
