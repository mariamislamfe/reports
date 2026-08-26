"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getServerDictionary } from "@/lib/i18n/server";

export interface AuthState {
  error?: string;
}

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/dashboard");
  const { dict } = await getServerDictionary();

  if (!email || !password) {
    return { error: dict.auth.fillFields };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: dict.auth.invalidCredentials };
  }

  redirect(redirectTo || "/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
