"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClientImage, IntakeFormState } from "@/lib/types";
import {
  MAX_CREATIVE_IMAGES,
  MAX_SCREENSHOT_IMAGES,
} from "@/lib/analysis-schema";

type AdAccount = {
  id: string;
  name: string;
  currency: string;
  account_status: number;
};

type AdRow = {
  id: string;
  name: string;
  effective_status: string;
  creative?: { thumbnail_url?: string };
  adset?: { id?: string; name?: string };
  campaign?: { id?: string; name?: string; objective?: string };
};

/** Screenshots capped; creatives replaced by imports when present (never exceed creative cap). */
function composeImages(
  existing: ClientImage[],
  importedCreatives: ClientImage[],
): ClientImage[] {
  const screenshots = existing
    .filter((i) => i.kind === "screenshot")
    .slice(0, MAX_SCREENSHOT_IMAGES);
  const imported = importedCreatives
    .filter((i) => i.kind === "creative" && i.dataUrl)
    .slice(0, MAX_CREATIVE_IMAGES);
  // Empty import (no downloadable image) must not wipe existing creatives.
  const creatives = imported.length
    ? imported
    : existing
        .filter((i) => i.kind === "creative")
        .slice(0, MAX_CREATIVE_IMAGES);
  return [...screenshots, ...creatives];
}

/** Prefer existing operator-entered signal values over blank Meta defaults. */
function mergeSignals(
  existing: IntakeFormState["signals"],
  incoming?: IntakeFormState["signals"],
): IntakeFormState["signals"] {
  if (!incoming) return existing;
  const next = { ...existing };
  for (const key of Object.keys(incoming) as (keyof typeof incoming)[]) {
    const value = incoming[key];
    if (typeof value === "string" && value.trim()) {
      next[key] = value;
    }
  }
  return next;
}

type ImportResponse = Omit<IntakeFormState, "images"> & {
  image: string | null;
  name: string;
};

const btn =
  "inline-flex items-center justify-center border border-ink-700 px-4 py-2 font-display text-xs tracking-wide uppercase transition hover:border-meta hover:text-meta-bright disabled:cursor-not-allowed disabled:opacity-50";

const ACCOUNT_STORAGE_KEY = "andromeda.meta.accountId";

