"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveSignature, setSignatureConsent, removeSignature } from "./actions";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function SignatureForm({
  userId,
  initialSignatureUrl,
  initialConsent,
  dict,
}: {
  userId: string;
  initialSignatureUrl: string | null;
  initialConsent: boolean;
  dict: Dictionary;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialSignatureUrl);
  const [consent, setConsent] = useState(initialConsent);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();
      const ext = file.type === "image/png" ? "png" : "jpg";
      const path = `${userId}/signature.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("signatures")
        .upload(path, file, { contentType: file.type, upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const result = await saveSignature(path, consent);
      if (result.error) {
        setError(result.error);
        return;
      }

      setPreviewUrl(URL.createObjectURL(file));
      setSaved(true);
    } finally {
      setUploading(false);
    }
  }

  async function toggleConsent(checked: boolean) {
    setConsent(checked);
    setSaved(false);
    const result = await setSignatureConsent(checked);
    if (result.error) setError(result.error);
    else setSaved(true);
  }

  async function handleRemove() {
    const result = await removeSignature();
    if (result.error) {
      setError(result.error);
      return;
    }
    setPreviewUrl(null);
    setConsent(false);
  }

  return (
    <div>
      <label className="label">{dict.settings.signatureTitle}</label>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{dict.settings.signatureHint}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {previewUrl ? (
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Signature" className="mx-auto h-20 object-contain" />
        </div>
      ) : (
        <div className="mb-3 flex h-20 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
          <Icon name="edit" className="me-2 h-4 w-4" />
          {dict.settings.noSignatureYet}
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary flex-1"
        >
          {uploading
            ? dict.settings.uploading
            : previewUrl
              ? dict.settings.replaceSignature
              : dict.settings.uploadSignature}
        </button>
        {previewUrl && (
          <ConfirmButton
            label={dict.settings.removeSignature}
            icon="trash"
            confirmLabel={dict.projects.deleteConfirm}
            onConfirm={handleRemove}
            dict={dict}
          />
        )}
      </div>

      {previewUrl && (
        <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => toggleConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600"
          />
          {dict.settings.consentLabel}
        </label>
      )}

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {dict.settings.signatureSaved}
        </p>
      )}
    </div>
  );
}
