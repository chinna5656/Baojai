import { google } from "googleapis";

export const SHEET_RANGES = {
  foods: "foods!A:K",
  menus: "menus!A:L",
  riskRules: "risk_rules!A:G"
};

export type SheetImportResult = {
  foods: Record<string, string | number>[];
  menus: Record<string, string | number>[];
  riskRules: Record<string, string | number>[];
  importedAt: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for Google Sheets sync`);
  }
  return value;
}

function normalizePrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const numeric = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function rowsToObjects(rows: unknown[][] = []) {
  const [headerRow = [], ...dataRows] = rows;
  const headers = headerRow.map((item) => String(item).trim()).filter(Boolean);

  return dataRows
    .filter((row) => row.some((cell) => String(cell ?? "").trim().length > 0))
    .map((row) =>
      headers.reduce<Record<string, string | number>>((result, header, index) => {
        result[header] = typeof row[index] === "number" ? Number(row[index]) : String(row[index] ?? "");
        return result;
      }, {})
    );
}

export function normalizeFoodRow(row: Record<string, string | number>) {
  return {
    name: String(row.name ?? ""),
    servingSizeG: toNumber(row.serving_size_g),
    calories: toNumber(row.calories),
    carbG: toNumber(row.carb_g),
    sugarG: toNumber(row.sugar_g),
    proteinG: toNumber(row.protein_g),
    fatG: toNumber(row.fat_g),
    sodiumMg: toNumber(row.sodium_mg),
    tags: String(row.tags ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    allergens: String(row.allergens ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    glycemicNote: String(row.glycemic_note ?? ""),
    imageUrl: String(row.image_url ?? "")
  };
}

export async function importBaojaiSheets(): Promise<SheetImportResult> {
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const clientEmail = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = normalizePrivateKey(requireEnv("GOOGLE_PRIVATE_KEY"));

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: [SHEET_RANGES.foods, SHEET_RANGES.menus, SHEET_RANGES.riskRules],
    valueRenderOption: "UNFORMATTED_VALUE"
  });

  const [foodsRange, menusRange, rulesRange] = response.data.valueRanges ?? [];

  return {
    foods: rowsToObjects(foodsRange?.values ?? []),
    menus: rowsToObjects(menusRange?.values ?? []),
    riskRules: rowsToObjects(rulesRange?.values ?? []),
    importedAt: new Date().toISOString()
  };
}
