import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "Admin Panel",
        authorizeOnly: UserRole.ADMIN,
      },
      { href: "/dashboard", icon: "dashboard", title: "Dashboard" },
      {
        href: "/dashboard/copilot",
        icon: "lineChart",
        title: "Copilot",
      },
      {
        href: "/dashboard/knowledge-base",
        icon: "bookOpen",
        title: "Knowledge Base",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/dashboard/credits",
        icon: "billing",
        title: "Credits",
      },
      {
        href: "/dashboard/billing",
        icon: "billing",
        title: "Billing",
      },
      {
        href: "/admin/orders",
        icon: "package",
        title: "Orders",
        badge: 2,
        authorizeOnly: UserRole.ADMIN,
      },
      // { href: "/dashboard/charts", icon: "lineChart", title: "Charts" },
      // {
      //   href: "#/dashboard/posts",
      //   icon: "post",
      //   title: "User Posts",
      //   authorizeOnly: UserRole.USER,
      //   disabled: true,
      // },
    ],
  },
  {
    title: "OPTIONS",
    items: [
      { href: "/dashboard/settings", icon: "settings", title: "Settings" },
      { href: "/", icon: "home", title: "Homepage" },
      {
        href: "/contact",
        icon: "messages",
        title: "Support",
        authorizeOnly: UserRole.USER,
      },
    ],
  },
];
