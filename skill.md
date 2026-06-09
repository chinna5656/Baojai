---
name: baojai-website-builder
description: Build the Baojai Thai wellness web application. Use when creating or updating a green-themed health website with login, Vercel-deployable Postgres database, audit/data logs, nutrition label analysis, personalized meal recommendations, food and sugar tracking, blood glucose trend analysis, automatic daily meal plans, chatbot consultation, health dashboard, and Google Sheets data import.
---

# Baojai Website Builder

Build **Baojai**, a Thai-first wellness web app for food choices, sugar tracking, and personal meal planning. Keep the product helpful, calm, and trustworthy. Do not present outputs as medical diagnosis; show clear guidance that users should consult healthcare professionals for treatment decisions or urgent symptoms.

## Product Goals

- Help users understand nutrition labels and risky foods.
- Recommend meals based on user profile, goals, food history, allergies, and glucose trends.
- Let users log meals, sugar/carbohydrate intake, and blood glucose values.
- Generate daily meal plans that adapt to user data.
- Provide a chatbot for general wellness and food guidance with safety boundaries.
- Show a health dashboard that is easy to scan.
- Import food/menu/rule data from Google Sheets as an admin-managed source.

## Preferred Stack

- Use **Next.js App Router + TypeScript** for the web app.
- Use **Tailwind CSS** for UI styling.
- Use **Neon Postgres via Vercel Marketplace** as the default production database. Supabase Postgres or Prisma Postgres from Vercel Marketplace are acceptable alternatives if the project already uses them.
- Use **Drizzle ORM** or **Prisma** for schema and migrations. Prefer the ORM already present in the repo.
- Use **Auth.js / NextAuth**, Better Auth, Clerk, or Supabase Auth for login. Prefer email/password plus OAuth if available.
- Use server actions or route handlers for protected writes.
- Use `googleapis` or direct Google Sheets API calls for Google Sheets sync.
- Store uploaded label images in Vercel Blob, Supabase Storage, or another Vercel-compatible object store when image upload is implemented.

## Design Direction

- Use a green-forward palette: forest green, leaf green, mint, white, soft gray, and a small warm accent for warnings.
- Avoid a one-note green screen. Use neutral backgrounds, green primary actions, amber risk states, and red only for high-risk alerts.
- UI language should be Thai by default.
- Build the app experience first, not a marketing landing page.
- Prioritize dashboard density, readable cards, clear charts, and fast daily logging.
- Use rounded corners of 8px or less unless the existing design system uses another radius.
- Use icons for common actions such as add, scan, save, sync, trend, chat, calendar, warning, and settings.

## Core Routes

- `/login` - sign in, sign up, password reset or OAuth.
- `/dashboard` - health overview, recent meals, sugar budget, glucose trend, risk alerts, today plan.
- `/label` - nutrition label analyzer with upload/manual entry.
- `/food-log` - meal logging, sugar/carbohydrate budget, food history.
- `/glucose` - blood glucose logging and trend analysis.
- `/meal-plan` - automatic daily meal plan and recommended menus.
- `/chat` - wellness chatbot with user context.
- `/settings` - profile, health goals, allergies, Google Sheets source settings for admins.

## Database Model

Create relational tables for at least:

- `users`: auth identity.
- `user_profiles`: display name, age range, sex optional, height, weight, activity level, health goals, dietary style.
- `user_health_settings`: daily sugar limit, daily carb target, sodium limit, glucose target ranges, medical disclaimers accepted.
- `allergies`: user allergens and avoided ingredients.
- `foods`: canonical food/menu items from database or Google Sheets.
- `nutrition_labels`: parsed label data, source image URL, risk score, analysis result.
- `food_logs`: meal time, food item, serving size, calories, carbs, sugar, protein, fat, sodium, notes.
- `glucose_logs`: timestamp, glucose value, unit, context such as fasting, before meal, after meal, bedtime.
- `meal_plans`: date, generated plan, nutrition totals, rationale, status.
- `meal_plan_items`: breakfast/lunch/dinner/snack menu items.
- `chat_sessions` and `chat_messages`: chatbot history and safety flags.
- `google_sheet_sources`: spreadsheet ID, sheet names, sync ranges, enabled flag.
- `sheet_sync_runs`: status, rows imported, errors, started/finished timestamps.
- `audit_logs`: login events, data writes, AI recommendations, sheet sync, admin changes, errors.

All user-owned tables must include `user_id`, `created_at`, and `updated_at` where appropriate. Sensitive health data must be scoped by authenticated user and never exposed through public routes.

## Google Sheets Source

Support importing admin-managed data from Google Sheets.

Expected sheets:

