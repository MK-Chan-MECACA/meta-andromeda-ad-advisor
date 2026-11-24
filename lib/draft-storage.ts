import {
  emptyIntakeForm,
  type ClientImage,
  type IntakeFormState,
} from "@/lib/types";

export const INTAKE_DRAFT_KEY = "andromeda.intake.draft.v1";

type StoredDraft = {
  savedAt: string;
  form: IntakeFormState;
  /** True when images were omitted to fit localStorage quota. */
  imagesOmitted?: boolean;
};

function isEmptyForm(form: IntakeFormState): boolean {
  const hasCopy = Object.values(form.copy).some((v) => v.trim());
  const hasSetup = Object.values(form.setup).some((v) => v.trim());
  const hasMetrics = Object.values(form.metrics).some((v) => v.trim());
  const hasSignals = Object.values(form.signals).some((v) => v.trim());
  return (
    !form.images.length &&
    !hasCopy &&
    !hasSetup &&
    !hasMetrics &&
    !hasSignals &&
    form.mode === "single"
  );
}

/** Persist intake; keep image payloads when possible, drop only on quota pressure. */
export function saveIntakeDraft(form: IntakeFormState): {
  saved: boolean;
  imagesOmitted: boolean;
} {
  if (isEmptyForm(form)) {
    clearIntakeDraft();
    return { saved: false, imagesOmitted: false };
  }

  try {
    const withImages: StoredDraft = {
      savedAt: new Date().toISOString(),
      form,
      imagesOmitted: false,
    };
    const full = JSON.stringify(withImages);
    try {
      localStorage.setItem(INTAKE_DRAFT_KEY, full);
      return { saved: true, imagesOmitted: false };
    } catch {
      /* quota — fall through without images */
    }

    const withoutImages: StoredDraft = {
      savedAt: new Date().toISOString(),
      form: { ...form, images: [] },
      imagesOmitted: form.images.length > 0,
    };
    localStorage.setItem(INTAKE_DRAFT_KEY, JSON.stringify(withoutImages));
    return { saved: true, imagesOmitted: form.images.length > 0 };
  } catch {
    return { saved: false, imagesOmitted: false };
  }
}

export function loadIntakeDraft(): {
  form: IntakeFormState;
  savedAt: string;
  imagesOmitted: boolean;
} | null {
  try {
    const raw = localStorage.getItem(INTAKE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (!parsed?.form || typeof parsed.form !== "object") return null;
    const form = mergeWithEmpty(parsed.form);
    if (isEmptyForm(form) && !parsed.imagesOmitted) return null;
    return {
      form,
      savedAt: parsed.savedAt ?? "",
      imagesOmitted: Boolean(parsed.imagesOmitted),
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
