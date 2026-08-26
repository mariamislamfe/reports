"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Project, ViolationType } from "@/lib/types";

export interface CreateReportInput {
  projectId: string;
  violationTypeId: string;
  photoPaths: string[];
  observationLocation: string;
  fieldValues: Record<string, string | number | boolean>;
  notes: string;
}

export interface CreateReportResult {
  error?: string;
  reportId?: string;
}

export async function createReport(input: CreateReportInput): Promise<CreateReportResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const [{ data: project }, { data: violation }, { data: profile }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", input.projectId).single(),
    supabase.from("violation_types").select("*").eq("id", input.violationTypeId).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  if (!project) return { error: "Selected project could not be found." };
  if (!violation) return { error: "Selected violation type could not be found." };

  const typedProject = project as Project;
  const typedViolation = violation as ViolationType;

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      project_id: typedProject.id,
      project_snapshot: {
        name: typedProject.name,
        code: typedProject.code,
        location: typedProject.location,
        business_unit: typedProject.business_unit,
        contractor: typedProject.contractor,
        sup_consultant: typedProject.sup_consultant,
      },
      violation_type_id: typedViolation.id,
      violation_snapshot: {
        name: typedViolation.name,
        description: typedViolation.description,
        fields: typedViolation.fields,
      },
      employee_id: user.id,
      employee_snapshot: {
        full_name: profile?.full_name ?? user.email ?? "Unknown",
        position: profile?.position ?? null,
        signature_path: profile?.signature_consent ? (profile?.signature_path ?? null) : null,
      },
      photo_path: input.photoPaths[0] ?? null,
      photo_paths: input.photoPaths,
      observation_location: input.observationLocation || null,
      field_values: input.fieldValues,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/reports/${report.id}?created=1`);
}
