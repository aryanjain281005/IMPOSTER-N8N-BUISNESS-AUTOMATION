"use client";

import { useMemo } from "react";
import type { Order } from "@/lib/types";
import { NEEDS_ATTENTION } from "@/lib/types";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  TrendingUp,
  Image,
  FileImage,
  Layers,
} from "lucide-react";

export function StatsDashboard({ orders }: { orders: Order[] }) {
  // Summary stats
  const stats = useMemo(() => {
    const total = orders.length;
    const actionRequired = orders.filter(
      (o) => o.paymentStatus === "PENDING" || NEEDS_ATTENTION.includes(o.designStatus)
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
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
