import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ViolationList } from "@/components/violations/violation-list";
import { Icon } from "@/components/ui/icon";
import type { ViolationType } from "@/lib/types";

export default async function ViolationsPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { dict } = await getServerDictionary();

  const supabase = await createClient();
  const { data } = await supabase
    .from("violation_types")
    .select("*")
    .order("created_at", { ascending: false });

  const violations = (data ?? []) as ViolationType[];

  return (
    <div>
      <PageHeader
        title={dict.violations.title}
        description={dict.violations.description}
        action={
          <Link href="/violations/new" className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            {dict.common.add}
          </Link>
        }
      />

      {violations.length === 0 ? (
        <EmptyState
          icon="warning"
          title={dict.violations.emptyTitle}
          description={dict.violations.emptyDescription}
          actionLabel={dict.violations.addViolation}
          actionHref="/violations/new"
        />
      ) : (
        <ViolationList violations={violations} dict={dict} />
      )}
    </div>
  );
}
