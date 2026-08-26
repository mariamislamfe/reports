"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteReport(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("reports")
    .select("photo_paths, contractor_photo_paths")
    .eq("id", id)
    .single();

  const { error, count } = await supabase
    .from("reports")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return { error: error.message };
  if (!count) return { error: "Not allowed." };

  const paths = [...(report?.photo_paths ?? []), ...(report?.contractor_photo_paths ?? [])];
  if (paths.length > 0) {
    await supabase.storage.from("violation-photos").remove(paths);
  }

  revalidatePath("/reports");
  return {};
}
