"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";

export function TranslatableTextarea({
  value,
  onChange,
  dict,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  dict: Dictionary;
  rows?: number;
  placeholder?: string;
}) {
  const [translating, setTranslating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function translate() {
    if (!value.trim()) return;
    setTranslating(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(res.status === 501 ? dict.wizard.translationNotConfigured : dict.wizard.translationError);
        return;
      }
      setPreview(data.translation);
    } catch {
      setError(dict.wizard.translationError);
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div>
      <textarea
        className="input"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <button
        type="button"
        onClick={translate}
        disabled={translating || !value.trim()}
        className="btn-ghost mt-1.5 px-2 py-1 text-xs"
      >
        <Icon name="globe" className="h-3.5 w-3.5" />
        {translating ? dict.wizard.translating : dict.wizard.translateToEnglish}
      </button>

      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}

      {preview && (
        <div className="mt-2 rounded-xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-900/20">
          <p className="mb-1 text-xs font-medium uppercase text-brand-700 dark:text-brand-400">
            {dict.wizard.translationPreview}
          </p>
          <p className="mb-2 text-sm text-slate-800 dark:text-slate-200">{preview}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(preview);
                setPreview(null);
              }}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              {dict.wizard.useTranslation}
            </button>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              {dict.wizard.dismissTranslation}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
