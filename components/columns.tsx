"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderArchive,
  ChevronDown,
  ExternalLink,
  Image,
} from "lucide-react";
import type {
  Order,
  PaymentStatus,
  DesignStatus,
} from "@/lib/types";
import {
  updatePaymentStatusAction,
  updateDesignStatusAction,
} from "@/app/actions/orders";

// WhatsApp SVG icon component for the branded button
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Creates column definitions for the orders table.
 * Uses a factory function to allow passing the optimistic update callback.
 */
export function getColumns(
  onOptimisticUpdate: (
    rowIndex: number,
    field: "paymentStatus" | "designStatus",
    value: string
  ) => void
): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "orderId",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-foreground text-xs">
          {row.getValue("orderId")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string;
        if (!dateStr) return <span className="text-muted-foreground">—</span>;
        try {
          const date = new Date(dateStr);
          return (
            <span className="text-muted-foreground text-xs">
              {date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          );
        } catch {
          return <span className="text-muted-foreground text-xs">{dateStr}</span>;
        }
      },
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <span className="font-medium">{row.getValue("customerName")}</span>
            <div className="text-[11px] text-muted-foreground">
              {order.branch} · {order.year}
              {order.hostel ? ` · ${order.hostel}` : ""}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "whatsApp",
      header: "WhatsApp",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs font-mono">
          {row.getValue("whatsApp")}
        </span>
      ),
    },
    {
      accessorKey: "a3Quantity",
      header: "A3",
      cell: ({ row }) => {
        const qty = row.getValue("a3Quantity") as number;
        return (
          <span className={qty > 0 ? "font-semibold" : "text-muted-foreground"}>
            {qty}
          </span>
        );
      },
    },
    {
      accessorKey: "a4Quantity",
      header: "A4",
      cell: ({ row }) => {
        const qty = row.getValue("a4Quantity") as number;
        return (
          <span className={qty > 0 ? "font-semibold" : "text-muted-foreground"}>
            {qty}
          </span>
        );
      },
    },
    {
      accessorKey: "totalPrice",
      header: "Total",
      cell: ({ row }) => {
        const price = row.getValue("totalPrice") as number;
        return <span className="font-semibold">₹{price.toLocaleString("en-IN")}</span>;
      },
    },
    {
      accessorKey: "paymentMode",
      header: "Mode",
      cell: ({ row }) => {
        const mode = row.getValue("paymentMode") as string;
        const variant = mode === "UPI" || mode === "Online" ? "purple" : "muted";
        return <Badge variant={variant}>{mode}</Badge>;
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as PaymentStatus;
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 cursor-pointer focus:outline-none group">
                <Badge
                  variant={status === "PAID" ? "success" : "warning"}
                  className="transition-all group-hover:ring-2 group-hover:ring-ring group-hover:ring-offset-1"
                >
                  {status}
                  <ChevronDown className="ml-0.5 size-3" />
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Update Payment</DropdownMenuLabel>
              {(["PENDING", "PAID"] as PaymentStatus[]).map((val) => (
                <DropdownMenuItem
                  key={val}
                  disabled={val === status}
                  onClick={async () => {
                    onOptimisticUpdate(order.rowIndex, "paymentStatus", val);
                    const result = await updatePaymentStatusAction(
                      order.rowIndex,
                      val
                    );
                    if (!result.success) {
                      onOptimisticUpdate(
                        order.rowIndex,
                        "paymentStatus",
                        status
                      );
                      alert(`Failed to update: ${result.error}`);
                    }
                  }}
                >
                  <Badge
                    variant={val === "PAID" ? "success" : "warning"}
                    className="text-xs"
                  >
                    {val}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      accessorKey: "designStatus",
      header: "Design",
      cell: ({ row }) => {
        const status = row.getValue("designStatus") as DesignStatus;
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 cursor-pointer focus:outline-none group">
                <Badge
                  variant={status === "READY" ? "info" : "warning"}
                  className="transition-all group-hover:ring-2 group-hover:ring-ring group-hover:ring-offset-1"
                >
                  {status}
                  <ChevronDown className="ml-0.5 size-3" />
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Update Design</DropdownMenuLabel>
              {(["WAITING", "READY"] as DesignStatus[]).map((val) => (
                <DropdownMenuItem
                  key={val}
                  disabled={val === status}
                  onClick={async () => {
                    onOptimisticUpdate(order.rowIndex, "designStatus", val);
                    const result = await updateDesignStatusAction(
                      order.rowIndex,
                      val,
                      order
                    );
                    if (!result.success) {
                      onOptimisticUpdate(
                        order.rowIndex,
                        "designStatus",
                        status
                      );
                      alert(`Failed to update: ${result.error}`);
                    }
                  }}
                >
                  <Badge
                    variant={val === "READY" ? "info" : "warning"}
                    className="text-xs"
                  >
                    {val}
                  </Badge>
                  {val === "READY" && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      (triggers webhook)
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      accessorKey: "printStatus",
      header: "Print",
      cell: ({ row }) => {
        const status = row.getValue("printStatus") as string;
        const variant =
          status === "DONE"
            ? "success"
            : status === "PRINTING"
            ? "info"
            : status === "PENDING"
            ? "warning"
            : "muted";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "orderStatus",
      header: "Order",
      cell: ({ row }) => {
        const status = row.getValue("orderStatus") as string;
        const variant =
          status === "COMPLETED"
            ? "success"
            : status === "CANCELLED"
            ? "destructive"
            : status === "PROCESSING"
            ? "info"
            : "secondary";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-2">
            {order.whatsAppLink && (
              <a
                href={order.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5"
                >
                  <WhatsAppIcon className="size-3.5" />
                  Send
                </Button>
              </a>
            )}
            {order.zipLink && (
              <a
                href={order.zipLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FolderArchive className="size-3.5" />
                  Files
                  <ExternalLink className="size-3" />
                </Button>
              </a>
            )}
            {order.paymentScreenshot && (
              <a
                href={order.paymentScreenshot}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Image className="size-3.5" />
                  Pay SS
                </Button>
              </a>
            )}
          </div>
        );
      },
    },
  ];
}
