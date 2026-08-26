"use client";

import { useActionState } from "react";
import type { ViolationType } from "@/lib/types";
import type { ViolationFormState } from "@/app/(app)/violations/actions";
import type { Dictionary } from "@/lib/i18n";
import { FieldBuilder } from "./field-builder";

export function ViolationForm({
  violation,
  action,
  dict,
}: {
  violation?: ViolationType;
  action: (prev: ViolationFormState, formData: FormData) => Promise<ViolationFormState>;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState<ViolationFormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">
          {dict.violations.name} *
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={violation?.name}
          className="input"
          placeholder={dict.violations.namePlaceholder}
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          {dict.violations.descriptionLabel}
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={violation?.description ?? ""}
          className="input"
          rows={2}
          placeholder={dict.violations.descriptionPlaceholder}
        />
      </div>

      <FieldBuilder initialFields={violation?.fields ?? []} dict={dict} />

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending
          ? dict.common.saving
          : violation
            ? dict.violations.saveChanges
            : dict.violations.createViolation}
      </button>
    </form>
  );
}
