"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  Calendar, 
  ChefHat, 
  MessageSquare, 
  PanelLeft, 
  ShoppingBag 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <PanelLeft className="h-5 w-5" />,
  },
  {
    title: "Kitchen Oracle",
    href: "/dashboard/oracle",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Shift Schedule",
    href: "/dashboard/schedule",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Recipe Book",
    href: "/dashboard/recipes",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Menu Suggestions",
    href: "/dashboard/suggestions",
    icon: <ChefHat className="h-5 w-5" />,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <ChefHat className="h-6 w-6 text-orange-600" />
          <span className="text-lg">Kitchen Manager</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                pathname === item.href && "bg-muted text-foreground"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 flex items-center justify-between border-t">
        <UserButton afterSignOutUrl="/" />
        <ThemeToggle />
      </div>
    </div>
  );
}