function readStoredAccountId() {
  try {
    return localStorage.getItem(ACCOUNT_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeStoredAccountId(id: string) {
  try {
    if (id) localStorage.setItem(ACCOUNT_STORAGE_KEY, id);
    else localStorage.removeItem(ACCOUNT_STORAGE_KEY);
  } catch {
    /* private mode / blocked storage */
  }
}

export function MetaImportPanel({
  form,
  onChange,
}: {
  form: IntakeFormState;
  onChange: (next: IntakeFormState) => void;
}) {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [ads, setAds] = useState<AdRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("meta_error");
      if (urlError || params.get("meta") === "connected") {
        const clean = new URL(window.location.href);
        clean.searchParams.delete("meta_error");
        clean.searchParams.delete("meta");
        window.history.replaceState({}, "", clean.pathname);
      }
      try {
        const status = (await (await fetch("/api/meta/status")).json()) as {
          connected: boolean;
        };
        if (cancelled) return;
        setConnected(status.connected);
        if (urlError) setError(urlError);
        if (!status.connected) {
          writeStoredAccountId("");
          return;
        }

        const data = (await (await fetch("/api/meta/accounts")).json()) as {
          accounts?: AdAccount[];
          error?: string;
        };
        if (cancelled) return;
        if (data.error) setError(data.error);
        const list = data.accounts ?? [];
        setAccounts(list);

        const saved = readStoredAccountId();
        const restore =
          saved && list.some((a) => a.id === saved)
            ? saved
            : list.length === 1
              ? list[0].id
              : "";
        if (restore) await loadAds(restore);
      } catch {
        if (cancelled) return;
        setConnected(false);
        setError(urlError ?? "Could not reach Meta.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadingAccounts = connected === true && !accounts.length && !error;

  const adsByAdSet = useMemo(() => {
    const map = new Map<
      string,
      { id: string; label: string; ads: AdRow[] }
    >();
    for (const ad of ads) {
      const id = ad.adset?.id || `ungrouped-${ad.campaign?.id ?? "none"}`;
      const label = [
        ad.adset?.name || "Ungrouped",
        ad.campaign?.name ? `· ${ad.campaign.name}` : "",
      ]
        .filter(Boolean)
        .join(" ");
      const entry = map.get(id) ?? { id, label, ads: [] };
      entry.ads.push(ad);
      map.set(id, entry);
    }
    return [...map.values()];
  }, [ads]);

  async function loadAds(id: string) {
    setAccountId(id);
    writeStoredAccountId(id);
    setAds([]);
    setSelected(new Set());
    if (!id) return;
    setBusy("ads");
    setError(null);
    try {
      const res = await fetch(
        `/api/meta/ads?account_id=${encodeURIComponent(id)}`,
      );
      const data = (await res.json()) as { ads?: AdRow[]; error?: string };
      if (data.error) setError(data.error);
      setAds(data.ads ?? []);
    } catch {
      setError("Could not load ads.");
    } finally {
      setBusy(null);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_CREATIVE_IMAGES) next.add(id);
      return next;
    });
  }

  function selectAdSet(adsetId: string) {
    const ids = (adsByAdSet.find((g) => g.id === adsetId)?.ads ?? []).map(
      (a) => a.id,
    );
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (next.size >= MAX_CREATIVE_IMAGES) break;
        next.add(id);
      }
      return next;
    });
  }

  async function fetchImport(adId: string, currency: string) {
    const res = await fetch(
      `/api/meta/ad/${adId}?currency=${encodeURIComponent(currency)}`,
    );
    return (await res.json()) as ImportResponse & { error?: string };
  }

  async function importAd(ad: AdRow) {
    const currency =
      accounts.find((a) => a.id === accountId)?.currency ?? "";
    setBusy(ad.id);
    setError(null);
    try {
      const data = await fetchImport(ad.id, currency);
      if (data.error) {
        setError(data.error);
        return;
      }

      const imported: ClientImage[] = data.image
        ? [
            {
              id: `meta-${ad.id}`,
              kind: "creative",
              name: data.name,
              dataUrl: data.image,
            },
          ]
        : [];

      const nextImages = composeImages(form.images, imported);
      const creativeCount = nextImages.filter((i) => i.kind === "creative").length;
      // One-ad import without a downloadable image must not force single mode
      // when existing multi-creative intake is preserved.
      const nextMode =
        creativeCount > 1
          ? "portfolio"
          : imported.length > 0
            ? "single"
            : form.mode;

      onChange({
        mode: nextMode,
        images: nextImages,
        copy: data.copy,
        setup: { ...data.setup, portfolioNotes: data.setup.portfolioNotes ?? "" },
        metrics: data.metrics,
        signals: mergeSignals(form.signals, data.signals),
      });
    } catch {
      setError("Import failed.");
    } finally {
      setBusy(null);
    }
  }

  async function importSelected() {
    if (!selected.size) return;
    const currency =
      accounts.find((a) => a.id === accountId)?.currency ?? "";
    const ids = [...selected].slice(0, MAX_CREATIVE_IMAGES);
    setBusy("portfolio");
    setError(null);

    try {
      const results: Array<{
        ad: AdRow;
        data: ImportResponse;
      }> = [];

      for (const id of ids) {
        const ad = ads.find((a) => a.id === id);
        if (!ad) continue;
        const data = await fetchImport(id, currency);
        if (data.error) {
          setError(data.error);
          return;
        }
        results.push({ ad, data });
      }

      if (!results.length) {
        setError("Nothing imported.");
        return;
      }

      const primary = results[0].data;
      const images: ClientImage[] = results
        .filter((r) => r.data.image)
        .map((r) => ({
          id: `meta-${r.ad.id}`,
          kind: "creative" as const,
          name: r.data.name,
          dataUrl: r.data.image as string,
        }));

      const portfolioNotes = results
        .map((r, i) => {
          const bits = [
            r.data.copy.headline,
            r.data.copy.cta,
            r.ad.adset?.name,
          ].filter(Boolean);
          return `Ad ${i + 1} (${r.data.name}): ${bits.join(" · ") || "imported"}`;
        })
        .join("\n");

      onChange({
        mode: results.length > 1 ? "portfolio" : "single",
        images: composeImages(form.images, images),
        copy: primary.copy,
        setup: {
          ...primary.setup,
          adsInAdSet: String(results.length),
          portfolioNotes,
        },
        metrics: {
          ...primary.metrics,
          notes: [
            `Portfolio import: ${results.map((r) => r.data.name).join(", ")}`,
            primary.metrics.notes,
          ]
            .filter(Boolean)
            .join(" · "),
        },
        signals: mergeSignals(form.signals, primary.signals),
      });
      setSelected(new Set());
    } catch {
      setError("Portfolio import failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section
      className="border border-ink-700/80 bg-ink-950/40 p-5"
      aria-label="Meta import"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm tracking-wide text-ink-100 uppercase">
            Import from Meta
          </h3>
          <p className="mt-1 text-xs text-ink-500">
            Pull one ad, or multi-select up to {MAX_CREATIVE_IMAGES} creatives
            from an ad set for portfolio diversity scoring.
          </p>
        </div>

        {/* Route handlers, not pages — <Link> client nav would break the OAuth redirect. */}
        {/* eslint-disable @next/next/no-html-link-for-pages */}
        {connected === null ? null : connected ? (
          <a
            className={btn}
            href="/api/meta/logout"
            onClick={() => writeStoredAccountId("")}
          >
            Disconnect
          </a>
        ) : (
          <a
            className="inline-flex items-center justify-center bg-meta px-5 py-2.5 font-display text-xs tracking-wide text-white uppercase transition hover:bg-meta-bright"
            href="/api/meta/login"
          >
            Connect Meta
          </a>
        )}
        {/* eslint-enable @next/next/no-html-link-for-pages */}
      </div>

      {connected ? (
        <div className="mt-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs tracking-wide text-ink-400 uppercase">
              Ad account
            </span>
            <select
              className="w-full border border-ink-700 bg-ink-950/60 px-3 py-2.5 text-sm text-ink-50 outline-none focus:border-meta"
              value={accountId}
              onChange={(e) => void loadAds(e.target.value)}
              disabled={loadingAccounts}
            >
              <option value="">
                {loadingAccounts ? "Loading accounts…" : "Select…"}
              </option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </label>

          {busy === "ads" ? (
            <p className="text-sm text-ink-400">Loading ads…</p>
          ) : null}

          {ads.length ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-ink-400">
                  {selected.size} selected · max {MAX_CREATIVE_IMAGES}
                </p>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center justify-center bg-accent px-4 py-2 font-display text-xs tracking-wide text-white uppercase transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={selected.size === 0 || busy !== null}
                  onClick={() => void importSelected()}
                >
                  {busy === "portfolio"
                    ? "Importing portfolio…"
                    : `Import selected (${selected.size})`}
                </button>
              </div>

              <div className="max-h-96 space-y-4 overflow-y-auto border border-ink-800 p-3">
                {adsByAdSet.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-[11px] tracking-wide text-ink-400 uppercase">
                        Ad set · {group.label}
                      </p>
                      <button
                        type="button"
                        className={btn}
                        disabled={busy !== null}
                        onClick={() => selectAdSet(group.id)}
                      >
                        Select ad set
                      </button>
                    </div>
                    <ul className="divide-y divide-ink-800 border border-ink-800">
                      {group.ads.map((ad) => (
                        <li
                          key={ad.id}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer accent-meta"
                            checked={selected.has(ad.id)}
                            onChange={() => toggleSelect(ad.id)}
                            aria-label={`Select ${ad.name}`}
                            disabled={
                              busy !== null ||
                              (!selected.has(ad.id) &&
                                selected.size >= MAX_CREATIVE_IMAGES)
                            }
                          />
                          {ad.creative?.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ad.creative.thumbnail_url}
                              alt=""
                              className="h-10 w-10 shrink-0 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 shrink-0 bg-ink-800" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-ink-100">{ad.name}</p>
                            <p className="truncate text-xs text-ink-500">
                              {[
                                ad.campaign?.name,
                                ad.effective_status,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={btn}
                            disabled={busy !== null}
                            onClick={() => void importAd(ad)}
                          >
                            {busy === ad.id ? "Importing…" : "Import one"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {accountId && !ads.length && busy !== "ads" ? (
            <p className="text-sm text-ink-500">No ads in this account.</p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </section>
  );
}
