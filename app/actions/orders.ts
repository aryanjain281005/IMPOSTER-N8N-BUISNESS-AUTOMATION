"use server";

import { getOrders, updateOrderStatus } from "@/lib/googleSheets";
import type { Order, PaymentStatus, DesignStatus } from "@/lib/types";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Fetch all orders from the Google Sheet.
 */
export async function fetchOrders(): Promise<Order[]> {
  return getOrders();
}

/**
 * Server Action: Update the Payment Status for an order.
 * @param rowIndex - 1-indexed row number in the sheet
 * @param value - The new PaymentStatus value
 */
export async function updatePaymentStatusAction(
  rowIndex: number,
  value: PaymentStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateOrderStatus(rowIndex, "Payment Status", value);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update Payment Status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server Action: Update the Design Status for an order.
 * If the new value is "READY", also fires the n8n webhook.
 * @param rowIndex - 1-indexed row number in the sheet
 * @param value - The new DesignStatus value
 * @param orderData - The full order object (sent to n8n webhook)
 */
export async function updateDesignStatusAction(
  rowIndex: number,
  value: DesignStatus,
  orderData: Order
): Promise<{ success: boolean; error?: string }> {
  try {
    // Write to Google Sheet immediately
    await updateOrderStatus(rowIndex, "Design Status", value);

    // If changing to READY, trigger the n8n webhook
    if (value === "READY") {
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...orderData,
              designStatus: value,
              triggeredAt: new Date().toISOString(),
            }),
          });
        } catch (webhookError) {
          // Log but don't fail the status update if webhook fails
          console.error("n8n webhook call failed:", webhookError);
        }
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update Design Status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
