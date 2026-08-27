import type { Dictionary } from "@/lib/i18n";

export function StepIndicator({ current, dict }: { current: number; dict: Dictionary }) {
  const steps = [dict.wizard.stepProject, dict.wizard.stepPhoto, dict.wizard.stepDetails];

  return (
    <div className="mb-6 flex items-center">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const active = stepNum === current;
        const done = stepNum < current;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-brand-600 text-white"
                    : active
                      ? "bg-brand-100 text-brand-700 ring-2 ring-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                {done ? "✓" : stepNum}
              </div>
              <span
                className={`text-[11px] ${
                  active
                    ? "font-semibold text-slate-900 dark:text-slate-100"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${done ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
