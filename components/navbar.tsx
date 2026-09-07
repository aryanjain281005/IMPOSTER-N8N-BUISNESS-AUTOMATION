"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, LayoutDashboard, ListOrdered } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="mr-2 size-4" />,
    },
    {
      href: "/orders",
      label: "Orders",
      icon: <ListOrdered className="mr-2 size-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <Package className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">IMPOSTER</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Admin Dashboard
              </p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 sm:ml-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  pathname === route.href
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
