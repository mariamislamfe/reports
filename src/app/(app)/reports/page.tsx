import Link from "next/link";
import { getCurrentProfile, getReports } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportList } from "@/components/reports/report-list";
import { Icon } from "@/components/ui/icon";

export default async function ReportsPage() {
  const [reports, profile, { dict }] = await Promise.all([
    getReports(),
    getCurrentProfile(),
    getServerDictionary(),
  ]);

  const canCreate = profile?.role === "admin" || profile?.report_role === "observer";

  return (
    <div>
      <PageHeader
        title={dict.reports.title}
        description={dict.reports.description}
        action={
          canCreate && (
            <Link href="/reports/new" className="btn-primary">
              <Icon name="plus" className="h-4 w-4" />
              {dict.reports.new}
            </Link>
          )
        }
      />

      {reports.length === 0 ? (
        <EmptyState
          icon="doc"
          title={dict.reports.emptyTitle}
          description={dict.reports.emptyDescription}
          actionLabel={canCreate ? dict.dashboard.createReportAction : undefined}
          actionHref={canCreate ? "/reports/new" : undefined}
        />
      ) : (
        profile && <ReportList reports={reports} profile={profile} dict={dict} />
      )}
    </div>
  );
}
