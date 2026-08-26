"use client";

import { useActionState } from "react";
import { signUp, type SignUpState } from "./actions";
import type { Dictionary } from "@/lib/i18n";

export function SignUpForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(signUp, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="label">
          {dict.auth.fullName}
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          className="input"
        />
      </div>

      <div>
        <label htmlFor="email" className="label">
          {dict.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          {dict.auth.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="confirm_password" className="label">
          {dict.auth.confirmPassword}
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="input"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? dict.auth.creatingAccount : dict.auth.createAccount}
      </button>
    </form>
  );
}
