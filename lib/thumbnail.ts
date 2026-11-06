/** Browser-only: downscale an image data URL to a small JPEG blob. */
export async function toThumbnail(dataUrl: string, max = 256): Promise<Blob> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D canvas context.");
  ctx.fillStyle = "#fff"; // JPEG has no alpha; avoid black behind transparent PNGs
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("JPEG encode failed."))),
      "image/jpeg",
      0.7,
    ),
  );
}

/** Fire-and-forget: a missing thumbnail must never break the analysis UX. */
export function uploadThumbnail(analysisId: string, dataUrl: string): void {
  toThumbnail(dataUrl)
    .then((body) =>
      fetch(`/api/analyses/${analysisId}/thumbnail`, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body,
      }),
    )
    .then((res) => {
      if (!res.ok) console.warn("Thumbnail upload failed:", res.status);
    })
    .catch((err) => console.warn("Thumbnail upload failed:", err));
}
