"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const draft = loadIntakeDraft();
      if (draft) {
        setFormState(draft.form);
        setSavedAt(draft.savedAt || null);
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => {
      saveIntakeDraft(form);
      setSavedAt(new Date().toISOString());
    }, 400);
    return () => window.clearTimeout(t);
  }, [form, ready]);

  const setForm = useCallback((next: IntakeFormState) => {
    setFormState(next);
  }, []);

  const clearDraft = useCallback(() => {
    clearIntakeDraft();
    setFormState(emptyIntakeForm());
    setSavedAt(null);
  }, []);

  return { form, setForm, savedAt, clearDraft, ready };
}
