import { relations } from "drizzle-orm/relations";
import { users, allergies, auditLogs, chatMessages, chatSessions, foods, foodLogs, glucoseLogs, mealPlanItems, mealPlans, nutritionLabels, googleSheetSources, sheetSyncRuns, userHealthSettings, userProfiles } from "./schema";

export const allergiesRelations = relations(allergies, ({one}) => ({
	user: one(users, {
		fields: [allergies.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	allergies: many(allergies),
	auditLogs: many(auditLogs),
	chatMessages: many(chatMessages),
	chatSessions: many(chatSessions),
	foodLogs: many(foodLogs),
	glucoseLogs: many(glucoseLogs),
	mealPlans: many(mealPlans),
	nutritionLabels: many(nutritionLabels),
	userHealthSettings: many(userHealthSettings),
	userProfiles: many(userProfiles),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	user: one(users, {
		fields: [chatMessages.userId],
		references: [users.id]
	}),
	chatSession: one(chatSessions, {
		fields: [chatMessages.sessionId],
		references: [chatSessions.id]
	}),
}));

export const chatSessionsRelations = relations(chatSessions, ({one, many}) => ({
	chatMessages: many(chatMessages),
	user: one(users, {
		fields: [chatSessions.userId],
		references: [users.id]
	}),
}));

export const foodLogsRelations = relations(foodLogs, ({one}) => ({
	food: one(foods, {
		fields: [foodLogs.foodId],
		references: [foods.id]
	}),
	user: one(users, {
		fields: [foodLogs.userId],
		references: [users.id]
	}),
}));

export const foodsRelations = relations(foods, ({many}) => ({
	foodLogs: many(foodLogs),
	mealPlanItems: many(mealPlanItems),
}));

export const glucoseLogsRelations = relations(glucoseLogs, ({one}) => ({
	user: one(users, {
		fields: [glucoseLogs.userId],
		references: [users.id]
	}),
}));

export const mealPlanItemsRelations = relations(mealPlanItems, ({one}) => ({
	food: one(foods, {
		fields: [mealPlanItems.foodId],
		references: [foods.id]
	}),
	mealPlan: one(mealPlans, {
		fields: [mealPlanItems.mealPlanId],
		references: [mealPlans.id]
	}),
}));

export const mealPlansRelations = relations(mealPlans, ({one, many}) => ({
	mealPlanItems: many(mealPlanItems),
	user: one(users, {
		fields: [mealPlans.userId],
		references: [users.id]
	}),
}));

export const nutritionLabelsRelations = relations(nutritionLabels, ({one}) => ({
	user: one(users, {
		fields: [nutritionLabels.userId],
		references: [users.id]
	}),
}));

export const sheetSyncRunsRelations = relations(sheetSyncRuns, ({one}) => ({
	googleSheetSource: one(googleSheetSources, {
		fields: [sheetSyncRuns.sourceId],
		references: [googleSheetSources.id]
	}),
}));

export const googleSheetSourcesRelations = relations(googleSheetSources, ({many}) => ({
	sheetSyncRuns: many(sheetSyncRuns),
}));

export const userHealthSettingsRelations = relations(userHealthSettings, ({one}) => ({
	user: one(users, {
		fields: [userHealthSettings.userId],
		references: [users.id]
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id]
	}),
}));