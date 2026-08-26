"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerDictionary } from "@/lib/i18n/server";

export interface ProjectFormState {
  error?: string;
}

function readProjectFields(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    code: String(formData.get("code") || "").trim() || null,
    location: String(formData.get("location") || "").trim() || null,
    business_unit: String(formData.get("business_unit") || "").trim() || null,
    contractor: String(formData.get("contractor") || "").trim() || null,
    sup_consultant: String(formData.get("sup_consultant") || "").trim() || null,
  };
}

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const fields = readProjectFields(formData);

  if (!fields.name) {
    const { dict } = await getServerDictionary();
    return { error: dict.projects.nameRequired };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("projects")
    .insert({ ...fields, created_by: user?.id });

  if (error) return { error: error.message };

  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProject(
  id: string,
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const fields = readProjectFields(formData);

  if (!fields.name) {
    const { dict } = await getServerDictionary();
    return { error: dict.projects.nameRequired };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/projects");
  redirect("/projects");
}

export async function setProjectActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("projects").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/projects");
}
