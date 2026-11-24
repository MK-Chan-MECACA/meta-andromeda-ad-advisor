"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearIntakeDraft,
  loadIntakeDraft,
  saveIntakeDraft,
} from "@/lib/draft-storage";
import { emptyIntakeForm, type IntakeFormState } from "@/lib/types";

/** localStorage-backed intake draft with deferred hydrate (avoids sync setState-in-effect). */
export function useIntakeDraft() {
  const [form, setFormState] = useState<IntakeFormState>(emptyIntakeForm);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [imagesOmitted, setImagesOmitted] = useState(false);
  const [ready, setReady] = useState(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const draft = loadIntakeDraft();
      if (draft) {
        setFormState(draft.form);
        setSavedAt(draft.savedAt || null);
        setImagesOmitted(draft.imagesOmitted);
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const result = saveIntakeDraft(form);
      if (result.saved) {
        setSavedAt(new Date().toISOString());
        setImagesOmitted(result.imagesOmitted);
      } else {
        setSavedAt(null);
        setImagesOmitted(false);
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [form, ready]);

  const setForm = useCallback((next: IntakeFormState) => {
    setFormState(next);
  }, []);

  const clearDraft = useCallback(() => {
    skipNextSave.current = true;
    clearIntakeDraft();
    setFormState(emptyIntakeForm());
    setSavedAt(null);
    setImagesOmitted(false);
  }, []);

  return { form, setForm, savedAt, imagesOmitted, clearDraft, ready };
}
