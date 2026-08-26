import Link from "next/link";
import { Icon } from "./icon";

export function EmptyState({
  icon = "doc",
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: "doc" | "building" | "warning" | "plus";
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-5">
          <Icon name="plus" className="h-4 w-4" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
