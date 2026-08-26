import Link from "next/link";
import { getCurrentProfile, getDashboardStats, getReports } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { Icon } from "@/components/ui/icon";
import { ReportStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Dictionary } from "@/lib/i18n";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";
  const { dict } = await getServerDictionary();

  const [stats, recentReports] = await Promise.all([
    getDashboardStats(),
    getReports({ limit: 5 }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">{dict.dashboard.welcomeBack}</p>
        <h1 className="text-xl font-bold text-slate-900 md:text-2xl dark:text-slate-100">
          {profile?.full_name}
        </h1>
      </div>

      <Link
        href="/reports/new"
        className="mb-6 flex items-center justify-between rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-md transition active:scale-[0.98]"
      >
        <div>
          <p className="font-semibold">{dict.dashboard.createReportCta}</p>
          <p className="text-sm text-brand-100">{dict.dashboard.createReportSubtitle}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Icon name="chevronRight" className="h-5 w-5 rtl:rotate-180" />
        </div>
      </Link>

      {isAdmin && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard label={dict.dashboard.projectsLabel} value={stats.projectCount} href="/projects" />
          <StatCard label={dict.dashboard.violationsLabel} value={stats.violationCount} href="/violations" />
          <StatCard label={dict.dashboard.reportsLabel} value={stats.reportCount} href="/reports" />
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {isAdmin ? dict.dashboard.recentReports : dict.dashboard.yourRecentReports}
        </h2>
        <Link href="/reports" className="text-sm font-medium text-brand-600">
          {dict.dashboard.viewAll}
        </Link>
      </div>

      {recentReports.length === 0 ? (
        <EmptyState
          icon="doc"
          title={dict.dashboard.noReportsTitle}
          description={dict.dashboard.noReportsDescription}
          actionLabel={dict.dashboard.createReportAction}
          actionHref="/reports/new"
        />
      ) : (
        <div className="space-y-2">
          {recentReports.map((r) => (
            <Link
              key={r.id}
              href={`/reports/${r.id}`}
              className="card flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {r.violation_snapshot.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {r.project_snapshot.name} · {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <ReportStatusBadge status={r.status} dict={dict} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card text-center">
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </Link>
  );
}
