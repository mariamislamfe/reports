import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { ProjectForm } from "@/components/projects/project-form";
import { updateProject } from "../../actions";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/lib/types";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const { dict } = await getServerDictionary();
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();

  if (!project) notFound();

  const boundAction = updateProject.bind(null, id);

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
      >
        <Icon name="chevronLeft" className="h-4 w-4 rtl:rotate-180" />
        {dict.projects.backToProjects}
      </Link>
      <div className="card">
        <h1 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          {dict.projects.editProject}
        </h1>
        <ProjectForm project={project as Project} action={boundAction} dict={dict} />
      </div>
    </div>
  );
}
