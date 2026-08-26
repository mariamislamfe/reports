"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getServerDictionary } from "@/lib/i18n/server";

export interface SignUpState {
  error?: string;
  message?: string;
}

export async function signUp(_prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  const { dict } = await getServerDictionary();

  if (!fullName || !email || !password) {
    return { error: dict.auth.fillAllFields };
  }
  if (password.length < 6) {
    return { error: dict.auth.passwordTooShort };
  }
  if (password !== confirmPassword) {
    return { error: dict.auth.passwordsNoMatch };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return { message: dict.auth.confirmEmailMessage };
  }

  redirect("/dashboard");
}
