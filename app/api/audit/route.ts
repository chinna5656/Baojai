import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { auditLogs } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { auditEvents } from "@/lib/mock-data";

const auditSchema = z.object({
  action: z.string().min(1),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export async function GET() {
  const db = getDb();

  if (db) {
    const events = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
    return NextResponse.json({ events, mode: "database" });
  }

  return NextResponse.json({ events: auditEvents });
}

export async function POST(request: Request) {
  const payload = auditSchema.parse(await request.json());
  const result = await writeAuditLog(payload);

  return NextResponse.json(result);
}
