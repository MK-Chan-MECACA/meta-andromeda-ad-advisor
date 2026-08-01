"use client";

import { useCallback, useId, useState } from "react";
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
        <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
          {label}
        </h3>
        <span className="text-xs text-ink-400">
          {ofKind.length} attached · {Math.max(remaining, 0)} slots left
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
          "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center transition",
          dragOver
            ? "border-meta bg-meta/10"
            : "border-ink-600 bg-ink-900/40 hover:border-ink-400 hover:bg-ink-900/70",
        ].join(" ")}
      >
        <span className="font-display text-base text-ink-50">Drop here</span>
        <span className="max-w-xs text-sm text-ink-300">{hint}</span>
        <span className="text-xs text-ink-500">or click to browse</span>
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

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {ofKind.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ofKind.map((img) => (
            <li key={img.id} className="group relative overflow-hidden bg-ink-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.dataUrl}
                alt={img.name}
                className="aspect-[4/5] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute top-2 right-2 bg-ink-950/80 px-2 py-1 text-xs text-ink-50 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
              >
                Remove
              </button>
              <p className="truncate px-2 py-1.5 text-xs text-ink-400">
                {img.name}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
