"use client";

import { useEffect } from "react";
import { Download, X } from "lucide-react";

interface GeneratedImageModalProps {
  src: string;
  alt: string;
  fileName?: string;
  onClose: () => void;
}

export function GeneratedImageModal({
  src,
  alt,
  fileName,
  onClose,
}: GeneratedImageModalProps) {
  // Esc closes the modal — standard lightbox UX.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Pick a sensible filename + extension from the data URL's mime type.
  const inferredName =
    fileName ||
    (() => {
      const match = src.match(/^data:image\/([\w+.-]+);/);
      const ext = match ? match[1].split("+")[0] : "png";
      return `weavy-output-${Date.now()}.${ext}`;
    })();

  return (
    // Flex column so the toolbar takes its natural height and the image area
    // gets `flex-1` of the remaining space. With min-h-0 on the image area,
    // the <img> max-h-full clamps to the visible region — meaning a 768x1376
    // tall portrait fits without ever pushing the toolbar off-screen.
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Generated image preview"
    >
      {/* Dim/blur backdrop. Click anywhere on it to close. */}
      <button
        type="button"
        aria-label="Close preview"
        className="absolute inset-0 cursor-zoom-out bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Toolbar — top-right, always visible, can't be pushed off-screen. */}
      <div className="relative z-10 flex items-center justify-between gap-3 p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-white/60">
          Generated image
        </p>
        <div className="flex items-center gap-2">
          <a
            href={src}
            download={inferredName}
            className="group inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3.5 text-sm font-semibold text-gray-900 shadow-lg transition-colors hover:bg-gray-100"
          >
            <Download size={14} aria-hidden="true" />
            Download
          </a>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/20"
            aria-label="Close preview"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Image area takes the rest of the viewport. min-h-0 + max-h-full on
          the img is what lets it scale down on tall portrait images. */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}
