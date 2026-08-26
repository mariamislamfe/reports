"use client";

import { useActionState } from "react";
import type { Project } from "@/lib/types";
import type { ProjectFormState } from "@/app/(app)/projects/actions";
import type { Dictionary } from "@/lib/i18n";

export function ProjectForm({
  project,
  action,
  dict,
}: {
  project?: Project;
  action: (prev: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">
          {dict.projects.name} *
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={project?.name}
          className="input"
          placeholder={dict.projects.namePlaceholder}
        />
      </div>

      <div>
        <label className="label" htmlFor="code">
          {dict.projects.code}
        </label>
        <input
          id="code"
          name="code"
          defaultValue={project?.code ?? ""}
          className="input"
          placeholder={dict.projects.codePlaceholder}
        />
      </div>

      <div>
        <label className="label" htmlFor="location">
          {dict.projects.location}
        </label>
        <textarea
          id="location"
          name="location"
          defaultValue={project?.location ?? ""}
          className="input"
          rows={3}
          placeholder={dict.projects.locationPlaceholder}
        />
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
        <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {dict.projects.reportFieldsHeading}
        </p>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          {dict.projects.reportFieldsHint}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="label" htmlFor="business_unit">
            {dict.projects.businessUnit}
          </label>
          <input
            id="business_unit"
            name="business_unit"
            defaultValue={project?.business_unit ?? ""}
            className="input"
            placeholder={dict.projects.businessUnitPlaceholder}
          />
        </div>

        <div>
          <label className="label" htmlFor="contractor">
            {dict.projects.contractor}
          </label>
          <input
            id="contractor"
            name="contractor"
            defaultValue={project?.contractor ?? ""}
            className="input"
            placeholder={dict.projects.contractorPlaceholder}
          />
        </div>

        <div>
          <label className="label" htmlFor="sup_consultant">
            {dict.projects.supConsultant}
          </label>
          <input
            id="sup_consultant"
            name="sup_consultant"
            defaultValue={project?.sup_consultant ?? ""}
            className="input"
            placeholder={dict.projects.supConsultantPlaceholder}
          />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? dict.common.saving : project ? dict.projects.saveChanges : dict.projects.createProject}
      </button>
    </form>
  );
}
