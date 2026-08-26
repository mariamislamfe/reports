"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";
import { MultiPhotoPicker } from "./multi-photo-picker";

export function PhotoStep({
  photos,
  onChange,
  onBack,
  onNext,
  dict,
}: {
  photos: File[];
  onChange: (files: File[]) => void;
  onBack: () => void;
  onNext: () => void;
  dict: Dictionary;
}) {
  const [busy, setBusy] = useState(false);

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
        {dict.wizard.photoTitle}
      </h2>

      <div className="card">
        <MultiPhotoPicker photos={photos} onChange={onChange} dict={dict} onBusyChange={setBusy} />
      </div>

      <button
        type="button"
        disabled={photos.length === 0 || busy}
        onClick={onNext}
        className="btn-primary mt-4 w-full"
      >
        {dict.common.continue}
      </button>
    </div>
  );
}
