import type { Dictionary } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

export interface NavItem {
  href: string;
  key: keyof Dictionary["nav"];
  icon: string;
  adminOnly?: boolean;
  /** Hidden for employees tagged as "contractor" — they don't raise observations. */
  observerOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: "grid" },
  { href: "/reports/new", key: "newReport", icon: "plus", observerOnly: true },
  { href: "/reports", key: "reports", icon: "doc" },
  { href: "/projects", key: "projects", icon: "building", adminOnly: true },
  { href: "/violations", key: "violations", icon: "warning", adminOnly: true },
  { href: "/users", key: "users", icon: "users", adminOnly: true },
  { href: "/settings", key: "settings", icon: "settings", adminOnly: true },
];

export function visibleNavItems(profile: Profile): NavItem[] {
  const isAdmin = profile.role === "admin";
  return NAV_ITEMS.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.observerOnly && !isAdmin && profile.report_role === "contractor") return false;
    return true;
  });
}

export function navLabel(item: NavItem, profile: Profile, dict: Dictionary): string {
  if (item.href === "/reports" && profile.role !== "admin") return dict.nav.myReports;
  return dict.nav[item.key];
}