- `foods`: `name`, `serving_size_g`, `calories`, `carb_g`, `sugar_g`, `protein_g`, `fat_g`, `sodium_mg`, `tags`, `allergens`, `glycemic_note`, `image_url`.
- `menus`: `name`, `meal_type`, `ingredients`, `calories`, `carb_g`, `sugar_g`, `protein_g`, `fat_g`, `sodium_mg`, `tags`, `allergens`.
- `risk_rules`: `field`, `operator`, `threshold`, `unit`, `severity`, `message_th`.

Implementation notes:

- Use a Google service account for server-side sync.
- Store `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, and sheet ranges in Vercel environment variables.
- Share the Google Sheet with the service account email.
- Read with `spreadsheets.values.get` or `spreadsheets.values.batchGet`.
- Normalize numeric values before saving.
- Log every import in `sheet_sync_runs` and every admin sync event in `audit_logs`.
- Never expose Google credentials to the browser.

## Feature Requirements

### Login And Account

- Require login before health data pages.
- Provide protected server-side access checks.
- Add audit logs for sign in, sign out, failed login where available, profile updates, and exports.

### Nutrition Label Analysis

- Allow image upload and manual nutrition entry.
- Extract or accept calories, serving size, carbohydrates, sugar, protein, fat, saturated fat, sodium, ingredients, and allergens.
- Compare values against user goals and `risk_rules`.
- Warn about high sugar, high sodium, high saturated fat, excessive calories per serving, allergens, and foods that conflict with user goals.
- Show a risk level: low, medium, high.
- Explain warnings in Thai using practical language.

### Personalized Menu Recommendations

- Recommend menus based on profile, allergies, dietary preferences, daily sugar/carb budget, food logs, and recent glucose trends.
- Prefer menus from the local database and Google Sheets imports.
- Show why each menu is recommended.
- Provide substitutions when a menu is risky or conflicts with user allergies.

### Food And Sugar Logging

- Let users log breakfast, lunch, dinner, snacks, and drinks.
- Calculate daily sugar and carbohydrate totals.
- Show remaining sugar budget for the day.
- Let users edit/delete entries with audit logs.

### Blood Glucose Trend Analysis

- Let users log glucose values with unit and context.
- Show daily, weekly, and monthly trends.
- Highlight repeated high/low patterns without diagnosing disease.
- Correlate meal logs and glucose logs when timestamps are close.
- Use charts that are readable on mobile.

### Automatic Meal Planning

- Generate daily menus for breakfast, lunch, dinner, and snacks.
- Adapt to user goals, allergies, food history, sugar/carb budget, and glucose trend.
- Save generated plans and allow regeneration.
- Show nutrition totals for the day.
- Mark plan items complete or swapped.

### Chatbot Consultation

- Provide Thai chatbot responses for general food, nutrition-label, meal-plan, and logging questions.
- Use user context only after authorization.
- Refuse diagnosis, medication changes, or emergency decisions.
- Encourage professional care for medical concerns.
- Log prompts, responses, model metadata, and safety flags in `chat_messages` or `audit_logs`.

### Health Dashboard

- Show today sugar intake, carb intake, latest glucose, glucose trend, risk alerts, meal plan progress, and recent logs.
- Include quick actions: add meal, add glucose, analyze label, generate meal plan, open chatbot.
- Keep charts and cards compact and scannable.

## Environment Variables

Use environment variables similar to:

```env
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=
OPENAI_API_KEY=
BLOB_READ_WRITE_TOKEN=
```

Only include optional variables when the implementation needs them.

## Implementation Workflow

1. Inspect the repo and follow existing framework/style choices.
2. Scaffold or update the Next.js app with TypeScript and Tailwind.
3. Add authentication and protected route handling.
4. Add Postgres schema, migrations, and seed data.
5. Implement Google Sheets sync before recommendation features that depend on menu data.
6. Build the dashboard and logging flows.
7. Build nutrition label analysis.
8. Build recommendation and meal-plan generation.
9. Build chatbot with health safety boundaries.
10. Add tests for protected access, database writes, sheet sync parsing, risk rules, and meal-plan generation.
11. Run lint, typecheck, tests, and production build before delivery.

## Acceptance Criteria

- Baojai can be deployed on Vercel with a Vercel Marketplace Postgres provider.
- Users can sign up/sign in and access only their own health data.
- Food logs, glucose logs, AI/chat events, sheet syncs, and important user actions are persisted.
- Google Sheets data can be imported into database tables.
- The UI is Thai-first and green-themed.
- Nutrition labels produce clear risk warnings.
- Meal recommendations and daily meal plans adapt to user data.
- Dashboard shows useful health summaries and trends.
- Chatbot includes safety boundaries and does not act as a doctor.
- The app passes lint/typecheck/build, and core flows have tests.
