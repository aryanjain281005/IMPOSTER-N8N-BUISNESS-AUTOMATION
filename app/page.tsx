import { StatsDashboard } from "@/components/stats-dashboard";
import { fetchOrders } from "@/app/actions/orders";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let orders: Order[];

  try {
    orders = await fetchOrders();
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    orders = [];
  }

  return <StatsDashboard orders={orders} />;
}
