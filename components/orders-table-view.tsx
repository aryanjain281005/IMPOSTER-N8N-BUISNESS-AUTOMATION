"use client";

import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { getColumns } from "@/components/columns";
import type { Order } from "@/lib/types";
import { NEEDS_ATTENTION } from "@/lib/types";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

export function OrdersTableView({ orders }: { orders: Order[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [globalFilter, setGlobalFilter] = useState("");

  // Local state for optimistic UI updates
  const [optimisticOrders, setOptimisticOrders] = useState<Order[]>(orders);

  // Sync local state when prop changes (e.g., after server action revalidates)
  useMemo(() => {
    setOptimisticOrders(orders);
  }, [orders]);

  const handleOptimisticUpdate = useCallback(
    (rowIndex: number, field: "paymentStatus" | "designStatus" | "orderStatus", value: string) => {
      setOptimisticOrders((prev) =>
        prev.map((o) => {
          if (o.rowIndex === rowIndex) {
            return { ...o, [field]: value };
          }
          return o;
        })
      );
    },
    []
  );

  const columns = useMemo(() => getColumns(handleOptimisticUpdate), [handleOptimisticUpdate]);

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case "action":
        return optimisticOrders.filter(
          (o) => o.paymentStatus === "PENDING" || NEEDS_ATTENTION.includes(o.designStatus)
        );
      case "completed":
        return optimisticOrders.filter((o) => o.orderStatus === "COMPLETED");
      default:
        return optimisticOrders;
    }
  }, [optimisticOrders, activeTab]);

  const total = optimisticOrders.length;
  const actionRequired = optimisticOrders.filter(
    (o) => o.paymentStatus === "PENDING" || NEEDS_ATTENTION.includes(o.designStatus)
  ).length;

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <LayoutDashboard className="size-3.5" />
              All Orders
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                {total}
              </span>
            </TabsTrigger>
            <TabsTrigger value="action" className="gap-1.5">
              <AlertTriangle className="size-3.5" />
              Action Required
              {actionRequired > 0 && (
                <span className="ml-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 text-[10px] font-semibold">
                  {actionRequired}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Completed
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID or Name..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={filteredOrders}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </TabsContent>
        <TabsContent value="action">
          <DataTable
            columns={columns}
            data={filteredOrders}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </TabsContent>
        <TabsContent value="completed">
          <DataTable
            columns={columns}
            data={filteredOrders}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
