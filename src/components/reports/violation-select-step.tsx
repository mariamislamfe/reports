import Link from "next/link";
import type { ViolationType } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";

export function ViolationSelectStep({
  violations,
  onSelect,
  onBack,
  dict,
}: {
  violations: ViolationType[];
  onSelect: (violation: ViolationType) => void;
  onBack: () => void;
  dict: Dictionary;
}) {
  if (violations.length === 0) {
    return (
      <EmptyState
        icon="warning"
        title={dict.wizard.noViolationsTitle}
        description={dict.wizard.noViolationsDescription}
        actionLabel={dict.violations.addViolation}
        actionHref="/violations/new"
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
      >
        <Icon name="chevronLeft" className="h-4 w-4 rtl:rotate-180" />
        {dict.common.back}
      </button>
      <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
        {dict.wizard.selectViolation}
      </h2>
      <div className="space-y-2">
        {violations.map((violation) => (
          <button
            key={violation.id}
            type="button"
            onClick={() => onSelect(violation)}
            className="card flex w-full items-center justify-between gap-3 text-left transition active:scale-[0.98] rtl:text-right"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {violation.name}
              </p>
              {violation.description && (
                <p className="line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                  {violation.description}
                </p>
              )}
            </div>
            <Icon
              name="chevronRight"
              className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600 rtl:rotate-180"
            />
          </button>
        ))}
      </div>
      <Link href="/violations/new" className="btn-ghost mt-3 w-full">
        <Icon name="plus" className="h-4 w-4" />
        {dict.wizard.addNewViolation}
      </Link>
    </div>
  );
}
