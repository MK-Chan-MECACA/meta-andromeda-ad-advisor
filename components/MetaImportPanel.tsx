"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import type { ClientImage, IntakeFormState } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Import from Meta
          <Badge
            variant="outline"
            title="Limited to Meta app testers until Meta App Review is approved."
          >
            Beta
          </Badge>
        </CardTitle>
        <CardDescription>
          {status?.connected
            ? `Connected${status.connectedBy ? ` by ${status.connectedBy}` : ""}${
                status.expiresAt
                  ? ` · expires ${new Date(status.expiresAt).toLocaleDateString()}`
                  : ""
              }`
            : "Pull a live ad's creative, setup and last-7-day metrics into the form."}
        </CardDescription>
        <CardAction className="flex gap-2">
          {/* Route handlers, not pages — <Link> client nav would break the OAuth redirect. */}
          {!status ? null : status.isAdmin ? (
            <>
              <Button asChild size="sm" variant={status.connected ? "outline" : "default"}>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/api/meta/login">{status.connected ? "Reconnect" : "Connect Meta"}</a>
              </Button>
              {status.connected ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" disabled={busy !== null}>
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect Meta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the Meta connection for everyone in this workspace.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => void disconnect()}>
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </>
          ) : !status.connected ? (
            <span className="text-xs text-muted-foreground">Ask a workspace admin to connect Meta.</span>
          ) : null}
        </CardAction>
      </CardHeader>

      {connected || error ? (
        <CardContent className="flex flex-col gap-4">
          {connected ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="meta-account">Ad account</Label>
              <Select
                value={accountId || undefined}
                onValueChange={(v) => void loadAds(v)}
                disabled={loadingAccounts}
              >
                <SelectTrigger id="meta-account" className="w-full sm:w-80">
                  <SelectValue placeholder={loadingAccounts ? "Loading accounts…" : "Select an account"} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} <span className="text-muted-foreground">({a.currency})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {busy === "ads" ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : null}

          {ads.length ? (
            <ul className="max-h-80 divide-y overflow-y-auto rounded-lg border">
              {ads.map((ad) => (
                <li key={ad.id} className="flex items-center gap-3 px-3 py-2">
                  {ad.creative?.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ad.creative.thumbnail_url}
                      alt=""
                      className="size-9 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="size-9 shrink-0 rounded-md bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ad.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[ad.campaign?.name, ad.adset?.name, ad.effective_status]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy !== null}
                    onClick={() => void importAd(ad)}
                  >
                    {busy === ad.id ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                    {busy === ad.id ? "Importing…" : "Import"}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}

          {connected && accountId && !ads.length && busy !== "ads" ? (
            <p className="text-sm text-muted-foreground">No ads in this account.</p>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
