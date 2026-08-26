"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";

export function CameraCapture({
  onCapture,
  onClose,
  dict,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
  dict: Dictionary;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setReady(true);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleClose() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-white">
          {ready ? "" : error ? "" : dict.wizard.cameraStarting}
        </span>
        <button
          type="button"
          onClick={handleClose}
          aria-label={dict.wizard.cameraCancel}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <Icon name="x" className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <div className="mx-6 max-w-xs text-center text-sm text-white/80">
            {dict.wizard.cameraError}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-contain"
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-6 px-4 py-6">
        {error ? (
          <button type="button" onClick={handleClose} className="btn-secondary">
            {dict.wizard.cameraCancel}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 hover:text-white"
            >
              {dict.wizard.cameraCancel}
            </button>
            <button
              type="button"
              disabled={!ready}
              onClick={capture}
              aria-label={dict.wizard.cameraCapture}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 disabled:opacity-40"
            >
              <span className="h-12 w-12 rounded-full bg-white" />
            </button>
            <span className="w-16" />
          </>
        )}
      </div>
    </div>
  );
}
