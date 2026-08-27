import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile, getReportById } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { Icon } from "@/components/ui/icon";
import { FinalizeForm } from "./finalize-form";

export default async function FinalizePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [report, profile, { dict }] = await Promise.all([
    getReportById(id),
    getCurrentProfile(),
    getServerDictionary(),
  ]);

  if (!report) notFound();
  if (!profile) redirect("/login");

  const canAct =
    profile.role === "admin" ||
    (profile.report_role === "observer" && report.employee_id === profile.id);
  if (!canAct || report.status !== "pending_closeout") redirect(`/reports/${id}`);

  return (
    <div className="mx-auto max-w-md">
      <Link
        href={`/reports/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
      >
        <Icon name="chevronLeft" className="h-4 w-4 rtl:rotate-180" />
        {dict.common.back}
      </Link>

      <div className="mb-4">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{dict.finalize.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{dict.finalize.description}</p>
      </div>

      <FinalizeForm reportId={id} dict={dict} />
    </div>
  );
}
