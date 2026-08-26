"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { setProjectActive, deleteProject } from "@/app/(app)/projects/actions";

export function ProjectList({ projects, dict }: { projects: Project[]; dict: Dictionary }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term) ||
        p.location?.toLowerCase().includes(term)
    );
  }, [projects, q]);

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
          placeholder={dict.projects.searchPlaceholder}
          className="input ltr:pl-10 rtl:pr-10"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((project) => (
          <div key={project.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                    {project.name}
                  </p>
                  <StatusBadge active={project.is_active} dict={dict} />
                </div>
                {project.code && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {dict.projects.code}: {project.code}
                  </p>
                )}
                {project.location && (
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                    {project.location}
                  </p>
                )}
              </div>
              <Link
                href={`/projects/${project.id}/edit`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <Icon name="edit" className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <ConfirmButton
                label={project.is_active ? dict.common.deactivate : dict.common.activate}
                variant="secondary"
                confirmLabel={
                  project.is_active ? dict.projects.deactivateConfirm : dict.projects.activateConfirm
                }
                onConfirm={() => setProjectActive(project.id, !project.is_active)}
                dict={dict}
              />
              <ConfirmButton
                label={dict.common.delete}
                icon="trash"
                confirmLabel={dict.projects.deleteConfirm}
                onConfirm={() => deleteProject(project.id)}
                dict={dict}
              />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {dict.projects.noSearchResults}
          </p>
        )}
      </div>
    </div>
  );
}
