"use client";

import type { Profile, Project, ViolationType } from "@/lib/types";
import { HSE_FIELD_KEYS } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";
import { TranslatableTextarea } from "./translatable-textarea";

export interface DetailsValues {
  observationLocation: string;
  fieldValues: Record<string, string | number | boolean>;
  notes: string;
}

export function DetailsStep({
  project,
  violation,
  profile,
  values,
  onChange,
  onBack,
  onSubmit,
  submitting,
  error,
  recentLocations,
  dict,
}: {
  project: Project;
  violation: ViolationType;
  profile: Profile;
  values: DetailsValues;
  onChange: (values: DetailsValues) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  recentLocations: string[];
  dict: Dictionary;
}) {
  function setField(key: string, value: string | number | boolean) {
    onChange({ ...values, fieldValues: { ...values.fieldValues, [key]: value } });
  }

  const observationDescription = (values.fieldValues[HSE_FIELD_KEYS.OBSERVATION_DESCRIPTION] as string) ?? "";
  const immediateActions = (values.fieldValues[HSE_FIELD_KEYS.IMMEDIATE_ACTIONS] as string) ?? "";
  const furtherActions = (values.fieldValues[HSE_FIELD_KEYS.FURTHER_ACTIONS] as string) ?? "";
  const completionDate = (values.fieldValues[HSE_FIELD_KEYS.COMPLETION_DATE] as string) ?? "";

  const missingRequired =
    !values.observationLocation.trim() ||
    !observationDescription.trim() ||
    violation.fields
      .filter((f) => f.required)
      .some((f) => {
        const v = values.fieldValues[f.key];
        return v === undefined || v === null || v === "";
      });

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
        {dict.wizard.detailsTitle}
      </h2>

      <div className="card mb-4 space-y-1.5 text-sm">
        <InfoRow label={dict.wizard.infoProject} value={project.name} />
        <InfoRow label={dict.wizard.infoViolation} value={violation.name} />
        <InfoRow label={dict.wizard.infoReportedBy} value={profile.full_name} />
        <InfoRow label={dict.wizard.infoDate} value={new Date().toLocaleString()} />
      </div>

      <div className="card mb-4 space-y-4">
        <div>
          <label className="label">
            {dict.wizard.observationLocation} <span className="text-red-500">*</span>
          </label>
          <input
            className="input"
            list="observation-location-suggestions"
            value={values.observationLocation}
            onChange={(e) => onChange({ ...values, observationLocation: e.target.value })}
          />
          <datalist id="observation-location-suggestions">
            {recentLocations.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="label">
            {dict.wizard.observationDescription} <span className="text-red-500">*</span>
          </label>
          <TranslatableTextarea
            dict={dict}
            value={observationDescription}
            onChange={(v) => setField(HSE_FIELD_KEYS.OBSERVATION_DESCRIPTION, v)}
          />
        </div>

        <div>
          <label className="label">{dict.wizard.immediateActions}</label>
          <TranslatableTextarea
            dict={dict}
            value={immediateActions}
            onChange={(v) => setField(HSE_FIELD_KEYS.IMMEDIATE_ACTIONS, v)}
          />
        </div>

        <div>
          <label className="label">{dict.wizard.furtherActions}</label>
          <TranslatableTextarea
            dict={dict}
            value={furtherActions}
            onChange={(v) => setField(HSE_FIELD_KEYS.FURTHER_ACTIONS, v)}
          />
        </div>

        <div>
          <label className="label">{dict.wizard.completionDate}</label>
          <input
            type="date"
            className="input"
            value={completionDate}
            onChange={(e) => setField(HSE_FIELD_KEYS.COMPLETION_DATE, e.target.value)}
          />
        </div>
      </div>

      {violation.fields.length > 0 && (
        <div className="card mb-4 space-y-4">
          {violation.fields.map((field) => (
            <div key={field.key}>
              <label className="label">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  className="input"
                  rows={3}
                  placeholder={field.placeholder}
                  value={(values.fieldValues[field.key] as string) ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              ) : field.type === "select" ? (
                <select
                  className="input"
                  value={(values.fieldValues[field.key] as string) ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                >
                  <option value="" disabled>
                    …
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-brand-600"
                    checked={Boolean(values.fieldValues[field.key])}
                    onChange={(e) => setField(field.key, e.target.checked)}
                  />
                  {dict.common.yes}
                </label>
              ) : (
                <input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  className="input"
                  placeholder={field.placeholder}
                  value={(values.fieldValues[field.key] as string) ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card mb-4">
        <label className="label">{dict.wizard.additionalNotes}</label>
        <textarea
          className="input"
          rows={3}
          placeholder={dict.common.optional}
          value={values.notes}
          onChange={(e) => onChange({ ...values, notes: e.target.value })}
        />
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={missingRequired || submitting}
        onClick={onSubmit}
        className="btn-primary w-full"
      >
        {submitting ? dict.wizard.submitting : dict.wizard.generateReport}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="truncate font-medium text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}
