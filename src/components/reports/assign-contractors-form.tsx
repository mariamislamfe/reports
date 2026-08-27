"use client";

import { useState, useTransition } from "react";
import type { Profile } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { setAssignedContractors } from "@/app/(app)/reports/actions";

export function AssignContractorsForm({
  reportId,
  contractors,
  initialAssignedIds,
  dict,
}: {
  reportId: string;
  contractors: Profile[];
  initialAssignedIds: string[];
  dict: Dictionary;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialAssignedIds));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSaved(false);
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await setAssignedContractors(reportId, Array.from(selected));
      if (result.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="card mb-4">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
        {dict.reports.assignTitle}
      </p>

      {contractors.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{dict.reports.assignEmpty}</p>
      ) : (
        <div className="space-y-2">
          {contractors.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-brand-600"
                checked={selected.has(c.id)}
                onChange={() => toggle(c.id)}
              />
              {c.full_name}
            </label>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {contractors.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <button type="button" disabled={pending} onClick={save} className="btn-primary px-3 py-1.5 text-xs">
            {pending ? dict.common.saving : dict.common.save}
          </button>
          {saved && !pending && <span className="text-xs text-emerald-600 dark:text-emerald-400">✓</span>}
        </div>
      )}
    </div>
  );
}
