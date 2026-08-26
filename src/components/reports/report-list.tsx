"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Profile, Report, ReportStatus } from "@/lib/types";
import { HSE_FIELD_KEYS } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";
import { ReportStatusBadge } from "@/components/ui/status-badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { formatDateTime, isDeadlineUrgent } from "@/lib/utils";
import { deleteReport } from "@/app/(app)/reports/actions";

function needsAction(report: Report, profile: Profile): boolean {
  if (profile.role === "admin") return false;
  if (report.status === "pending_contractor" && profile.report_role === "contractor") return true;
  if (report.status === "pending_closeout" && profile.report_role === "observer") return true;
  return false;
}

const SECTION_ORDER: ReportStatus[] = ["pending_contractor", "pending_closeout", "closed"];

export function ReportList({
  reports,
  profile,
  dict,
}: {
  reports: Report[];
  profile: Profile;
  dict: Dictionary;
}) {
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

    return reports.filter((r) => {
      const matchesTerm =
        !term ||
        r.project_snapshot.name.toLowerCase().includes(term) ||
        r.violation_snapshot.name.toLowerCase().includes(term) ||
        r.employee_snapshot.full_name.toLowerCase().includes(term) ||
        r.report_number.toLowerCase().includes(term);

      const createdAt = new Date(r.created_at);
      const matchesFrom = !from || createdAt >= from;
      const matchesTo = !to || createdAt <= to;

      return matchesTerm && matchesFrom && matchesTo;
    });
  }, [reports, q, dateFrom, dateTo]);

  const hasFilters = q || dateFrom || dateTo;

  const sectionLabel: Record<ReportStatus, string> = {
    pending_contractor: dict.reports.sectionPendingContractor,
    pending_closeout: dict.reports.sectionPendingObserver,
    closed: dict.reports.sectionClosed,
  };

  return (
    <div>
      <div className="relative mb-3">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ltr:left-3 rtl:right-3"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.reports.searchPlaceholder}
          className="input ltr:pl-10 rtl:pr-10"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            {dict.reports.dateFrom}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input py-2 text-sm"
          />
        </div>
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            {dict.reports.dateTo}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input py-2 text-sm"
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setDateFrom("");
              setDateTo("");
            }}
            className="btn-ghost px-3 py-2 text-xs"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
            {dict.reports.clearFilters}
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {dict.reports.noSearchResults}
        </p>
      )}

      {SECTION_ORDER.map((status) => {
        const group = filtered.filter((r) => r.status === status);
        if (group.length === 0) return null;
        return (
          <div key={status} className="mb-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {sectionLabel[status]}
              <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {group.length}
              </span>
            </p>
            <div className="space-y-2">
              {group.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  dict={dict}
                  highlighted={needsAction(r, profile)}
                  canDelete={profile.role === "admin"}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportCard({
  report: r,
  dict,
  highlighted,
  canDelete,
}: {
  report: Report;
  dict: Dictionary;
  highlighted?: boolean;
  canDelete?: boolean;
}) {
  const completionDate = r.field_values[HSE_FIELD_KEYS.COMPLETION_DATE] as string | undefined;
  const urgent = r.status !== "closed" && isDeadlineUrgent(completionDate);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={`card ${highlighted ? "ring-2 ring-brand-500" : ""}`}>
      <Link href={`/reports/${r.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {r.violation_snapshot.name}
            </p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {r.project_snapshot.name}
            </p>
          </div>
          <ReportStatusBadge status={r.status} dict={dict} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>{r.employee_snapshot.full_name}</span>
          <span>{formatDateTime(r.created_at)}</span>
        </div>
        {completionDate && (
          <div
            className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
              urgent
                ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            <Icon name="warning" className="h-3.5 w-3.5" />
            {dict.reports.deadline}: {completionDate}
          </div>
        )}
      </Link>

      {canDelete && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="ms-auto">
            <ConfirmButton
              label={dict.common.delete}
              icon="trash"
              confirmLabel={dict.reports.deleteConfirm}
              onConfirm={async () => {
                setError(null);
                const result = await deleteReport(r.id);
                if (result.error) setError(result.error);
              }}
              dict={dict}
            />
          </div>
        </div>
      )}
    </div>
  );
}
