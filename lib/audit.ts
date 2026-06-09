import { getDb } from "@/db/client";
import { auditLogs } from "@/db/schema";

export type AuditEvent = {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

export async function writeAuditLog(event: AuditEvent) {
  const db = getDb();

  if (!db) {
    console.info("[audit:fallback]", event);
    return { mode: "fallback", event };
  }

  await db.insert(auditLogs).values({
    userId: event.userId,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    metadata: event.metadata,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent
  });

  return { mode: "database", event };
}
