import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Project, Report, ViolationType } from "@/lib/types";

// Every page in the (app) layout tree calls this independently (layout, page,
// and any admin-guard checks). `cache()` dedupes those into a single Supabase
// round trip per request instead of one per caller.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data as Profile | null;
});

export async function getProjects(opts?: { includeInactive?: boolean }): Promise<Project[]> {
  const supabase = await createClient();
  let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (!opts?.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getViolationTypes(opts?: {
  includeInactive?: boolean;
}): Promise<ViolationType[]> {
  const supabase = await createClient();
  let query = supabase.from("violation_types").select("*").order("created_at", { ascending: false });
  if (!opts?.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ViolationType[];
}

export async function getReports(opts?: { limit?: number }): Promise<Report[]> {
  const supabase = await createClient();
  let query = supabase.from("reports").select("*").order("created_at", { ascending: false });
  if (opts?.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Report[];
}

export async function getReportById(id: string): Promise<Report | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("reports").select("*").eq("id", id).single();
  if (error) return null;
  return data as Report;
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const [{ count: projectCount }, { count: violationCount }, { count: reportCount }] =
    await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase
        .from("violation_types")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("reports").select("*", { count: "exact", head: true }),
    ]);

  return {
    projectCount: projectCount ?? 0,
    violationCount: violationCount ?? 0,
    reportCount: reportCount ?? 0,
  };
}

/** Recently used free-text values, for autocomplete suggestions (newest first, deduped). */
export async function getRecentObservationLocations(limit = 20): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("observation_location")
    .not("observation_location", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  const seen = new Set<string>();
  for (const row of data ?? []) {
    const value = (row as { observation_location: string | null }).observation_location;
    if (value) seen.add(value);
    if (seen.size >= limit) break;
  }
  return Array.from(seen);
}

export async function getSignedPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from("violation-photos").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export async function getSignedPhotoUrls(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const supabase = await createClient();
  const urls = await Promise.all(
    paths.map(async (path) => {
      const { data } = await supabase.storage.from("violation-photos").createSignedUrl(path, 60 * 60);
      return data?.signedUrl ?? null;
    })
  );
  return urls.filter((u): u is string => Boolean(u));
}

export async function getSignedSignatureUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from("signatures").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
