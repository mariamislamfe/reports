import type { Dictionary } from "@/lib/i18n";
import type { ReportStatus } from "@/lib/types";

export function StatusBadge({ active, dict }: { active: boolean; dict: Dictionary }) {
  return (
    <span
      className={`badge ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {active ? dict.common.active : dict.common.inactive}
    </span>
  );
}

const STATUS_STYLE: Record<ReportStatus, string> = {
  pending_contractor: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending_closeout: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  closed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export function ReportStatusBadge({ status, dict }: { status: ReportStatus; dict: Dictionary }) {
  const label = {
    pending_contractor: dict.reports.statusPendingContractor,
    pending_closeout: dict.reports.statusPendingCloseout,
    closed: dict.reports.statusClosed,
  }[status];

  return <span className={`badge ${STATUS_STYLE[status]}`}>{label}</span>;
}
