"use client";

import { useCallback, useId, useState } from "react";
import { Image as ImageIcon, Monitor, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const Icon = kind === "creative" ? ImageIcon : Monitor;

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          {label}
        </h3>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
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
        className={cn(
          "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
          dragOver ? "border-primary bg-primary/10" : "hover:border-ring/60 hover:bg-muted/40",
        )}
      >
        <Upload className="size-5 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium">
          Drop images or <span className="text-primary">browse</span>
        </span>
        <span className="max-w-xs text-xs leading-relaxed text-muted-foreground">{hint}</span>
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
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {ofKind.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {ofKind.map((img) => (
            <li key={img.id} className="group relative overflow-hidden rounded-md border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt={img.name} className="aspect-[4/5] w-full object-cover" />
              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                onClick={() => onRemove(img.id)}
                aria-label={`Remove ${img.name}`}
                className="absolute top-1.5 right-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                <X />
              </Button>
              <p className="truncate border-t bg-card px-2 py-1 text-xs text-muted-foreground">
                {img.name}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
