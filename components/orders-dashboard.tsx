"use client";

import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { getColumns } from "@/components/columns";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Order } from "@/lib/types";
import {
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  TrendingUp,
  Image,
  FileImage,
  Layers,
} from "lucide-react";

interface OrdersDashboardProps {
  orders: Order[];
}

export function OrdersDashboard({ orders: initialOrders }: OrdersDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  /**
   * Optimistic update: immediately update the local state when a status
   * dropdown is changed, before the server action completes.
   */
  const handleOptimisticUpdate = useCallback(
    (rowIndex: number, field: "paymentStatus" | "designStatus", value: string) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.rowIndex === rowIndex ? { ...order, [field]: value } : order
        )
      );
    },
    []
  );

  const columns = useMemo(
    () => getColumns(handleOptimisticUpdate),
    [handleOptimisticUpdate]
  );

  // Filtered data based on the active tab
  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case "action":
        return orders.filter(
          (o) => o.paymentStatus === "PENDING" || o.designStatus === "WAITING"
        );
      case "completed":
        return orders.filter((o) => o.orderStatus === "COMPLETED");
      default:
        return orders;
    }
  }, [orders, activeTab]);

  // Summary stats
  const stats = useMemo(() => {
    const total = orders.length;
    const actionRequired = orders.filter(
      (o) => o.paymentStatus === "PENDING" || o.designStatus === "WAITING"
    ).length;
    const completed = orders.filter(
      (o) => o.orderStatus === "COMPLETED"
    ).length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalCost = orders.reduce((sum, o) => sum + (o.a3Quantity * 15) + (o.a4Quantity * 7.5), 0);
    const totalProfit = totalRevenue - totalCost;
    
    const totalA3 = orders.reduce((sum, o) => sum + o.a3Quantity, 0);
    const totalA4 = orders.reduce((sum, o) => sum + o.a4Quantity, 0);
    const totalPhotos = totalA3 + totalA4;

    return { total, actionRequired, completed, totalRevenue, totalProfit, totalA3, totalA4, totalPhotos };
  }, [orders]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <Package className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">IMPOSTER</h1>
              <p className="text-xs text-muted-foreground">
                Admin Dashboard
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Total Orders"
            value={stats.total}
            icon={<LayoutDashboard className="size-4" />}
            accent="text-blue-600 dark:text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatsCard
            label="Action Required"
            value={stats.actionRequired}
            icon={<AlertTriangle className="size-4" />}
            accent="text-amber-600 dark:text-amber-400"
            bg="bg-amber-500/10"
          />
          <StatsCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="size-4" />}
            accent="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <StatsCard
            label="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
            icon={<Package className="size-4" />}
            accent="text-violet-600 dark:text-violet-400"
            bg="bg-violet-500/10"
          />
          <StatsCard
            label="Total Profit"
            value={`₹${stats.totalProfit.toLocaleString("en-IN")}`}
            icon={<TrendingUp className="size-4" />}
            accent="text-pink-600 dark:text-pink-400"
            bg="bg-pink-500/10"
          />
          <StatsCard
            label="Total A3 Prints"
            value={stats.totalA3}
            icon={<Image className="size-4" />}
            accent="text-indigo-600 dark:text-indigo-400"
            bg="bg-indigo-500/10"
          />
          <StatsCard
            label="Total A4 Prints"
            value={stats.totalA4}
            icon={<FileImage className="size-4" />}
            accent="text-cyan-600 dark:text-cyan-400"
            bg="bg-cyan-500/10"
          />
          <StatsCard
            label="Total Photos"
            value={stats.totalPhotos}
            icon={<Layers className="size-4" />}
            accent="text-orange-600 dark:text-orange-400"
            bg="bg-orange-500/10"
          />
        </div>

        {/* Tabs + Search */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="all" className="gap-1.5">
                <LayoutDashboard className="size-3.5" />
                All Orders
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                  {stats.total}
                </span>
              </TabsTrigger>
              <TabsTrigger value="action" className="gap-1.5">
                <AlertTriangle className="size-3.5" />
                Action Required
                {stats.actionRequired > 0 && (
                  <span className="ml-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 text-[10px] font-semibold">
                    {stats.actionRequired}
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
      </main>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon,
  accent,
  bg,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${bg} ${accent}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-xl font-bold ${accent}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
