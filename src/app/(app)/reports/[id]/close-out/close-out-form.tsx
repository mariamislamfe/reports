"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitCloseOut } from "./actions";
import { TranslatableTextarea } from "@/components/reports/translatable-textarea";
import { MultiPhotoPicker } from "@/components/reports/multi-photo-picker";
import type { Dictionary } from "@/lib/i18n";

export function CloseOutForm({
  reportId,
  userId,
  dict,
}: {
  reportId: string;
  userId: string;
  dict: Dictionary;
}) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosBusy, setPhotosBusy] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (photos.length === 0 || !description.trim() || photosBusy) return;
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const photoPaths: string[] = [];

      for (const photo of photos) {
        const ext = photo.type === "image/png" ? "png" : "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("violation-photos")
          .upload(path, photo, { contentType: photo.type, upsert: false });

        if (uploadError) {
          setError(dict.wizard.uploadError);
          setSubmitting(false);
          return;
        }
        photoPaths.push(path);
      }

      const result = await submitCloseOut({ reportId, description, photoPaths });
      if (result?.error) {
        setError(result.error);
        setSubmitting(false);
      }
    } catch {
      setError(dict.wizard.genericError);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="card mb-4">
        <label className="label mb-2 block">{dict.closeOut.afterPhoto}</label>
        <MultiPhotoPicker
          photos={photos}
          onChange={setPhotos}
          dict={dict}
          onBusyChange={setPhotosBusy}
        />
      </div>

      <div className="card mb-4">
        <label className="label">
          {dict.closeOut.descriptionsAndEvidence} <span className="text-red-500">*</span>
        </label>
        <TranslatableTextarea
          dict={dict}
          value={description}
          onChange={setDescription}
          placeholder={dict.closeOut.descriptionsPlaceholder}
        />
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={photos.length === 0 || !description.trim() || submitting || photosBusy}
        onClick={handleSubmit}
        className="btn-primary w-full"
      >
        {submitting ? dict.wizard.submitting : dict.closeOut.submit}
      </button>
    </div>
  );
}
