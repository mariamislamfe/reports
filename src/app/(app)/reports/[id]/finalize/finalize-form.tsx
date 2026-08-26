"use client";

import { useState } from "react";
import { submitFinalize } from "./actions";
import type { Dictionary } from "@/lib/i18n";

export function FinalizeForm({ reportId, dict }: { reportId: string; dict: Dictionary }) {
  const [comments, setComments] = useState(dict.finalize.defaultComment);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitFinalize(reportId, comments);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="card mb-4">
        <label className="label">{dict.finalize.comments}</label>
        <textarea
          className="input"
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      <button type="button" disabled={submitting} onClick={handleSubmit} className="btn-primary w-full">
        {submitting ? dict.wizard.submitting : dict.finalize.submit}
      </button>
    </div>
  );
}
