"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerDictionary } from "@/lib/i18n/server";
import type { ViolationFieldDef } from "@/lib/types";

export interface ViolationFormState {
  error?: string;
}

function parseFields(raw: string): ViolationFieldDef[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((f) => f && typeof f.key === "string" && f.key.length > 0);
  } catch {
    return [];
  }
}

export async function createViolationType(
  _prev: ViolationFormState,
  formData: FormData
): Promise<ViolationFormState> {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const fields = parseFields(String(formData.get("fields") || "[]"));

  if (!name) {
    const { dict } = await getServerDictionary();
    return { error: dict.violations.nameRequired };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("violation_types")
    .insert({ name, description, fields, created_by: user?.id });

  if (error) return { error: error.message };

  revalidatePath("/violations");
  redirect("/violations");
}

export async function updateViolationType(
  id: string,
  _prev: ViolationFormState,
  formData: FormData
): Promise<ViolationFormState> {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const fields = parseFields(String(formData.get("fields") || "[]"));

  if (!name) {
    const { dict } = await getServerDictionary();
    return { error: dict.violations.nameRequired };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("violation_types")
    .update({ name, description, fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/violations");
  redirect("/violations");
}

export async function setViolationActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("violation_types").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/violations");
}

export async function deleteViolationType(id: string) {
  const supabase = await createClient();
  await supabase.from("violation_types").delete().eq("id", id);
  revalidatePath("/violations");
}
