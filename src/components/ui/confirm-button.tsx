"use client";

import { useState } from "react";
import { Icon } from "./icon";
import type { Dictionary } from "@/lib/i18n";

export function ConfirmButton({
  onConfirm,
  label,
  confirmLabel,
  variant = "danger",
  icon,
  dict,
}: {
  onConfirm: () => void | Promise<void>;
  label: string;
  confirmLabel: string;
  variant?: "danger" | "secondary";
  icon?: "trash" | "check";
  dict: Dictionary;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">{confirmLabel}</span>
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            await onConfirm();
            setPending(false);
            setConfirming(false);
          }}
          className="btn-danger px-3 py-1.5 text-xs"
        >
          {pending ? "…" : dict.common.yes}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          {dict.common.cancel}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={variant === "danger" ? "btn-danger px-3 py-1.5 text-xs" : "btn-secondary px-3 py-1.5 text-xs"}
    >
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
