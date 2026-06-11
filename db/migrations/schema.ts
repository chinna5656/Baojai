import { sqliteTable, index, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const allergies = sqliteTable("allergies", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: text().notNull(),
	notes: text(),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("allergies_user_idx").on(table.userId),
]);

export const auditLogs = sqliteTable("audit_logs", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").references(() => users.id, { onDelete: "set null" } ),
	action: text().notNull(),
	resourceType: text("resource_type"),
	resourceId: text("resource_id"),
	metadata: text(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("audit_logs_action_idx").on(table.action),
	index("audit_logs_user_idx").on(table.userId),
]);

export const chatMessages = sqliteTable("chat_messages", {
	id: text().primaryKey().notNull(),
	sessionId: text("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" } ),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	role: text().notNull(),
	content: text().notNull(),
	model: text(),
	safetyFlags: text("safety_flags"),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("chat_messages_session_idx").on(table.sessionId),
]);

export const chatSessions = sqliteTable("chat_sessions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	title: text(),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("chat_sessions_user_idx").on(table.userId),
]);

export const foodLogs = sqliteTable("food_logs", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	foodId: text("food_id").references(() => foods.id, { onDelete: "set null" } ),
	mealType: text("meal_type").notNull(),
	eatenAt: integer("eaten_at").notNull(),
	foodName: text("food_name").notNull(),
	servingSizeG: integer("serving_size_g"),
	calories: integer(),
	carbG: real("carb_g"),
	sugarG: real("sugar_g"),
	proteinG: real("protein_g"),
	fatG: real("fat_g"),
	sodiumMg: integer("sodium_mg"),
	notes: text(),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("food_logs_user_date_idx").on(table.userId, table.eatenAt),
]);

export const foods = sqliteTable("foods", {
	id: text().primaryKey().notNull(),
	externalId: text("external_id"),
	source: text().default("local").notNull(),
	name: text().notNull(),
	servingSizeG: integer("serving_size_g"),
	calories: integer(),
	carbG: real("carb_g"),
	sugarG: real("sugar_g"),
	proteinG: real("protein_g"),
	fatG: real("fat_g"),
	sodiumMg: integer("sodium_mg"),
	mealType: text("meal_type"),
	tags: text(),
	allergens: text(),
	glycemicNote: text("glycemic_note"),
	imageUrl: text("image_url"),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch() * 1000)`).notNull(),
});

export const glucoseLogs = sqliteTable("glucose_logs", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	measuredAt: integer("measured_at").notNull(),
	value: integer().notNull(),
	unit: text().default("mg/dL").notNull(),
	context: text().default("other").notNull(),
	notes: text(),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("glucose_logs_user_date_idx").on(table.userId, table.measuredAt),
]);

export const googleSheetSources = sqliteTable("google_sheet_sources", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	spreadsheetId: text("spreadsheet_id").notNull(),
	sheetName: text("sheet_name").notNull(),
	range: text().notNull(),
	enabled: integer().default(1).notNull(),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch() * 1000)`).notNull(),
});

export const mealPlanItems = sqliteTable("meal_plan_items", {
	id: text().primaryKey().notNull(),
	mealPlanId: text("meal_plan_id").notNull().references(() => mealPlans.id, { onDelete: "cascade" } ),
	foodId: text("food_id").references(() => foods.id, { onDelete: "set null" } ),
	slot: text().notNull(),
	menuName: text("menu_name").notNull(),
	note: text(),
	nutrition: text(),
	completed: integer().default(0).notNull(),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("meal_plan_items_plan_idx").on(table.mealPlanId),
]);

export const mealPlans = sqliteTable("meal_plans", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	planDate: integer("plan_date").notNull(),
	title: text().notNull(),
	rationale: text(),
	nutritionTotals: text("nutrition_totals"),
	status: text().default("draft").notNull(),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("meal_plans_user_date_idx").on(table.userId, table.planDate),
]);

export const nutritionLabels = sqliteTable("nutrition_labels", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	foodName: text("food_name"),
	imageUrl: text("image_url"),
	parsedData: text("parsed_data"),
	riskScore: integer("risk_score").default(0).notNull(),
	riskLevel: text("risk_level").default("low").notNull(),
	analysisResult: text("analysis_result"),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("nutrition_labels_user_idx").on(table.userId),
]);

export const sheetSyncRuns = sqliteTable("sheet_sync_runs", {
	id: text().primaryKey().notNull(),
	sourceId: text("source_id").references(() => googleSheetSources.id, { onDelete: "set null" } ),
	status: text().default("queued").notNull(),
	rowsImported: integer("rows_imported").default(0).notNull(),
	errors: text(),
	startedAt: integer("started_at").default(sql`(unixepoch() * 1000)`).notNull(),
	finishedAt: integer("finished_at"),
},
(table) => [
	index("sheet_sync_runs_source_idx").on(table.sourceId),
]);

export const userHealthSettings = sqliteTable("user_health_settings", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	dailySugarLimitG: integer("daily_sugar_limit_g").default(24).notNull(),
	dailyCarbTargetG: integer("daily_carb_target_g").default(165).notNull(),
	sodiumLimitMg: integer("sodium_limit_mg").default(2000).notNull(),
	glucoseTargetMin: integer("glucose_target_min").default(80).notNull(),
	glucoseTargetMax: integer("glucose_target_max").default(140).notNull(),
	medicalDisclaimerAccepted: integer("medical_disclaimer_accepted").default(0).notNull(),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("user_health_settings_user_idx").on(table.userId),
]);

export const userProfiles = sqliteTable("user_profiles", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	displayName: text("display_name").notNull(),
	ageRange: text("age_range"),
	sex: text(),
	heightCm: integer("height_cm"),
	weightKg: real("weight_kg"),
	activityLevel: text("activity_level"),
	healthGoals: text("health_goals"),
	dietaryStyle: text("dietary_style"),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	index("user_profiles_user_idx").on(table.userId),
]);

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash"),
	role: text().default("user").notNull(),
	createdAt: integer("created_at").default(sql`(unixepoch() * 1000)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch() * 1000)`).notNull(),
},
(table) => [
	uniqueIndex("users_email_unique").on(table.email),
]);
