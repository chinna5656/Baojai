import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const sqlPath = path.resolve("db/data.sql");
const dbPath = path.resolve(process.env.SQLITE_DB_PATH ?? "db/baojai.sqlite");
const dump = readFileSync(sqlPath, "utf8");
const insertPattern = /INSERT INTO `food_items` \(([^)]+)\) VALUES\s*([\s\S]*?);/g;

function splitTuples(valuesSql) {
  const tuples = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (const char of valuesSql) {
    current += char;

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "'") {
        inString = false;
      }
      continue;
    }

    if (char === "'") {
      inString = true;
    } else if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
      if (depth === 0) {
        tuples.push(current.trim().replace(/,$/, ""));
        current = "";
      }
    }
  }

  return tuples;
}

function parseTuple(tupleSql) {
  const values = [];
  let current = "";
  let inString = false;
  let escaped = false;
  const body = tupleSql.trim().replace(/^[,\s]*\(/, "").replace(/\)$/, "");

  for (const char of body) {
    if (inString) {
      if (escaped) {
        current += char;
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "'") {
        inString = false;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'") {
      inString = true;
    } else if (char === ",") {
      values.push(normalizeValue(current));
      current = "";
    } else {
      current += char;
    }
  }

  values.push(normalizeValue(current));
  return values;
}

function normalizeValue(value) {
  const trimmed = value.trim();

  if (/^null$/i.test(trimmed)) {
    return null;
  }

  if (trimmed === "") {
    return "";
  }

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : trimmed;
}

function toNumber(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

const rows = [];
let match;

while ((match = insertPattern.exec(dump)) !== null) {
  const columns = match[1].split(",").map((column) => column.trim().replaceAll("`", ""));
  const tuples = splitTuples(match[2]);

  for (const tuple of tuples) {
    const values = parseTuple(tuple);
    rows.push(Object.fromEntries(columns.map((column, index) => [column, values[index]])));
  }
}

const insertFood = db.prepare(`
  insert into foods (
    id,
    external_id,
    source,
    name,
    serving_size_g,
    calories,
    carb_g,
    sugar_g,
    protein_g,
    fat_g,
    sodium_mg,
    tags,
    allergens,
    glycemic_note
  ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const importRows = db.transaction((items) => {
  db.prepare("delete from foods where source = ?").run("data.sql");

  for (const item of items) {
    const name = String(item.name_thai || item.name_english || "").trim();

    if (!name) {
      continue;
    }

    insertFood.run(
      randomUUID(),
      String(item.id),
      "data.sql",
      name,
      100,
      Math.round(toNumber(item.energy_kcal)),
      toNumber(item.carbohydrate_g),
      0,
      toNumber(item.protein_g),
      toNumber(item.fat_g),
      0,
      JSON.stringify(["food_nutrition_import"]),
      JSON.stringify([]),
      item.name_english ? String(item.name_english) : null
    );
  }
});

importRows(rows);

const count = db.prepare("select count(*) as count from foods where source = ?").get("data.sql").count;
console.log(JSON.stringify({ imported: count, database: dbPath, source: sqlPath }, null, 2));

db.close();
