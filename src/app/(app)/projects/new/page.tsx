import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { ProjectForm } from "@/components/projects/project-form";
import { createProject } from "../actions";
import { Icon } from "@/components/ui/icon";

export default async function NewProjectPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { dict } = await getServerDictionary();

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
          {dict.projects.newProject}
        </h1>
        <ProjectForm action={createProject} dict={dict} />
      </div>
    </div>
  );
}
