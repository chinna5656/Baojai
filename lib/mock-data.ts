import {
  Activity,
  Bot,
  CalendarDays,
  ClipboardList,
  Gauge,
  HeartPulse,
  MessageCircle,
  ScanLine,
  Settings,
  Utensils
} from "lucide-react";

export type Metric = {
  label: string;
  value: string;
  helper: string;
  tone: "green" | "amber" | "red" | "neutral";
};

export type FoodItem = {
  id: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servingSizeG: number;
  calories: number;
  carbG: number;
  sugarG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
  tags: string[];
  allergens: string[];
  glycemicNote: string;
};

export const demoUser = {
  id: "08f3bb36-59b2-4c04-a057-d8b9bd6019ab",
  name: "คุณใบเตย",
  email: "demo@baojai.app",
  goal: "ควบคุมน้ำตาลหลังอาหาร",
  dailySugarLimitG: 24,
  dailyCarbTargetG: 165,
  sodiumLimitMg: 2000,
  allergies: ["ถั่วลิสง"],
  dietaryStyle: "อาหารไทยสุขภาพ",
  glucoseTarget: "80-140 mg/dL"
};

export const metrics: Metric[] = [
  {
    label: "น้ำตาลวันนี้",
    value: "17g",
    helper: "เหลืออีก 7g จากเป้าหมาย 24g",
    tone: "green"
  },
  {
    label: "คาร์บวันนี้",
    value: "112g",
    helper: "68% ของเป้าหมายรายวัน",
    tone: "neutral"
  },
  {
    label: "น้ำตาลในเลือดล่าสุด",
    value: "126",
    helper: "mg/dL หลังอาหาร 2 ชม.",
    tone: "amber"
  },
  {
    label: "ความเสี่ยงอาหาร",
    value: "กลาง",
    helper: "มี 2 รายการควรระวัง",
    tone: "amber"
  }
];

export const quickActions = [
  { label: "วิเคราะห์ฉลาก", href: "/label", icon: ScanLine },
  { label: "บันทึกอาหาร", href: "/food-log", icon: Utensils },
  { label: "เพิ่มค่าน้ำตาล", href: "/glucose", icon: Gauge },
  { label: "สร้างแผนอาหาร", href: "/meal-plan", icon: CalendarDays },
  { label: "คุยกับ Baojai", href: "/chat", icon: Bot },
  { label: "ตั้งค่า", href: "/settings", icon: Settings }
];

export const navigationItems = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Activity },
  { id: "label", label: "ฉลากอาหาร", href: "/label", icon: ScanLine },
  { id: "food-log", label: "บันทึกอาหาร", href: "/food-log", icon: ClipboardList },
  { id: "glucose", label: "ระดับน้ำตาล", href: "/glucose", icon: Gauge },
  { id: "meal-plan", label: "แผนอาหาร", href: "/meal-plan", icon: CalendarDays },
  { id: "chat", label: "แชทบอท", href: "/chat", icon: MessageCircle },
  { id: "settings", label: "ตั้งค่า", href: "/settings", icon: Settings }
];

export const glucosePoints = [
  { label: "จ", value: 108 },
  { label: "อ", value: 118 },
  { label: "พ", value: 146 },
  { label: "พฤ", value: 132 },
  { label: "ศ", value: 124 },
  { label: "ส", value: 141 },
  { label: "อา", value: 126 }
];

export const monthlyGlucosePoints = [
  { label: "สัปดาห์ 1", value: 134 },
  { label: "สัปดาห์ 2", value: 128 },
  { label: "สัปดาห์ 3", value: 122 },
  { label: "สัปดาห์ 4", value: 126 }
];

export const recentMeals = [
  {
    meal: "ข้าวไรซ์เบอร์รี + แกงเลียงกุ้ง",
    time: "12:20",
    sugarG: 4,
    carbG: 42,
    status: "เหมาะสม"
  },
  {
    meal: "ชานมหวานน้อย",
    time: "15:10",
    sugarG: 11,
    carbG: 28,
    status: "ควรระวัง"
  },
  {
    meal: "โยเกิร์ตธรรมชาติ + เมล็ดเจีย",
    time: "18:00",
    sugarG: 3,
    carbG: 12,
    status: "ดี"
  }
];

