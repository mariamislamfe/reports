"use client";

import { useState, useTransition } from "react";
import type { Profile, ReportRole } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { setReportRole } from "./actions";

export function UserList({ users, dict }: { users: Profile[]; dict: Dictionary }) {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <UserRow key={user.id} user={user} dict={dict} />
      ))}
    </div>
  );
}

function UserRow({ user, dict }: { user: Profile; dict: Dictionary }) {
  const [role, setRole] = useState<ReportRole | "">(user.report_role ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(value: string) {
    const previousRole = role;
    const next = (value || null) as ReportRole | null;
    setRole(next ?? "");
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await setReportRole(user.id, next);
      if (result.error) {
        setRole(previousRole);
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <div className="card flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{user.full_name}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {user.role === "admin" ? (
        <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
          {dict.users.admin}
        </span>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={role}
            disabled={pending}
            onChange={(e) => handleChange(e.target.value)}
            className="input w-auto py-2 text-sm"
          >
            <option value="">{dict.users.roleNone}</option>
            <option value="observer">{dict.users.roleObserver}</option>
            <option value="contractor">{dict.users.roleContractor}</option>
          </select>
          {saved && !pending && <span className="text-xs text-emerald-600 dark:text-emerald-400">✓</span>}
        </div>
      )}
    </div>
  );
}
