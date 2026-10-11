import { google } from "googleapis";
import type {
  Order,
  PaymentStatus,
  DesignStatus,
  PaymentMode,
  PrintStatus,
  WhatsAppStatus,
  OrderStatus,
} from "./types";
import { COLUMN_MAP } from "./types";
import { DEMO_ORDERS } from "./demoOrders";

/** DEMO_MODE=true runs the dashboard on made-up sample orders (no Google Sheet needed). */
const isDemo = () => process.env.DEMO_MODE === "true";

/**
 * Creates an authenticated Google Sheets client using a Service Account.
 * Reads credentials from environment variables.
 */
function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY environment variables."
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

function getSheetId(): string {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable.");
  }
  return sheetId;
}

function getSheetName(): string {
  return process.env.GOOGLE_SHEET_NAME || "orders";
}

/**
 * Fetches all orders from the Google Sheet "orders" tab.
 * Skips the header row and maps each row to a typed Order object.
 * The sheet has 43 columns (A through AQ) with spacer columns in between sections.
 */
export async function getOrders(): Promise<Order[]> {
  if (isDemo()) return DEMO_ORDERS;
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSheetId();
  const sheetName = getSheetName();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:AQ`, // Skip header row, read all data columns
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows
    .filter((row) => row[0]) // Skip rows without an Order ID
    .map((row, index): Order => {
      const col = COLUMN_MAP;
      return {
        orderId: row[col["Order ID"].index] || "",
        createdAt: row[col["Created At"].index] || "",
        customerName: row[col["Customer Name"].index] || "",
        email: row[col["Email"].index] || "",
        whatsApp: row[col["WhatsApp"].index] || "",
        branch: row[col["Branch"].index] || "",
        year: row[col["Year"].index] || "",
        hostel: row[col["Hostel"].index] || "",
        a3Quantity: parseInt(row[col["A3 Quantity"].index], 10) || 0,
        a3Source: row[col["A3 Source"].index] || "",
        a3CatalogNumbers: row[col["A3 Catalog Numbers"].index] || "",
        a3CustomFile: row[col["A3 Custom File"].index] || "",
        a4Quantity: parseInt(row[col["A4 Quantity"].index], 10) || 0,
        a4Source: row[col["A4 Source"].index] || "",
        a4CatalogNumbers: row[col["A4 Catalog Numbers"].index] || "",
        a4CustomFile: row[col["A4 Custom File"].index] || "",
        a3Price: parseFloat(row[col["A3 Price"].index]) || 0,
        a4Price: parseFloat(row[col["A4 Price"].index]) || 0,
        totalPrice: parseFloat(row[col["Total Price"].index]) || 0,
        paymentMode: (row[col["Payment Mode"].index] as PaymentMode) || "Cash",
        paymentScreenshot: row[col["Payment Screenshot"].index] || "",
        paymentStatus: (row[col["Payment Status"].index] as PaymentStatus) || "PENDING",
        designStatus: (row[col["Design Status"].index] as DesignStatus) || "WAITING",
        canvaA3: row[col["Canva A3"].index] || "",
        canvaA4: row[col["Canva A4"].index] || "",
        printStatus: (row[col["Print Status"].index] as PrintStatus) || "NOT_READY",
        whatsAppStatus: (row[col["WhatsApp Status"].index] as WhatsAppStatus) || "NOT_SENT",
        orderStatus: (row[col["Order Status"].index] as OrderStatus) || "NEW",
        notes: row[col["Notes"].index] || "",
        zipLink: row[col["ZIP Link"].index] || "",
        whatsAppLink: row[col["WhatsApp Link"].index] || "",
        rowIndex: index + 2, // +2 because: +1 for 0-indexed, +1 for header row
      };
    });
}

/**
 * Updates a single cell in the Google Sheet.
 * @param rowIndex - 1-indexed row number (row 1 is the header)
 * @param columnHeader - The column header name (e.g., "Payment Status")
 * @param value - The new value to write
 */
export async function updateOrderStatus(
  rowIndex: number,
  columnHeader: string,
  value: string
): Promise<void> {
  if (isDemo()) return; // demo data is read-only
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSheetId();
  const sheetName = getSheetName();

  const column = COLUMN_MAP[columnHeader];
  if (!column) {
    throw new Error(`Unknown column header: "${columnHeader}"`);
  }

  const cellRange = `${sheetName}!${column.letter}${rowIndex}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: cellRange,
    valueInputOption: "RAW",
    requestBody: {
      values: [[value]],
    },
  });
}
