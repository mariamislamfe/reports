import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile, getReportById, getSignedPhotoUrls } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { Icon } from "@/components/ui/icon";
import { ReportStatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, effectivePhotoPaths, isDeadlineUrgent } from "@/lib/utils";
import { HSE_FIELD_KEYS } from "@/lib/types";

export default async function ReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; closeoutSubmitted?: string; closed?: string }>;
}) {
  const { id } = await params;
  const { created, closeoutSubmitted, closed } = await searchParams;

  const [report, profile, { dict }] = await Promise.all([
    getReportById(id),
    getCurrentProfile(),
    getServerDictionary(),
  ]);
  if (!report) notFound();

  const [photoUrls, contractorPhotoUrls] = await Promise.all([
    getSignedPhotoUrls(effectivePhotoPaths(report.photo_paths, report.photo_path)),
    getSignedPhotoUrls(effectivePhotoPaths(report.contractor_photo_paths, report.contractor_photo_path)),
  ]);

  const canActAsContractor = profile?.role === "admin" || profile?.report_role === "contractor";
  const canActAsObserver = profile?.role === "admin" || profile?.report_role === "observer";

  const observationDescription = report.field_values[HSE_FIELD_KEYS.OBSERVATION_DESCRIPTION];
  const immediateActions = report.field_values[HSE_FIELD_KEYS.IMMEDIATE_ACTIONS];
  const furtherActions = report.field_values[HSE_FIELD_KEYS.FURTHER_ACTIONS];
  const completionDate = report.field_values[HSE_FIELD_KEYS.COMPLETION_DATE];
  const deadlineUrgent = report.status !== "closed" && isDeadlineUrgent(completionDate as string | undefined);
  const extraFields = report.violation_snapshot.fields.filter(
    (f) => !(Object.values(HSE_FIELD_KEYS) as string[]).includes(f.key)
  );

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/reports"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
      >
        <Icon name="chevronLeft" className="h-4 w-4 rtl:rotate-180" />
        {dict.reports.backToReports}
      </Link>

      {created && <Banner text={dict.reports.submittedSuccess} />}
      {closeoutSubmitted && <Banner text={dict.closeOut.success} />}
      {closed && <Banner text={dict.finalize.success} />}

      <div className="card mb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">{report.report_number}</p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {report.violation_snapshot.name}
            </h1>
          </div>
          <ReportStatusBadge status={report.status} dict={dict} />
        </div>

        <div className="space-y-1.5 text-sm">
          <InfoRow label={dict.wizard.infoProject} value={report.project_snapshot.name} />
          {report.observation_location && (
            <InfoRow label={dict.wizard.observationLocation} value={report.observation_location} />
          )}
          <InfoRow label={dict.reports.reportedBy} value={report.employee_snapshot.full_name} />
          <InfoRow label={dict.reports.date} value={formatDateTime(report.created_at)} />
        </div>
      </div>

      {/* Stage 1 — Observation */}
      <PhotoGallery urls={photoUrls} />

      <div className="card mb-4 space-y-3">
        {observationDescription && (
          <TextBlock label={dict.wizard.observationDescription} value={String(observationDescription)} />
        )}
        {immediateActions && (
          <TextBlock label={dict.wizard.immediateActions} value={String(immediateActions)} />
        )}
        {furtherActions && <TextBlock label={dict.wizard.furtherActions} value={String(furtherActions)} />}
        {completionDate && (
          <InfoRow
            label={dict.wizard.completionDate}
            value={String(completionDate)}
            urgent={deadlineUrgent}
          />
        )}
      </div>

      {extraFields.length > 0 && (
        <div className="card mb-4 space-y-2">
          {extraFields.map((field) => (
            <div
              key={field.key}
              className="flex justify-between gap-3 border-b border-slate-100 pb-2 text-sm last:border-0 last:pb-0 dark:border-slate-800"
            >
              <span className="text-slate-500 dark:text-slate-400">{field.label}</span>
              <span className="text-right font-medium text-slate-900 dark:text-slate-100">
                {String(report.field_values[field.key] ?? "—")}
              </span>
            </div>
          ))}
        </div>
      )}

      {report.notes && (
        <div className="card mb-4">
          <p className="mb-1 text-xs font-medium uppercase text-slate-400 dark:text-slate-500">
            {dict.reports.notes}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{report.notes}</p>
        </div>
      )}

      {/* Stage 2 — Contractor close-out */}
      {report.contractor_description && (
        <div className="card mb-4">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            {dict.closeOut.title}
          </p>
          <PhotoGallery urls={contractorPhotoUrls} />
          <TextBlock label={dict.closeOut.descriptionsAndEvidence} value={report.contractor_description} />
          {report.contractor_snapshot && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              {report.contractor_snapshot.full_name}
              {report.contractor_snapshot.position ? ` · ${report.contractor_snapshot.position}` : ""}
              {report.contractor_submitted_at ? ` · ${formatDateTime(report.contractor_submitted_at)}` : ""}
            </p>
          )}
        </div>
      )}

      {/* Stage 3 — Final close-out */}
      {report.closeout_comments && (
        <div className="card mb-4">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            {dict.finalize.title}
          </p>
          <TextBlock label={dict.finalize.comments} value={report.closeout_comments} />
          {report.closeout_snapshot && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              {report.closeout_snapshot.full_name}
              {report.closeout_snapshot.position ? ` · ${report.closeout_snapshot.position}` : ""}
              {report.closeout_submitted_at ? ` · ${formatDateTime(report.closeout_submitted_at)}` : ""}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <a
          href={`/api/reports/${report.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex-1"
        >
          <Icon name="download" className="h-4 w-4" />
          {dict.reports.viewDownloadPdf}
        </a>
        {report.status === "pending_contractor" && canActAsContractor && (
          <Link href={`/reports/${report.id}/close-out`} className="btn-secondary flex-1">
            {dict.closeOut.title}
          </Link>
        )}
        {report.status === "pending_closeout" && canActAsObserver && (
          <Link href={`/reports/${report.id}/finalize`} className="btn-secondary flex-1">
            {dict.finalize.title}
          </Link>
        )}
      </div>
    </div>
  );
}

function Banner({ text }: { text: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <Icon name="check" className="h-4 w-4" />
      {text}
    </div>
  );
}

function PhotoGallery({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="card mb-4 grid grid-cols-2 gap-2">
      {urls.map((url) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img key={url} src={url} alt="" className="aspect-square w-full rounded-xl object-cover" />
      ))}
    </div>
  );
}

function InfoRow({ label, value, urgent }: { label: string; value: string; urgent?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={`truncate font-medium ${
          urgent ? "font-bold text-red-600 dark:text-red-400" : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {value}
        {urgent && " ⚠"}
      </span>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  );
}
