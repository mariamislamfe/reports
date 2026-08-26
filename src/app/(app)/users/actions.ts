"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ReportRole } from "@/lib/types";

export interface SetReportRoleResult {
  error?: string;
}

export async function setReportRole(
  userId: string,
  role: ReportRole | null
): Promise<SetReportRoleResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ report_role: role }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/users");
  return {};
}
