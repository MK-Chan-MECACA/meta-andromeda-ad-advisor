import {
  emptyIntakeForm,
  type ClientImage,
  type IntakeFormState,
} from "@/lib/types";

export const INTAKE_DRAFT_KEY = "andromeda.intake.draft.v1";

type StoredDraft = {
  savedAt: string;
  form: IntakeFormState;
};

/** Persist intake without huge base64 images if over ~1.5MB JSON. */
export function saveIntakeDraft(form: IntakeFormState): void {
  try {
    const slim: IntakeFormState = {
      ...form,
      images: form.images.map((img) => ({
        ...img,
        // Keep metadata; drop payload if oversized draft
        dataUrl: img.dataUrl.length > 200_000 ? "" : img.dataUrl,
      })),
    };
    const payload: StoredDraft = {
      savedAt: new Date().toISOString(),
      form: slim,
    };
    const json = JSON.stringify(payload);
    if (json.length > 1_500_000) {
      payload.form = { ...slim, images: [] };
    }
    localStorage.setItem(INTAKE_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function loadIntakeDraft(): {
  form: IntakeFormState;
  savedAt: string;
} | null {
  try {
    const raw = localStorage.getItem(INTAKE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (!parsed?.form || typeof parsed.form !== "object") return null;
    return {
      form: mergeWithEmpty(parsed.form),
      savedAt: parsed.savedAt ?? "",
    };
  } catch {
    return null;
  }
}

export function clearIntakeDraft(): void {
  try {
    localStorage.removeItem(INTAKE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function mergeWithEmpty(partial: Partial<IntakeFormState>): IntakeFormState {
  const base = emptyIntakeForm();
  const images = Array.isArray(partial.images)
    ? (partial.images as ClientImage[]).filter(
        (img) =>
          img &&
          typeof img.id === "string" &&
          (img.kind === "creative" || img.kind === "screenshot") &&
          typeof img.dataUrl === "string" &&
          img.dataUrl.startsWith("data:image/"),
      )
    : [];

  return {
    mode: partial.mode === "portfolio" ? "portfolio" : "single",
    images,
    copy: { ...base.copy, ...partial.copy },
    setup: { ...base.setup, ...partial.setup },
    metrics: { ...base.metrics, ...partial.metrics },
    signals: { ...base.signals, ...partial.signals },
  };
}
