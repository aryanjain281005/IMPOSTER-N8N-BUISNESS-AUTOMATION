// Strict TypeScript types for the IMPOSTER order management system
// Based on the actual Google Sheet column structure

export type PaymentStatus = "PENDING" | "PAID";
export type DesignStatus =
  | "WAITING"
  | "UPSCALING"
  | "QUEUED HQ"
  | "UPSCALING HQ"
  | "UPSCALE ISSUE"
  | "AWAITING REVIEW"
  | "ON HOLD"
  | "READY";

/** Statuses where the automatic upscaling is still running or blocked: READY must not be set yet. */
export const NOT_READY_FOR_DISPATCH: DesignStatus[] = [
  "UPSCALING",
  "QUEUED HQ",
  "UPSCALING HQ",
  "UPSCALE ISSUE",
  "ON HOLD",
];

/** Statuses that need a human to look at the order. */
export const NEEDS_ATTENTION: DesignStatus[] = ["WAITING", "AWAITING REVIEW", "UPSCALE ISSUE", "ON HOLD"];
export type PaymentMode = "Cash" | "Online" | "UPI";
export type PrintStatus = "NOT_READY" | "PENDING" | "PRINTING" | "DONE";
export type WhatsAppStatus = "NOT_SENT" | "SENT";
export type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "DELIVERED" | "RECEIVED" | "NEEDS FIXING";

export interface Order {
  orderId: string;
  createdAt: string;
  customerName: string;
  email: string;
  whatsApp: string;
  branch: string;
  year: string;
  hostel: string;
  a3Quantity: number;
  a3Source: string;
  a3CatalogNumbers: string;
  a3CustomFile: string;
  a4Quantity: number;
  a4Source: string;
  a4CatalogNumbers: string;
  a4CustomFile: string;
  a3Price: number;
  a4Price: number;
  totalPrice: number;
  paymentMode: PaymentMode;
  paymentScreenshot: string;
  paymentStatus: PaymentStatus;
  designStatus: DesignStatus;
  canvaA3: string;
  canvaA4: string;
  printStatus: PrintStatus;
  whatsAppStatus: WhatsAppStatus;
  orderStatus: OrderStatus;
  notes: string;
  zipLink: string;
  whatsAppLink: string;
  /** 1-indexed row number in the Google Sheet (row 1 is the header) */
  rowIndex: number;
}

/**
 * Actual column layout from the Google Sheet "orders" tab.
 * The sheet has spacer columns (empty headers) between sections.
 * Column indices are 0-based, letters are A1 notation for the Sheets API.
 *
 * Layout:
 *  A: Order ID
 *  B: Created At
 *  C: Customer Name
 *  D: Email
 *  E: WhatsApp
 *  F: Branch
 *  G: Year
 *  H: Hostel
 *  I-J: (spacers)
 *  K: Customer Name (duplicate)
 *  L: Email (duplicate)
 *  M: WhatsApp (duplicate)
 *  N: Branch (duplicate)
 *  O: (spacer)
 *  P: A3 Quantity
 *  Q: A3 Source
 *  R: A3 Catalog Numbers
 *  S: A3 Custom File
 *  T: (spacer)
 *  U: A4 Quantity
 *  V: A4 Source
 *  W: A4 Catalog Numbers
 *  X: A4 Custom File
 *  Y: (spacer)
 *  Z: A3 Price
 *  AA: A4 Price
 *  AB: Total Price
 *  AC: (spacer)
 *  AD: Payment Mode
 *  AE: Payment Screenshot
 *  AF: Payment Status
 *  AG: (spacer)
 *  AH: Design Status
 *  AI: Canva A3
 *  AJ: Canva A4
 *  AK: (spacer)
 *  AL: Print Status
 *  AM: WhatsApp Status
 *  AN: Order Status
 *  AO: Notes
 *  AP: ZIP Link
 *  AQ: WhatsApp Link
 */
export const COLUMN_MAP: Record<string, { index: number; letter: string }> = {
  "Order ID":            { index: 0,  letter: "A" },
  "Created At":          { index: 1,  letter: "B" },
  "Customer Name":       { index: 2,  letter: "C" },
  "Email":               { index: 3,  letter: "D" },
  "WhatsApp":            { index: 4,  letter: "E" },
  "Branch":              { index: 5,  letter: "F" },
  "Year":                { index: 6,  letter: "G" },
  "Hostel":              { index: 7,  letter: "H" },
  "A3 Quantity":         { index: 15, letter: "P" },
  "A3 Source":           { index: 16, letter: "Q" },
  "A3 Catalog Numbers":  { index: 17, letter: "R" },
  "A3 Custom File":      { index: 18, letter: "S" },
  "A4 Quantity":         { index: 20, letter: "U" },
  "A4 Source":           { index: 21, letter: "V" },
  "A4 Catalog Numbers":  { index: 22, letter: "W" },
  "A4 Custom File":      { index: 23, letter: "X" },
  "A3 Price":            { index: 25, letter: "Z" },
  "A4 Price":            { index: 26, letter: "AA" },
  "Total Price":         { index: 27, letter: "AB" },
  "Payment Mode":        { index: 29, letter: "AD" },
  "Payment Screenshot":  { index: 30, letter: "AE" },
  "Payment Status":      { index: 31, letter: "AF" },
  "Design Status":       { index: 33, letter: "AH" },
  "Canva A3":            { index: 34, letter: "AI" },
  "Canva A4":            { index: 35, letter: "AJ" },
  "Print Status":        { index: 37, letter: "AL" },
  "WhatsApp Status":     { index: 38, letter: "AM" },
  "Order Status":        { index: 39, letter: "AN" },
  "Notes":               { index: 40, letter: "AO" },
  "ZIP Link":            { index: 41, letter: "AP" },
  "WhatsApp Link":       { index: 42, letter: "AQ" },
} as const;
