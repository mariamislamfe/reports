import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectList } from "@/components/projects/project-list";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/lib/types";

export default async function ProjectsPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { dict } = await getServerDictionary();

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as Project[];

  return (
    <div>
      <PageHeader
        title={dict.projects.title}
        description={dict.projects.description}
        action={
          <Link href="/projects/new" className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            {dict.common.add}
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon="building"
          title={dict.projects.emptyTitle}
          description={dict.projects.emptyDescription}
          actionLabel={dict.projects.addProject}
          actionHref="/projects/new"
        />
      ) : (
        <ProjectList projects={projects} dict={dict} />
      )}
    </div>
  );
}
