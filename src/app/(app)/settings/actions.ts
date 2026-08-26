"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getServerDictionary } from "@/lib/i18n/server";

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const position = String(formData.get("position") || "").trim() || null;
  if (!fullName) {
    const { dict } = await getServerDictionary();
    return { error: dict.settings.nameEmpty };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, position })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export interface SignatureState {
  error?: string;
  success?: boolean;
}

/** Called after the signature image has already been uploaded client-side. */
export async function saveSignature(path: string, consent: boolean): Promise<SignatureState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired." };

  const { error } = await supabase
    .from("profiles")
    .update({ signature_path: path, signature_consent: consent })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function setSignatureConsent(consent: boolean): Promise<SignatureState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired." };

  const { error } = await supabase
    .from("profiles")
    .update({ signature_consent: consent })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function removeSignature(): Promise<SignatureState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("signature_path")
    .eq("id", user.id)
    .single();

  if (profile?.signature_path) {
    await supabase.storage.from("signatures").remove([profile.signature_path]);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ signature_path: null, signature_consent: false })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}
