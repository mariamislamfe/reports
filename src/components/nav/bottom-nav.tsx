"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { visibleNavItems, navLabel } from "./nav-items";
import type { Profile } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

export function BottomNav({ profile, dict }: { profile: Profile; dict: Dictionary }) {
  const pathname = usePathname();
  const items = visibleNavItems(profile).slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {items.map((item) => {
          const active = pathname === item.href || (pathname ?? "").startsWith(item.href + "/");
          const isCenter = item.href === "/reports/new";
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium"
            >
              {isCenter ? (
                <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-4 ring-white dark:ring-slate-900">
                  <Icon name="plus" className="h-6 w-6" />
                </span>
              ) : (
                <Icon
                  name={item.icon as any}
                  className={active ? "h-5 w-5 text-brand-600" : "h-5 w-5 text-slate-400 dark:text-slate-500"}
                />
              )}
              <span
                className={
                  active && !isCenter
                    ? "text-brand-600"
                    : isCenter
                      ? "text-brand-600"
                      : "text-slate-500 dark:text-slate-400"
                }
              >
                {navLabel(item, profile, dict)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