export const riskAlerts = [
  {
    title: "ชานมหวานน้อยยังมีน้ำตาลสูง",
    detail: "รายการนี้ใช้น้ำตาล 46% ของเป้าหมายวันนี้ แนะนำลดไซซ์หรือเปลี่ยนเป็นชาไม่หวาน",
    severity: "medium"
  },
  {
    title: "โซเดียมมื้อเย็นควรคุม",
    detail: "ถ้ากินแกงหรืออาหารสำเร็จรูป ให้เลือกน้ำซุปน้อยและเพิ่มผักสด",
    severity: "medium"
  }
];

export const foodCatalog: FoodItem[] = [
  {
    id: "thai-herb-rice-bowl",
    name: "ข้าวไรซ์เบอร์รีอกไก่สมุนไพร",
    mealType: "lunch",
    servingSizeG: 360,
    calories: 430,
    carbG: 48,
    sugarG: 4,
    proteinG: 32,
    fatG: 11,
    sodiumMg: 520,
    tags: ["โปรตีนสูง", "น้ำตาลต่ำ", "อาหารไทย"],
    allergens: [],
    glycemicNote: "คาร์บเชิงซ้อนและมีโปรตีนช่วยชะลอการดูดซึม"
  },
  {
    id: "clear-soup-tofu",
    name: "ต้มจืดเต้าหู้หมูสับ + ผักกาดขาว",
    mealType: "dinner",
    servingSizeG: 310,
    calories: 260,
    carbG: 18,
    sugarG: 3,
    proteinG: 25,
    fatG: 9,
    sodiumMg: 680,
    tags: ["มื้อเย็นเบา", "โปรตีนดี"],
    allergens: ["ถั่วเหลือง"],
    glycemicNote: "คาร์บต่ำ เหมาะกับวันที่น้ำตาลหลังอาหารสูง"
  },
  {
    id: "oat-yogurt-chia",
    name: "โอ๊ตโยเกิร์ตธรรมชาติเมล็ดเจีย",
    mealType: "breakfast",
    servingSizeG: 240,
    calories: 310,
    carbG: 38,
    sugarG: 7,
    proteinG: 18,
    fatG: 9,
    sodiumMg: 140,
    tags: ["ไฟเบอร์สูง", "อิ่มนาน"],
    allergens: ["นม"],
    glycemicNote: "ไฟเบอร์สูง ช่วยให้ระดับน้ำตาลขึ้นช้ากว่าอาหารเช้าหวาน"
  },
  {
    id: "guava-snack",
    name: "ฝรั่งสด + ไข่ต้ม",
    mealType: "snack",
    servingSizeG: 180,
    calories: 160,
    carbG: 18,
    sugarG: 9,
    proteinG: 7,
    fatG: 5,
    sodiumMg: 90,
    tags: ["ของว่าง", "ไฟเบอร์สูง"],
    allergens: ["ไข่"],
    glycemicNote: "ผลไม้ไฟเบอร์ดี จับคู่โปรตีนเพื่อลดความหิว"
  },
  {
    id: "papaya-salad-light",
    name: "ส้มตำไทยลดหวาน + ไก่ย่าง",
    mealType: "dinner",
    servingSizeG: 330,
    calories: 360,
    carbG: 32,
    sugarG: 8,
    proteinG: 30,
    fatG: 12,
    sodiumMg: 920,
    tags: ["อาหารไทย", "ลดหวาน"],
    allergens: ["ถั่วลิสง"],
    glycemicNote: "ควรแจ้งไม่ใส่ถั่วและลดน้ำตาลเพิ่ม"
  }
];

