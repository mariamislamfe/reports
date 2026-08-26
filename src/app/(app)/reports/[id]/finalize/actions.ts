"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface SubmitFinalizeResult {
  error?: string;
}

export async function submitFinalize(
  reportId: string,
  comments: string
): Promise<SubmitFinalizeResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { error } = await supabase
    .from("reports")
    .update({
      status: "closed",
      closeout_comments: comments,
      closeout_snapshot: {
        full_name: profile?.full_name ?? user.email ?? "Unknown",
        position: profile?.position ?? null,
        signature_path: profile?.signature_consent ? (profile?.signature_path ?? null) : null,
      },
      closeout_submitted_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) return { error: error.message };

  redirect(`/reports/${reportId}?closed=1`);
}
