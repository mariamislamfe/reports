"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface SubmitCloseOutInput {
  reportId: string;
  description: string;
  photoPaths: string[];
}

export interface SubmitCloseOutResult {
  error?: string;
}

export async function submitCloseOut(input: SubmitCloseOutInput): Promise<SubmitCloseOutResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { error } = await supabase
    .from("reports")
    .update({
      status: "pending_closeout",
      contractor_description: input.description,
      contractor_photo_path: input.photoPaths[0] ?? null,
      contractor_photo_paths: input.photoPaths,
      contractor_snapshot: {
        full_name: profile?.full_name ?? user.email ?? "Unknown",
        position: profile?.position ?? null,
        signature_path: profile?.signature_consent ? (profile?.signature_path ?? null) : null,
      },
      contractor_submitted_at: new Date().toISOString(),
    })
    .eq("id", input.reportId);

  if (error) return { error: error.message };

  redirect(`/reports/${input.reportId}?closeoutSubmitted=1`);
}
