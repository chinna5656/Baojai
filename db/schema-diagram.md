# Baojai SQLite Schema

This diagram matches the tables currently created in `db/baojai.sqlite`.

```mermaid
erDiagram
  users ||--o{ user_profiles : has
  users ||--o{ user_health_settings : configures
  users ||--o{ allergies : records
  users ||--o{ nutrition_labels : scans
  users ||--o{ food_logs : logs
  foods ||--o{ food_logs : references
  users ||--o{ glucose_logs : measures
  users ||--o{ meal_plans : owns
  meal_plans ||--o{ meal_plan_items : contains
  foods ||--o{ meal_plan_items : suggests
  users ||--o{ chat_sessions : starts
  chat_sessions ||--o{ chat_messages : includes
  users ||--o{ chat_messages : sends
  google_sheet_sources ||--o{ sheet_sync_runs : syncs
  users ||--o{ audit_logs : creates

  users {
    text id PK
    text email UK
    text password_hash
    text role
    integer created_at
    integer updated_at
  }

  user_profiles {
    text id PK
    text user_id FK
    text display_name
    text age_range
    text sex
    integer height_cm
    real weight_kg
    text activity_level
    text health_goals
    text dietary_style
    integer created_at
    integer updated_at
  }

  user_health_settings {
    text id PK
    text user_id FK
    integer daily_sugar_limit_g
    integer daily_carb_target_g
    integer sodium_limit_mg
    integer glucose_target_min
    integer glucose_target_max
    integer medical_disclaimer_accepted
    integer created_at
    integer updated_at
  }

  allergies {
    text id PK
    text user_id FK
    text name
    text notes
    integer created_at
  }

  foods {
    text id PK
    text external_id
    text source
    text name
    integer serving_size_g
    integer calories
    real carb_g
    real sugar_g
    real protein_g
    real fat_g
    integer sodium_mg
    text meal_type
    text tags
    text allergens
    text glycemic_note
    text image_url
    integer created_at
    integer updated_at
  }

  nutrition_labels {
    text id PK
    text user_id FK
    text food_name
    text image_url
    text parsed_data
    integer risk_score
    text risk_level
    text analysis_result
    integer created_at
  }

  food_logs {
    text id PK
    text user_id FK
    text food_id FK
    text meal_type
    integer eaten_at
    text food_name
    integer serving_size_g
    integer calories
    real carb_g
    real sugar_g
    real protein_g
    real fat_g
    integer sodium_mg
    text notes
    integer created_at
    integer updated_at
  }

  glucose_logs {
    text id PK
    text user_id FK
    integer measured_at
    integer value
    text unit
    text context
    text notes
    integer created_at
    integer updated_at
  }

  meal_plans {
    text id PK
    text user_id FK
    integer plan_date
    text title
    text rationale
    text nutrition_totals
    text status
    integer created_at
    integer updated_at
  }

  meal_plan_items {
    text id PK
    text meal_plan_id FK
    text food_id FK
    text slot
    text menu_name
    text note
    text nutrition
    integer completed
    integer created_at
  }

  chat_sessions {
    text id PK
    text user_id FK
    text title
    integer created_at
    integer updated_at
  }

  chat_messages {
    text id PK
    text session_id FK
    text user_id FK
    text role
    text content
    text model
    text safety_flags
    integer created_at
  }

  google_sheet_sources {
    text id PK
    text name
    text spreadsheet_id
    text sheet_name
    text range
    integer enabled
    integer created_at
    integer updated_at
  }

  sheet_sync_runs {
    text id PK
    text source_id FK
    text status
    integer rows_imported
    text errors
    integer started_at
    integer finished_at
  }

  audit_logs {
    text id PK
    text user_id FK
    text action
    text resource_type
    text resource_id
    text metadata
    text ip_address
    text user_agent
    integer created_at
  }
```

## Check Result

- `db/baojai.sqlite` has 15 tables.
- The database has 140 columns, 17 indexes, and 15 foreign keys.
- Foreign-key deletes use `CASCADE` for user-owned rows and `SET NULL` for optional references like `food_id`, `source_id`, and `audit_logs.user_id`.

## Previous Diagram Issues

- Some real columns were missing, such as `created_at`, `updated_at`, and `activity_level`.
- Some column names did not match SQLite exactly, for example `health_goals_json` should be `health_goals`.
- JSON data is stored as `text` in SQLite, so the diagram now uses the real column names instead of adding `_json`.
