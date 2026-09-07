import { OrdersTableView } from "@/components/orders-table-view";
import { fetchOrders } from "@/app/actions/orders";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let orders: Order[];

  try {
    orders = await fetchOrders();
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    orders = [];
  }

  return <OrdersTableView orders={orders} />;
}
