"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ViolationType } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { setViolationActive, deleteViolationType } from "@/app/(app)/violations/actions";

export function ViolationList({
  violations,
  dict,
}: {
  violations: ViolationType[];
  dict: Dictionary;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return violations;
    return violations.filter(
      (v) => v.name.toLowerCase().includes(term) || v.description?.toLowerCase().includes(term)
    );
  }, [violations, q]);

  return (
    <div>
      <div className="relative mb-4">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ltr:left-3 rtl:right-3"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.violations.searchPlaceholder}
          className="input ltr:pl-10 rtl:pr-10"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((v) => (
          <div key={v.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                    {v.name}
                  </p>
                  <StatusBadge active={v.is_active} dict={dict} />
                </div>
                {v.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {v.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {v.fields.length}{" "}
                  {v.fields.length === 1 ? dict.violations.fieldsCount : dict.violations.fieldsCountPlural}
                </p>
              </div>
              <Link
                href={`/violations/${v.id}/edit`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <Icon name="edit" className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <ConfirmButton
                label={v.is_active ? dict.common.deactivate : dict.common.activate}
                variant="secondary"
                confirmLabel={
                  v.is_active ? dict.violations.deactivateConfirm : dict.violations.activateConfirm
                }
                onConfirm={() => setViolationActive(v.id, !v.is_active)}
                dict={dict}
              />
              <ConfirmButton
                label={dict.common.delete}
                icon="trash"
                confirmLabel={dict.violations.deleteConfirm}
                onConfirm={() => deleteViolationType(v.id)}
                dict={dict}
              />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {dict.violations.noSearchResults}
          </p>
        )}
      </div>
    </div>
  );
}
