"use client";

import { useState } from "react";
import type { FieldType, ViolationFieldDef } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { slugify } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export function FieldBuilder({
  initialFields,
  dict,
}: {
  initialFields: ViolationFieldDef[];
  dict: Dictionary;
}) {
  const [fields, setFields] = useState<ViolationFieldDef[]>(initialFields);

  const FIELD_TYPES: { value: FieldType; label: string }[] = [
    { value: "text", label: dict.violations.fieldTypeText },
    { value: "textarea", label: dict.violations.fieldTypeTextarea },
    { value: "number", label: dict.violations.fieldTypeNumber },
    { value: "date", label: dict.violations.fieldTypeDate },
    { value: "select", label: dict.violations.fieldTypeSelect },
    { value: "checkbox", label: dict.violations.fieldTypeCheckbox },
  ];

  function addField() {
    setFields((prev) => [...prev, { key: "", label: "", type: "text", required: true }]);
  }

  function updateField(index: number, patch: Partial<ViolationFieldDef>) {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== index) return f;
        const next = { ...f, ...patch };
        if (patch.label !== undefined && (!f.key || f.key === slugify(f.label))) {
          next.key = slugify(patch.label);
        }
        return next;
      })
    );
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function moveField(index: number, dir: -1 | 1) {
    setFields((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div>
      <input type="hidden" name="fields" value={JSON.stringify(fields)} />

      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{dict.violations.fieldBuilderTitle}</label>
        <button type="button" onClick={addField} className="btn-ghost px-2 py-1 text-xs">
          <Icon name="plus" className="h-3.5 w-3.5" />
          {dict.violations.addField}
        </button>
      </div>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        {dict.violations.fieldBuilderHint}
      </p>

      {fields.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
          {dict.violations.noFields}
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={index} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <input
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder={dict.violations.fieldLabelPlaceholder}
                className="input min-w-[10rem] flex-1 py-2"
              />
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => moveField(index, -1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveField(index, 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  aria-label="Remove field"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                className="input w-auto py-2 text-sm"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                {dict.violations.fieldRequiredLabel}
              </label>

              <span className="text-xs text-slate-400 dark:text-slate-500">
                {dict.violations.fieldKeyLabel}: {field.key || "—"}
              </span>
            </div>

            {field.type === "select" && (
              <input
                value={field.options?.join(", ") ?? ""}
                onChange={(e) =>
                  updateField(index, {
                    options: e.target.value
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={dict.violations.optionsPlaceholder}
                className="input mt-2 py-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
