import Link from "next/link";
import { sql } from "@/lib/db";
import { requireWorkspace } from "@/lib/workspace";

const VERDICT_STYLE: Record<string, string> = {
  PASS: "text-emerald-400",
  AT_RISK: "text-amber-400",
  FAIL: "text-rose-400",
  UNKNOWN: "text-ink-300",
};

export default async function HistoryPage() {
  const ws = await requireWorkspace();
  const rows = await sql`
    select id, created_at, created_by, model, thumbnail_url,
           result->>'verdict' as verdict, result->>'bottomLine' as bottom_line,
           input->'copy'->>'headline' as headline
    from analyses where workspace_id = ${ws.workspaceId}
    order by created_at desc limit 100`;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-3xl tracking-tight">History</h1>
      {rows.length === 0 ? (
        <p className="mt-6 text-ink-300">
          No analyses yet.{" "}
          <Link href="/dashboard" className="text-meta-bright underline">
            Run your first one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-ink-800">
          {rows.map((r) => (
            <li key={r.id as string}>
              <Link
                href={`/dashboard/history/${r.id}`}
                className="flex items-center gap-4 py-4 hover:bg-ink-900/60"
              >
                {r.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/analyses/${r.id}/thumbnail`}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-ink-800" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink-50">
                    {(r.headline as string) || (r.bottom_line as string)}
                  </p>
                  <p className="text-xs text-ink-400">
                    {new Date(r.created_at as string).toLocaleString("en-MY")}
                    {r.created_by === ws.userId ? " · you" : ""}
                  </p>
                </div>
                <span
                  className={`font-display text-xs tracking-wider ${VERDICT_STYLE[r.verdict as string] ?? ""}`}
                >
                  {r.verdict as string}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
