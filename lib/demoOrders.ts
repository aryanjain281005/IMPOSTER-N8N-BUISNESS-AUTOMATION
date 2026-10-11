import type {
  Order,
  PaymentMode,
  PaymentStatus,
  DesignStatus,
  PrintStatus,
  WhatsAppStatus,
  OrderStatus,
} from "./types";

/**
 * Made-up sample orders used when DEMO_MODE=true (README screenshots, local demos).
 * Every name, number and e-mail below is fictional.
 */

// Current price list: A3 1=Rs60 / 5=Rs250, A4 1=Rs40 / 5=Rs170
const price = (qty: number, single: number, packQty: number, packPrice: number) =>
  qty <= 0 ? 0 : Math.floor(qty / packQty) * packPrice + (qty % packQty) * single;

interface Seed {
  name: string;
  branch: string;
  year: string;
  hostel: string;
  a3: number;
  a4: number;
  source: string;
  mode: PaymentMode;
  pay: PaymentStatus;
  design: DesignStatus;
  print?: PrintStatus;
  wa?: WhatsAppStatus;
  status?: OrderStatus;
  notes?: string;
  day: string;
  dispatched?: boolean;
}

const seeds: Seed[] = [
  { name: "Aarav Mehta", branch: "CSE", year: "1st Year", hostel: "Raman", a3: 5, a4: 0, source: "Catalog", mode: "UPI", pay: "PAID", design: "READY", print: "PRINTING", status: "PROCESSING", day: "2026-10-04T18:12:00Z", dispatched: true },
  { name: "Diya Kapoor", branch: "DSAI", year: "1st Year", hostel: "Shabri", a3: 0, a4: 7, source: "Own images", mode: "UPI", pay: "PAID", design: "AWAITING REVIEW", day: "2026-10-04T18:20:00Z" },
  { name: "Kabir Nair", branch: "ECE", year: "2nd Year", hostel: "Bose", a3: 3, a4: 0, source: "Catalog + own", mode: "UPI", pay: "PENDING", design: "UPSCALING HQ", day: "2026-10-04T18:31:00Z" },
  { name: "Ananya Rao", branch: "CSE", year: "3rd Year", hostel: "Ramanujan", a3: 0, a4: 1, source: "Catalog", mode: "Cash", pay: "PENDING", design: "QUEUED HQ", day: "2026-10-04T18:44:00Z" },
  { name: "Vihaan Gupta", branch: "DSAI", year: "1st Year", hostel: "Raman", a3: 1, a4: 5, source: "Catalog + own", mode: "UPI", pay: "PAID", design: "AWAITING REVIEW", day: "2026-10-04T19:02:00Z" },
  { name: "Ishita Verma", branch: "ECE", year: "1st Year", hostel: "Shabri", a3: 0, a4: 11, source: "Own images", mode: "UPI", pay: "PAID", design: "ON HOLD", status: "NEEDS FIXING", notes: "CHECK CUSTOMER: A4 quantity is 11, but 10 design(s) were provided.", day: "2026-10-04T19:10:00Z" },
  { name: "Rohan Das", branch: "CSE", year: "2nd Year", hostel: "Bose", a3: 5, a4: 0, source: "Catalog", mode: "Cash", pay: "PENDING", design: "READY", print: "PENDING", status: "PROCESSING", day: "2026-10-04T19:25:00Z", dispatched: true },
  { name: "Meera Joshi", branch: "DSAI", year: "1st Year", hostel: "Ramanujan", a3: 0, a4: 5, source: "Catalog + own", mode: "UPI", pay: "PAID", design: "READY", print: "DONE", wa: "SENT", status: "COMPLETED", day: "2026-10-03T16:40:00Z", dispatched: true },
  { name: "Arjun Reddy", branch: "ECE", year: "3rd Year", hostel: "Raman", a3: 4, a4: 0, source: "Own images", mode: "UPI", pay: "PAID", design: "UPSCALE ISSUE", notes: "A3 U3: could not read the file, ask for a new upload", day: "2026-10-04T19:48:00Z" },
  { name: "Saanvi Iyer", branch: "CSE", year: "1st Year", hostel: "Shabri", a3: 1, a4: 0, source: "Own image", mode: "Cash", pay: "PENDING", design: "WAITING", day: "2026-10-04T20:05:00Z" },
  { name: "Yash Malhotra", branch: "DSAI", year: "2nd Year", hostel: "Bose", a3: 0, a4: 5, source: "Catalog", mode: "UPI", pay: "PAID", design: "AWAITING REVIEW", day: "2026-10-04T20:20:00Z" },
  { name: "Tara Bhatt", branch: "ECE", year: "1st Year", hostel: "Ramanujan", a3: 5, a4: 0, source: "Catalog", mode: "UPI", pay: "PAID", design: "QUEUED HQ", day: "2026-10-04T20:33:00Z" },
];

export const DEMO_ORDERS: Order[] = seeds.map((s, i): Order => {
  const a3Price = price(s.a3, 60, 5, 250);
  const a4Price = price(s.a4, 40, 5, 170);
  const n = String(i + 1).padStart(2, "0");
  return {
    orderId: `IMP-2610${String(4 + Math.floor(i / 8)).padStart(2, "0")}-1${n}5${n}-DEMO${n}`,
    createdAt: s.day,
    customerName: s.name,
    email: `demo${n}@example.com`,
    whatsApp: `90000000${n}`,
    branch: s.branch,
    year: s.year,
    hostel: s.hostel,
    a3Quantity: s.a3,
    a3Source: s.a3 ? s.source : "",
    a3CatalogNumbers: "",
    a3CustomFile: "",
    a4Quantity: s.a4,
    a4Source: s.a4 ? s.source : "",
    a4CatalogNumbers: "",
    a4CustomFile: "",
    a3Price,
    a4Price,
    totalPrice: a3Price + a4Price,
    paymentMode: s.mode,
    paymentScreenshot: s.mode === "UPI" ? "https://example.com/payment" : "",
    paymentStatus: s.pay,
    designStatus: s.design,
    canvaA3: "",
    canvaA4: "",
    printStatus: s.print ?? "NOT_READY",
    whatsAppStatus: s.wa ?? "NOT_SENT",
    orderStatus: s.status ?? "NEW",
    notes: s.notes ?? "",
    zipLink: s.dispatched ? "https://drive.google.com/drive/folders/demo" : "",
    whatsAppLink: s.dispatched ? `https://wa.me/90000000${n}` : "",
    rowIndex: i + 2,
  };
});
