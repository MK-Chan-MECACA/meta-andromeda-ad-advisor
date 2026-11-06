"use client";

import { useEffect, useState } from "react";
import type { ClientImage, IntakeFormState } from "@/lib/types";

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
  adset?: { name?: string };
  campaign?: { name?: string; objective?: string };
};

type ImportResponse = Omit<IntakeFormState, "images"> & {
  image: string | null;
  name: string;
  id: string;
};

type MetaStatus = {
  connected: boolean;
  connectedBy: string | null;
  expiresAt: string | null;
  isAdmin: boolean;
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
  const [status, setStatus] = useState<MetaStatus | null>(null);
  const connected = status ? status.connected : null;
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [ads, setAds] = useState<AdRow[]>([]);
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
        const res = await fetch("/api/meta/status");
        const status = (await res.json()) as MetaStatus & { error?: string };
        if (cancelled) return;
        if (!res.ok) throw new Error(status.error);
        setStatus(status);
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
      } catch (err) {
        if (cancelled) return;
        setError(
          urlError ??
            (err instanceof Error && err.message ? err.message : "Could not reach Meta."),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally once-on-mount (restores the saved ad account).
  }, []);

  const loadingAccounts = connected === true && !accounts.length && !error;

  async function loadAds(id: string) {
    setAccountId(id);
    writeStoredAccountId(id);
    setAds([]);
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

  async function disconnect() {
    if (!confirm("Disconnect Meta for the whole workspace?")) return;
    setBusy("disconnect");
    setError(null);
    try {
      const res = await fetch("/api/meta/disconnect", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Disconnect failed.");
        return;
      }
      writeStoredAccountId("");
      setStatus((s) => s && { ...s, connected: false, connectedBy: null, expiresAt: null });
      setAccounts([]);
      setAccountId("");
      setAds([]);
    } catch {
      setError("Disconnect failed.");
    } finally {
      setBusy(null);
    }
  }

  async function importAd(ad: AdRow) {
    const currency =
      accounts.find((a) => a.id === accountId)?.currency ?? "";
    setBusy(ad.id);
    setError(null);
    try {
      const res = await fetch(
        `/api/meta/ad/${ad.id}?currency=${encodeURIComponent(currency)}`,
      );
      const data = (await res.json()) as ImportResponse & { error?: string };
      if (data.error) {
        setError(data.error);
        return;
      }

      const image: ClientImage[] = data.image
        ? [
            {
              id: `meta-${ad.id}`,
              kind: "creative",
              name: data.name,
              dataUrl: data.image,
            },
          ]
        : [];

      onChange({
        images: [
          ...form.images.filter((i) => !i.id.startsWith("meta-")),
          ...image,
        ].slice(0, 3),
        copy: data.copy,
        setup: data.setup,
        metrics: data.metrics,
        metaAdId: data.id,
      });
    } catch {
      setError("Import failed.");
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
          <h3 className="flex items-center gap-2 font-display text-sm tracking-wide text-ink-100 uppercase">
            Import from Meta
            <span
              className="border border-warn/50 px-1.5 py-0.5 text-[10px] tracking-widest text-warn"
              title="Limited to Meta app testers until Meta App Review is approved."
            >
              Beta
            </span>
          </h3>
          <p className="mt-1 text-xs text-ink-500">
            Pull a live ad&apos;s creative, setup, and last-7-day metrics
            straight into the form.
          </p>
          {status?.connected ? (
            <p className="mt-1 text-xs text-ink-400">
              Connected{status.connectedBy ? ` by ${status.connectedBy}` : ""}
              {status.expiresAt
                ? ` · expires ${new Date(status.expiresAt).toLocaleDateString()}`
                : ""}
            </p>
          ) : null}
        </div>

        {/* Route handlers, not pages — <Link> client nav would break the OAuth redirect. */}
        {/* eslint-disable @next/next/no-html-link-for-pages */}
        {!status ? null : status.isAdmin ? (
          <div className="flex gap-2">
            <a
              className={
                status.connected
                  ? btn
                  : "inline-flex items-center justify-center bg-meta px-5 py-2.5 font-display text-xs tracking-wide text-white uppercase transition hover:bg-meta-bright"
              }
              href="/api/meta/login"
            >
              {status.connected ? "Reconnect" : "Connect Meta"}
            </a>
            {status.connected ? (
              <button
                type="button"
                className={btn}
                disabled={busy !== null}
                onClick={() => void disconnect()}
              >
                Disconnect
              </button>
            ) : null}
          </div>
        ) : !status.connected ? (
          <p className="text-xs text-ink-400">Ask a workspace admin to connect Meta.</p>
        ) : null}
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
            <ul className="max-h-80 divide-y divide-ink-800 overflow-y-auto border border-ink-800">
              {ads.map((ad) => (
                <li
                  key={ad.id}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm"
                >
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
                      {[ad.campaign?.name, ad.adset?.name, ad.effective_status]
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
                    {busy === ad.id ? "Importing…" : "Import"}
                  </button>
                </li>
              ))}
            </ul>
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
