import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const mealTypeEnum = pgEnum("meal_type", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "drink"
]);

export const glucoseContextEnum = pgEnum("glucose_context", [
  "fasting",
  "before_meal",
  "after_meal",
  "bedtime",
  "other"
]);

export const riskSeverityEnum = pgEnum("risk_severity", ["low", "medium", "high"]);

export const syncStatusEnum = pgEnum("sync_status", [
  "queued",
  "running",
  "success",
  "failed"
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  role: varchar("role", { length: 32 }).default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 160 }).notNull(),
    ageRange: varchar("age_range", { length: 32 }),
    sex: varchar("sex", { length: 32 }),
    heightCm: integer("height_cm"),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    activityLevel: varchar("activity_level", { length: 64 }),
    healthGoals: jsonb("health_goals").$type<string[]>(),
    dietaryStyle: varchar("dietary_style", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdx: index("user_profiles_user_idx").on(table.userId)
  })
);

export const userHealthSettings = pgTable(
  "user_health_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dailySugarLimitG: integer("daily_sugar_limit_g").default(24).notNull(),
    dailyCarbTargetG: integer("daily_carb_target_g").default(165).notNull(),
    sodiumLimitMg: integer("sodium_limit_mg").default(2000).notNull(),
    glucoseTargetMin: integer("glucose_target_min").default(80).notNull(),
    glucoseTargetMax: integer("glucose_target_max").default(140).notNull(),
    medicalDisclaimerAccepted: boolean("medical_disclaimer_accepted").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdx: index("user_health_settings_user_idx").on(table.userId)
  })
);

export const allergies = pgTable(
  "allergies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdx: index("allergies_user_idx").on(table.userId)
  })
);

export const foods = pgTable("foods", {
  id: uuid("id").defaultRandom().primaryKey(),
  externalId: varchar("external_id", { length: 160 }),
  source: varchar("source", { length: 64 }).default("local").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  servingSizeG: integer("serving_size_g"),
  calories: integer("calories"),
  carbG: numeric("carb_g", { precision: 8, scale: 2 }),
  sugarG: numeric("sugar_g", { precision: 8, scale: 2 }),
  proteinG: numeric("protein_g", { precision: 8, scale: 2 }),
  fatG: numeric("fat_g", { precision: 8, scale: 2 }),
  sodiumMg: integer("sodium_mg"),
  mealType: mealTypeEnum("meal_type"),
  tags: jsonb("tags").$type<string[]>(),
  allergens: jsonb("allergens").$type<string[]>(),
  glycemicNote: text("glycemic_note"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const nutritionLabels = pgTable(
  "nutrition_labels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    foodName: varchar("food_name", { length: 255 }),
    imageUrl: text("image_url"),
    parsedData: jsonb("parsed_data").$type<Record<string, unknown>>(),
    riskScore: integer("risk_score").default(0).notNull(),
    riskLevel: riskSeverityEnum("risk_level").default("low").notNull(),
    analysisResult: jsonb("analysis_result").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdx: index("nutrition_labels_user_idx").on(table.userId)
  })
);

export const foodLogs = pgTable(
  "food_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    foodId: uuid("food_id").references(() => foods.id, { onDelete: "set null" }),
    mealType: mealTypeEnum("meal_type").notNull(),
    eatenAt: timestamp("eaten_at", { withTimezone: true }).notNull(),
    foodName: varchar("food_name", { length: 255 }).notNull(),
    servingSizeG: integer("serving_size_g"),
    calories: integer("calories"),
    carbG: numeric("carb_g", { precision: 8, scale: 2 }),
    sugarG: numeric("sugar_g", { precision: 8, scale: 2 }),
    proteinG: numeric("protein_g", { precision: 8, scale: 2 }),
    fatG: numeric("fat_g", { precision: 8, scale: 2 }),
    sodiumMg: integer("sodium_mg"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userDateIdx: index("food_logs_user_date_idx").on(table.userId, table.eatenAt)
  })
);

export const glucoseLogs = pgTable(
  "glucose_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
    value: integer("value").notNull(),
    unit: varchar("unit", { length: 16 }).default("mg/dL").notNull(),
    context: glucoseContextEnum("context").default("other").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userDateIdx: index("glucose_logs_user_date_idx").on(table.userId, table.measuredAt)
  })
);

export const mealPlans = pgTable(
  "meal_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planDate: timestamp("plan_date", { withTimezone: true }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    rationale: text("rationale"),
    nutritionTotals: jsonb("nutrition_totals").$type<Record<string, number>>(),
    status: varchar("status", { length: 32 }).default("draft").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userDateIdx: index("meal_plans_user_date_idx").on(table.userId, table.planDate)
  })
);

export const mealPlanItems = pgTable(
  "meal_plan_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mealPlanId: uuid("meal_plan_id")
      .notNull()
      .references(() => mealPlans.id, { onDelete: "cascade" }),
    foodId: uuid("food_id").references(() => foods.id, { onDelete: "set null" }),
    slot: mealTypeEnum("slot").notNull(),
    menuName: varchar("menu_name", { length: 255 }).notNull(),
    note: text("note"),
    nutrition: jsonb("nutrition").$type<Record<string, number>>(),
    completed: boolean("completed").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    planIdx: index("meal_plan_items_plan_idx").on(table.mealPlanId)
  })
);

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdx: index("chat_sessions_user_idx").on(table.userId)
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull(),
    content: text("content").notNull(),
    model: varchar("model", { length: 80 }),
    safetyFlags: jsonb("safety_flags").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    sessionIdx: index("chat_messages_session_idx").on(table.sessionId)
  })
);

export const googleSheetSources = pgTable("google_sheet_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  spreadsheetId: varchar("spreadsheet_id", { length: 255 }).notNull(),
  sheetName: varchar("sheet_name", { length: 160 }).notNull(),
  range: varchar("range", { length: 80 }).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const sheetSyncRuns = pgTable(
  "sheet_sync_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id").references(() => googleSheetSources.id, { onDelete: "set null" }),
    status: syncStatusEnum("status").default("queued").notNull(),
    rowsImported: integer("rows_imported").default(0).notNull(),
    errors: jsonb("errors").$type<string[]>(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true })
  },
  (table) => ({
    sourceIdx: index("sheet_sync_runs_source_idx").on(table.sourceId)
  })
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 120 }).notNull(),
    resourceType: varchar("resource_type", { length: 120 }),
    resourceId: uuid("resource_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 80 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userIdx: index("audit_logs_user_idx").on(table.userId),
    actionIdx: index("audit_logs_action_idx").on(table.action)
  })
);