export const menuRecommendations = [
  {
    title: "ข้าวไรซ์เบอร์รีอกไก่สมุนไพร",
    reason: "โปรตีนสูง น้ำตาลต่ำ และคาร์บพอดีกับงบวันนี้",
    score: 92
  },
  {
    title: "ต้มจืดเต้าหู้หมูสับ + ผักกาดขาว",
    reason: "เหมาะกับวันที่น้ำตาลหลังอาหารเริ่มสูง แต่ควรลดเค็ม",
    score: 84
  },
  {
    title: "ฝรั่งสด + ไข่ต้ม",
    reason: "ของว่างไฟเบอร์ดี ช่วยลดโอกาสเลือกเครื่องดื่มหวาน",
    score: 81
  }
];

export const dailyPlan = [
  {
    slot: "เช้า",
    menu: "โอ๊ตโยเกิร์ตธรรมชาติเมล็ดเจีย",
    note: "เพิ่มอบเชยได้เล็กน้อย หลีกเลี่ยงน้ำผึ้ง",
    sugarG: 7,
    carbG: 38
  },
  {
    slot: "กลางวัน",
    menu: "ข้าวไรซ์เบอร์รีอกไก่สมุนไพร",
    note: "ใช้ข้าวครึ่งทัพพีเพิ่มผักใบเขียว",
    sugarG: 4,
    carbG: 48
  },
  {
    slot: "ว่าง",
    menu: "ฝรั่งสด + ไข่ต้ม",
    note: "เหมาะก่อนประชุมยาว ลดอยากน้ำหวาน",
    sugarG: 9,
    carbG: 18
  },
  {
    slot: "เย็น",
    menu: "ต้มจืดเต้าหู้หมูสับ + ผักกาดขาว",
    note: "เลือกน้ำซุปใส ลดเค็ม และงดข้าวเพิ่ม",
    sugarG: 3,
    carbG: 18
  }
];

export const chatMessages = [
  {
    role: "assistant",
    text: "วันนี้น้ำตาลรวมยังอยู่ในกรอบค่ะ ถ้าจะดื่มเครื่องดื่ม แนะนำชาไม่หวานหรือโซดามะนาวไม่เติมน้ำตาล"
  },
  {
    role: "user",
    text: "ถ้าหิวตอนบ่ายควรกินอะไรดี"
  },
  {
    role: "assistant",
    text: "เลือกของว่างที่มีไฟเบอร์และโปรตีน เช่น ฝรั่งกับไข่ต้ม หรือโยเกิร์ตธรรมชาติไม่เติมน้ำตาล จะช่วยให้อิ่มนานกว่าเบเกอรี่หวาน"
  }
];

export const sheetSources = [
  {
    name: "foods",
    range: "foods!A:K",
    rows: 128,
    lastSync: "วันนี้ 09:10",
    status: "พร้อมใช้งาน"
  },
  {
    name: "menus",
    range: "menus!A:L",
    rows: 42,
    lastSync: "วันนี้ 09:10",
    status: "พร้อมใช้งาน"
  },
  {
    name: "risk_rules",
    range: "risk_rules!A:G",
    rows: 16,
    lastSync: "วันนี้ 09:10",
    status: "พร้อมใช้งาน"
  }
];

export const auditEvents = [
  {
    action: "sheet_sync.success",
    detail: "นำเข้า foods, menus, risk_rules รวม 186 แถว",
    time: "09:10"
  },
  {
    action: "meal_plan.generated",
    detail: "สร้างแผนอาหารรายวันตามงบน้ำตาล 24g",
    time: "08:40"
  },
  {
    action: "nutrition_label.analyzed",
    detail: "วิเคราะห์ฉลากเครื่องดื่มหวานน้อย ระดับเสี่ยงกลาง",
    time: "เมื่อวาน 18:22"
  }
];

export const dashboardInsight = {
  title: "แนวโน้มสัปดาห์นี้ดีขึ้น",
  detail:
    "ค่าเฉลี่ยน้ำตาลหลังอาหารลดลง 8 mg/dL เมื่อเทียบกับสัปดาห์ก่อน หลังลดเครื่องดื่มหวานช่วงบ่าย",
  icon: HeartPulse
};
