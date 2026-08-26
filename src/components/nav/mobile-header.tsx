"use client";

import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { Icon } from "@/components/ui/icon";
import { CompanyMark } from "@/components/ui/company-mark";
import type { Profile } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

export function MobileHeader({ profile, dict }: { profile: Profile; dict: Dictionary }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex items-center gap-2">
        <CompanyMark size={32} />
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {process.env.NEXT_PUBLIC_COMPANY_NAME || "Violation Reports"}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Icon name="settings" className="h-4 w-4" />
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            aria-label={dict.common.signOut}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Icon name="logout" className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
