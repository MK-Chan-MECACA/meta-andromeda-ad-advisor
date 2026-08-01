"use client";

import { useCallback, useId, useState } from "react";
import { IconImage, IconMonitor, IconX } from "@/components/Icons";
import type { ClientImage, ImageKind } from "@/lib/types";
import { MAX_IMAGE_BYTES } from "@/lib/analysis-schema";

type Props = {
  kind: ImageKind;
  label: string;
  hint: string;
  images: ClientImage[];
  onAdd: (images: ClientImage[]) => void;
  onRemove: (id: string) => void;
  maxCount: number;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ImageDropzone({
  kind,
  label,
  hint,
  images,
  onAdd,
  onRemove,
  maxCount,
}: Props) {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ofKind = images.filter((img) => img.kind === kind);
  const remaining = maxCount - images.length;
  const Icon = kind === "creative" ? IconImage : IconMonitor;

  const ingestFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      const files = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (!files.length) {
        setError("Drop image files only (PNG, JPG, WEBP).");
        return;
      }
      if (remaining <= 0) {
        setError("Maximum 3 images total.");
        return;
      }

      const accepted: ClientImage[] = [];
      for (const file of files.slice(0, remaining)) {
        if (file.size > MAX_IMAGE_BYTES) {
          setError(`${file.name} exceeds 4MB.`);
          continue;
        }
        const dataUrl = await readFileAsDataUrl(file);
        accepted.push({
          id: `${kind}-${crypto.randomUUID()}`,
          kind,
          name: file.name,
          dataUrl,
        });
      }
      if (accepted.length) onAdd(accepted);
    },
    [kind, onAdd, remaining],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm tracking-wide text-ink-100 uppercase">
          <Icon className="h-4 w-4 text-meta-bright" aria-hidden />
          {label}
        </h3>
        <span className="font-display text-xs text-ink-400 tabular-nums">
          {ofKind.length} attached · {Math.max(remaining, 0)} left
        </span>
      </div>

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void ingestFiles(e.dataTransfer.files);
        }}
        className={[
          "group flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-8 text-center transition duration-200",
          dragOver
            ? "border-meta bg-meta/15 shadow-[0_0_32px_rgba(37,99,235,0.2)]"
            : "border-ink-600 bg-ink-950/50 hover:border-meta/40 hover:bg-ink-900/60",
        ].join(" ")}
      >
        <span
          className={[
            "flex h-12 w-12 items-center justify-center rounded-xl transition duration-200",
            dragOver
              ? "bg-meta/25 text-meta-bright"
              : "bg-ink-800 text-ink-300 group-hover:bg-meta/15 group-hover:text-meta-bright",
          ].join(" ")}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <span className="font-display text-base text-ink-50">
          Drop images here
        </span>
        <span className="max-w-xs text-sm leading-relaxed text-ink-300">
          {hint}
        </span>
        <span className="rounded-full border border-ink-600 px-3 py-1 text-xs text-ink-400 transition group-hover:border-ink-400 group-hover:text-ink-200">
          or click to browse
        </span>
        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void ingestFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      {ofKind.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ofKind.map((img) => (
            <li
              key={img.id}
              className="group relative overflow-hidden rounded-xl border border-ink-700 bg-ink-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.dataUrl}
                alt={img.name}
                className="aspect-[4/5] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                aria-label={`Remove ${img.name}`}
                className="absolute top-2 right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-ink-950/85 text-ink-50 opacity-100 transition duration-200 hover:bg-danger/90 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <IconX className="h-4 w-4" aria-hidden />
              </button>
              <p className="truncate px-2.5 py-2 text-xs text-ink-400">
                {img.name}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
