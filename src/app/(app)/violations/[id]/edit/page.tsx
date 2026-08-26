import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { ViolationForm } from "@/components/violations/violation-form";
import { updateViolationType } from "../../actions";
import { Icon } from "@/components/ui/icon";
import type { ViolationType } from "@/lib/types";

export default async function EditViolationPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const { dict } = await getServerDictionary();
  const supabase = await createClient();
  const { data: violation } = await supabase
    .from("violation_types")
    .select("*")
    .eq("id", id)
    .single();

  if (!violation) notFound();

  const boundAction = updateViolationType.bind(null, id);

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/violations"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
      >
        <Icon name="chevronLeft" className="h-4 w-4 rtl:rotate-180" />
        {dict.violations.backToViolations}
      </Link>
      <div className="card">
        <h1 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          {dict.violations.editViolation}
        </h1>
        <ViolationForm violation={violation as ViolationType} action={boundAction} dict={dict} />
      </div>
    </div>
  );
}
