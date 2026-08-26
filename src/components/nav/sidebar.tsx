"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { CompanyMark } from "@/components/ui/company-mark";
import { visibleNavItems, navLabel } from "./nav-items";
import type { Profile } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { signOut } from "@/app/login/actions";

export function Sidebar({ profile, dict }: { profile: Profile; dict: Dictionary }) {
  const pathname = usePathname();
  const items = visibleNavItems(profile);

  return (
    <aside className="fixed inset-y-0 hidden w-64 flex-col border-slate-200 bg-white md:flex ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 px-6 py-5">
        <CompanyMark size={36} />
        <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
          {process.env.NEXT_PUBLIC_COMPANY_NAME || "Violation Reports"}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href || (pathname ?? "").startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon name={item.icon as any} className="h-5 w-5" />
              {navLabel(item, profile, dict)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <Link
          href="/settings"
          className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {profile.full_name}
            </p>
            <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{profile.role}</p>
          </div>
        </Link>
        <form action={signOut}>
          <button type="submit" className="btn-ghost w-full justify-start">
            <Icon name="logout" className="h-4 w-4" />
            {dict.common.signOut}
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] text-slate-300 dark:text-slate-700">
          Made by Mariam Islam
        </p>
      </div>
    </aside>
  );
}
