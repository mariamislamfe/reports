import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getProjects,
  getViolationTypes,
  getRecentObservationLocations,
} from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { ReportWizard } from "@/components/reports/report-wizard";

export default async function NewReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, projects, violations, recentLocations, { dict }] = await Promise.all([
    getCurrentProfile(),
    getProjects(),
    getViolationTypes(),
    getRecentObservationLocations(),
    getServerDictionary(),
  ]);

  if (!profile) redirect("/login");
  if (profile.role !== "admin" && profile.report_role !== "observer") redirect("/reports");

  return (
    <ReportWizard
      projects={projects}
      violations={violations}
      profile={profile}
      userId={user.id}
      recentLocations={recentLocations}
      dict={dict}
    />
  );
}
