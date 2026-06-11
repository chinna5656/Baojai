import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text
} from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`).notNull();

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`).notNull();

const id = () =>
  text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey();

export const mealTypes = ["breakfast", "lunch", "dinner", "snack", "drink"] as const;
export const glucoseContexts = ["fasting", "before_meal", "after_meal", "bedtime", "other"] as const;
export const riskSeverities = ["low", "medium", "high"] as const;
export const syncStatuses = ["queued", "running", "success", "failed"] as const;

export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role").default("user").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const userProfiles = sqliteTable(
  "user_profiles",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    ageRange: text("age_range"),
    sex: text("sex"),
    heightCm: integer("height_cm"),
    weightKg: real("weight_kg"),
    activityLevel: text("activity_level"),
    healthGoals: text("health_goals", { mode: "json" }).$type<string[]>(),
    dietaryStyle: text("dietary_style"),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("user_profiles_user_idx").on(table.userId)]
);

export const userHealthSettings = sqliteTable(
  "user_health_settings",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dailySugarLimitG: integer("daily_sugar_limit_g").default(24).notNull(),
    dailyCarbTargetG: integer("daily_carb_target_g").default(165).notNull(),
    sodiumLimitMg: integer("sodium_limit_mg").default(2000).notNull(),
    glucoseTargetMin: integer("glucose_target_min").default(80).notNull(),
    glucoseTargetMax: integer("glucose_target_max").default(140).notNull(),
    medicalDisclaimerAccepted: integer("medical_disclaimer_accepted", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("user_health_settings_user_idx").on(table.userId)]
);

export const allergies = sqliteTable(
  "allergies",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    notes: text("notes"),
    createdAt: createdAt()
  },
  (table) => [index("allergies_user_idx").on(table.userId)]
);

export const foods = sqliteTable("foods", {
  id: id(),
  externalId: text("external_id"),
  source: text("source").default("local").notNull(),
  name: text("name").notNull(),
  servingSizeG: integer("serving_size_g"),
  calories: integer("calories"),
  carbG: real("carb_g"),
  sugarG: real("sugar_g"),
  proteinG: real("protein_g"),
  fatG: real("fat_g"),
  sodiumMg: integer("sodium_mg"),
  mealType: text("meal_type", { enum: mealTypes }),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  allergens: text("allergens", { mode: "json" }).$type<string[]>(),
  glycemicNote: text("glycemic_note"),
  imageUrl: text("image_url"),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const nutritionLabels = sqliteTable(
  "nutrition_labels",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    foodName: text("food_name"),
    imageUrl: text("image_url"),
    parsedData: text("parsed_data", { mode: "json" }).$type<Record<string, unknown>>(),
    riskScore: integer("risk_score").default(0).notNull(),
    riskLevel: text("risk_level", { enum: riskSeverities }).default("low").notNull(),
    analysisResult: text("analysis_result", { mode: "json" }).$type<Record<string, unknown>>(),
    createdAt: createdAt()
  },
  (table) => [index("nutrition_labels_user_idx").on(table.userId)]
);

export const foodLogs = sqliteTable(
  "food_logs",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    foodId: text("food_id").references(() => foods.id, { onDelete: "set null" }),
    mealType: text("meal_type", { enum: mealTypes }).notNull(),
    eatenAt: integer("eaten_at", { mode: "timestamp_ms" }).notNull(),
    foodName: text("food_name").notNull(),
    servingSizeG: integer("serving_size_g"),
    calories: integer("calories"),
    carbG: real("carb_g"),
    sugarG: real("sugar_g"),
    proteinG: real("protein_g"),
    fatG: real("fat_g"),
    sodiumMg: integer("sodium_mg"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("food_logs_user_date_idx").on(table.userId, table.eatenAt)]
);

export const glucoseLogs = sqliteTable(
  "glucose_logs",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    measuredAt: integer("measured_at", { mode: "timestamp_ms" }).notNull(),
    value: integer("value").notNull(),
    unit: text("unit").default("mg/dL").notNull(),
    context: text("context", { enum: glucoseContexts }).default("other").notNull(),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("glucose_logs_user_date_idx").on(table.userId, table.measuredAt)]
);

export const mealPlans = sqliteTable(
  "meal_plans",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planDate: integer("plan_date", { mode: "timestamp_ms" }).notNull(),
    title: text("title").notNull(),
    rationale: text("rationale"),
    nutritionTotals: text("nutrition_totals", { mode: "json" }).$type<Record<string, number>>(),
    status: text("status").default("draft").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("meal_plans_user_date_idx").on(table.userId, table.planDate)]
);

export const mealPlanItems = sqliteTable(
  "meal_plan_items",
  {
    id: id(),
    mealPlanId: text("meal_plan_id")
      .notNull()
      .references(() => mealPlans.id, { onDelete: "cascade" }),
    foodId: text("food_id").references(() => foods.id, { onDelete: "set null" }),
    slot: text("slot", { enum: mealTypes }).notNull(),
    menuName: text("menu_name").notNull(),
    note: text("note"),
    nutrition: text("nutrition", { mode: "json" }).$type<Record<string, number>>(),
    completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
    createdAt: createdAt()
  },
  (table) => [index("meal_plan_items_plan_idx").on(table.mealPlanId)]
);

export const chatSessions = sqliteTable(
  "chat_sessions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("chat_sessions_user_idx").on(table.userId)]
);

export const chatMessages = sqliteTable(
  "chat_messages",
  {
    id: id(),
    sessionId: text("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    model: text("model"),
    safetyFlags: text("safety_flags", { mode: "json" }).$type<string[]>(),
    createdAt: createdAt()
  },
  (table) => [index("chat_messages_session_idx").on(table.sessionId)]
);

export const googleSheetSources = sqliteTable("google_sheet_sources", {
  id: id(),
  name: text("name").notNull(),
  spreadsheetId: text("spreadsheet_id").notNull(),
  sheetName: text("sheet_name").notNull(),
  range: text("range").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const sheetSyncRuns = sqliteTable(
  "sheet_sync_runs",
  {
    id: id(),
    sourceId: text("source_id").references(() => googleSheetSources.id, { onDelete: "set null" }),
    status: text("status", { enum: syncStatuses }).default("queued").notNull(),
    rowsImported: integer("rows_imported").default(0).notNull(),
    errors: text("errors", { mode: "json" }).$type<string[]>(),
    startedAt: integer("started_at", { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`).notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" })
  },
  (table) => [index("sheet_sync_runs_source_idx").on(table.sourceId)]
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: id(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: createdAt()
  },
  (table) => [
    index("audit_logs_user_idx").on(table.userId),
    index("audit_logs_action_idx").on(table.action)
  ]
);
