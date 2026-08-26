"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";

const CameraCapture = dynamic(() => import("./camera-capture").then((m) => m.CameraCapture), {
  ssr: false,
});

interface PhotoEntry {
  file: File;
  previewUrl: string;
}

export function MultiPhotoPicker({
  photos,
  onChange,
  dict,
  hint,
  onBusyChange,
}: {
  photos: File[];
  onChange: (files: File[]) => void;
  dict: Dictionary;
  hint?: string;
  /** Fires whenever a photo starts/finishes compressing, so callers can block
   *  navigation (e.g. "Continue"/"Submit") until every in-flight photo lands —
   *  otherwise a photo added right before advancing can be silently dropped. */
  onBusyChange?: (busy: boolean) => void;
}) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  // Lazy initializer: URL.createObjectURL is browser-only, so guard against a
  // server render ever reaching this with a non-empty `photos` prop (it never
  // does today, but nothing here should depend on that staying true).
  const [entries, setEntries] = useState<PhotoEntry[]>(() =>
    typeof window === "undefined"
      ? []
      : photos.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
  );
  const [compressing, setCompressing] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Revoke every blob URL still on screen when the picker itself unmounts
  // (e.g. navigating away mid-flow). Per-photo revocation on removal happens
  // in removeAt below.
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  useEffect(() => {
    return () => {
      entriesRef.current.forEach((e) => URL.revokeObjectURL(e.previewUrl));
    };
  }, []);

  // Functional updates only — several photos can be compressing concurrently
  // (multi-select from the gallery), so appending off a stale `entries`
  // closure would silently drop all but the last one to resolve.
  function addEntry(entry: PhotoEntry) {
    setEntries((prev) => {
      const next = [...prev, entry];
      onChange(next.map((e) => e.file));
      return next;
    });
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setCompressing((n) => {
      if (n === 0) onBusyChange?.(true);
      return n + 1;
    });
    try {
      const { default: imageCompression } = await import("browser-image-compression");
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      const asFile = new File([compressed], file.name, { type: compressed.type });
      addEntry({ file: asFile, previewUrl: URL.createObjectURL(asFile) });
    } catch {
      addEntry({ file, previewUrl: URL.createObjectURL(file) });
    } finally {
      setCompressing((n) => {
        if (n === 1) onBusyChange?.(false);
        return n - 1;
      });
    }
  }

  function removeAt(index: number) {
    setEntries((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const next = prev.filter((_, i) => i !== index);
      onChange(next.map((e) => e.file));
      return next;
    });
  }

  function openCamera() {
    const supported =
      typeof navigator !== "undefined" && "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices;
    if (supported) setCameraOpen(true);
    else cameraInputRef.current?.click();
  }

  return (
    <div>
      {cameraOpen && (
        <CameraCapture
          dict={dict}
          onClose={() => setCameraOpen(false)}
          onCapture={(file) => {
            setCameraOpen(false);
            handleFile(file);
          }}
        />
      )}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          Array.from(e.target.files ?? []).forEach(handleFile);
          e.target.value = "";
        }}
      />

      {entries.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {entries.map((entry, i) => (
            <div
              key={entry.previewUrl}
              className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.previewUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={dict.wizard.removePhoto}
                className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center py-4 text-center">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {compressing > 0
            ? dict.wizard.processingPhoto
            : entries.length > 0
              ? dict.wizard.addAnotherPhoto
              : (hint ?? dict.wizard.photoHint)}
        </p>
        <button
          type="button"
          disabled={compressing > 0}
          onClick={openCamera}
          className="btn-primary w-full"
        >
          <Icon name="camera" className="h-4 w-4" />
          {dict.wizard.openCamera}
        </button>
        <button
          type="button"
          disabled={compressing > 0}
          onClick={() => libraryInputRef.current?.click()}
          className="btn-ghost mt-2 w-full"
        >
          {dict.wizard.chooseExisting}
        </button>
      </div>
    </div>
  );
}
