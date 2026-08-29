import { OrdersDashboard } from "@/components/orders-dashboard";
import { fetchOrders } from "@/app/actions/orders";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let orders: Order[];

  try {
    orders = await fetchOrders();
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    // Render the dashboard with empty state so the UI still loads
    orders = [];
  }

  return <OrdersDashboard orders={orders} />;
}
