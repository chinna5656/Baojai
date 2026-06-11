import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const expectedTables = [
  "allergies",
  "audit_logs",
  "chat_messages",
  "chat_sessions",
  "food_logs",
  "foods",
  "glucose_logs",
  "google_sheet_sources",
  "meal_plan_items",
  "meal_plans",
  "nutrition_labels",
  "sheet_sync_runs",
  "user_health_settings",
  "user_profiles",
  "users"
];

let tempDir: string;
let db: Database.Database;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), "baojai-sqlite-"));
  db = new Database(path.join(tempDir, "test.sqlite"));
  db.pragma("foreign_keys = ON");

  const migrationFile = readFileSync(path.join(process.cwd(), "db/migrations/0000_spotty_marrow.sql"), "utf8");
  const migration = (migrationFile.match(/\/\*([\s\S]*)\*\//)?.[1] ?? migrationFile)
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean)
    .join("\n");

  db.exec(migration);
});

afterEach(async () => {
  db.close();
  await rm(tempDir, { recursive: true, force: true });
});

describe("SQLite schema", () => {
  it("creates every application table", () => {
    const tables = db
      .prepare(
        "select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name"
      )
      .all()
      .map((row) => (row as { name: string }).name);

    expect(tables).toEqual(expectedTables);
  });

  it("keeps foreign keys enabled and valid", () => {
    const foreignKeySetting = db.pragma("foreign_keys", { simple: true });
    const violations = db.pragma("foreign_key_check");

    expect(foreignKeySetting).toBe(1);
    expect(violations).toEqual([]);
  });

  it("inserts, reads, and cascades user-owned data", () => {
    const userId = "test-user-id";
    const profileId = "test-profile-id";
    const settingsId = "test-settings-id";
    const allergyId = "test-allergy-id";

    db.prepare("insert into users (id, email, password_hash) values (?, ?, ?)").run(
      userId,
      "test@baojai.app",
      "hash"
    );
    db.prepare("insert into user_profiles (id, user_id, display_name) values (?, ?, ?)").run(
      profileId,
      userId,
      "Test User"
    );
    db.prepare("insert into user_health_settings (id, user_id) values (?, ?)").run(settingsId, userId);
    db.prepare("insert into allergies (id, user_id, name) values (?, ?, ?)").run(
      allergyId,
      userId,
      "peanut"
    );

    const savedUser = db.prepare("select id, email from users where id = ?").get(userId);
    const savedProfile = db.prepare("select display_name from user_profiles where user_id = ?").get(userId);
    const savedAllergies = db.prepare("select name from allergies where user_id = ?").all(userId);

    expect(savedUser).toEqual({ id: userId, email: "test@baojai.app" });
    expect(savedProfile).toEqual({ display_name: "Test User" });
    expect(savedAllergies).toEqual([{ name: "peanut" }]);

    db.prepare("delete from users where id = ?").run(userId);

    expect(db.prepare("select count(*) as count from user_profiles").get()).toEqual({ count: 0 });
    expect(db.prepare("select count(*) as count from user_health_settings").get()).toEqual({ count: 0 });
    expect(db.prepare("select count(*) as count from allergies").get()).toEqual({ count: 0 });
  });
});
