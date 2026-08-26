"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "./actions";
import type { Dictionary } from "@/lib/i18n";

export function LoginForm({ redirectTo, dict }: { redirectTo?: string; dict: Dictionary }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signIn, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo || "/dashboard"} />

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
          autoComplete="current-password"
          required
          className="input"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? dict.auth.signingIn : dict.auth.signIn}
      </button>
    </form>
  );
}
