import { describe, expect, it } from "vitest";
import { normalizeFoodRow, rowsToObjects } from "@/lib/google-sheets";

describe("Google Sheets helpers", () => {
  it("converts rows into objects", () => {
    const rows = [
      ["name", "sugar_g", "tags"],
      ["ข้าวไรซ์เบอร์รี", 4, "อาหารไทย,น้ำตาลต่ำ"]
    ];

    expect(rowsToObjects(rows)).toEqual([
      {
        name: "ข้าวไรซ์เบอร์รี",
        sugar_g: 4,
        tags: "อาหารไทย,น้ำตาลต่ำ"
      }
    ]);
  });

  it("normalizes nutrition numbers and comma lists", () => {
    const food = normalizeFoodRow({
      name: "ส้มตำไทย",
      sugar_g: "8",
      sodium_mg: "920",
      tags: "อาหารไทย, ลดหวาน",
      allergens: "ถั่วลิสง"
    });

    expect(food.sugarG).toBe(8);
    expect(food.sodiumMg).toBe(920);
    expect(food.tags).toEqual(["อาหารไทย", "ลดหวาน"]);
    expect(food.allergens).toEqual(["ถั่วลิสง"]);
  });
});
