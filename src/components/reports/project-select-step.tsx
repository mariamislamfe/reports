import Link from "next/link";
import type { Project } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";

export function ProjectSelectStep({
  projects,
  onSelect,
  dict,
}: {
  projects: Project[];
  onSelect: (project: Project) => void;
  dict: Dictionary;
}) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon="building"
        title={dict.wizard.noProjectsTitle}
        description={dict.wizard.noProjectsDescription}
        actionLabel={dict.projects.addProject}
        actionHref="/projects/new"
      />
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
        {dict.wizard.selectProject}
      </h2>
      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(project)}
            className="card flex w-full items-center justify-between gap-3 text-left transition active:scale-[0.98] rtl:text-right"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {project.name}
              </p>
              {(project.code || project.location) && (
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {[project.code, project.location].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <Icon
              name="chevronRight"
              className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600 rtl:rotate-180"
            />
          </button>
        ))}
      </div>
      <Link href="/projects/new" className="btn-ghost mt-3 w-full">
        <Icon name="plus" className="h-4 w-4" />
        {dict.wizard.addNewProject}
      </Link>
    </div>
  );
}
