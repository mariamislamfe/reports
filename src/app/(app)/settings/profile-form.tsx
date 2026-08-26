"use client";

import { useActionState } from "react";
import { updateProfile, type SettingsFormState } from "./actions";
import type { Profile } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

export function ProfileForm({ profile, dict }: { profile: Profile; dict: Dictionary }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    updateProfile,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="full_name">
          {dict.settings.fullName}
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={profile.full_name}
          required
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="position">
          {dict.settings.position}
        </label>
        <input
          id="position"
          name="position"
          defaultValue={profile.position ?? ""}
          className="input"
          placeholder={dict.settings.positionPlaceholder}
        />
      </div>

      <div>
        <label className="label">{dict.settings.role}</label>
        <input value={profile.role} disabled className="input capitalize opacity-60" />
      </div>

      {profile.report_role && (
        <div>
          <label className="label">{dict.users.reportRole}</label>
          <input
            value={profile.report_role === "observer" ? dict.users.roleObserver : dict.users.roleContractor}
            disabled
            className="input opacity-60"
          />
        </div>
      )}

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {dict.settings.saved}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? dict.common.saving : dict.common.save}
      </button>
    </form>
  );
}
