import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { sheetSyncRuns } from "@/db/schema";
import { importBaojaiSheets, SHEET_RANGES } from "@/lib/google-sheets";
import { sheetSources } from "@/lib/mock-data";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

const requiredEnv = ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_SHEET_ID"];

export async function POST() {
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    return NextResponse.json({
      mode: "not_configured",
      message: "Google Sheets sync is ready, but credentials are not configured yet.",
      missingEnv,
      expectedRanges: SHEET_RANGES,
      previewSources: sheetSources
    });
  }

  const startedAt = new Date();

  try {
    const result = await importBaojaiSheets();
    const rowsImported = result.foods.length + result.menus.length + result.riskRules.length;
    const db = getDb();

    if (db) {
      await db.insert(sheetSyncRuns).values({
        status: "success",
        rowsImported,
        startedAt,
        finishedAt: new Date()
      });
    }

    await writeAuditLog({
      action: "sheet_sync.success",
      resourceType: "google_sheet",
      metadata: {
        rowsImported,
        ranges: SHEET_RANGES
      }
    });

    return NextResponse.json({ mode: db ? "database" : "preview", rowsImported, result });
  } catch (error) {
    const db = getDb();
    const message = error instanceof Error ? error.message : "Unknown Google Sheets sync error";

    if (db) {
      await db.insert(sheetSyncRuns).values({
        status: "failed",
        rowsImported: 0,
        errors: [message],
        startedAt,
        finishedAt: new Date()
      });
    }

    await writeAuditLog({
      action: "sheet_sync.failed",
      resourceType: "google_sheet",
      metadata: { message }
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
