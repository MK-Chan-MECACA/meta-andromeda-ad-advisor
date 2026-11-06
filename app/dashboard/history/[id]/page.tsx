import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireWorkspace } from "@/lib/workspace";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { DeleteAnalysisButton } from "./DeleteAnalysisButton";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ws = await requireWorkspace();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [row] = await sql`
    select id, created_at, created_by, model, result
    from analyses where id = ${id}::uuid and workspace_id = ${ws.workspaceId}`;
  if (!row) notFound();
  const canDelete = ws.isAdmin || row.created_by === ws.userId;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-6 flex items-center gap-4 text-sm text-ink-300">
        <Link href="/dashboard/history" className="hover:text-ink-50">
          ← History
        </Link>
        <span>{new Date(row.created_at as string).toLocaleString("en-MY")}</span>
        <span className="font-code text-xs">{row.model as string}</span>
        {canDelete ? (
          <span className="ml-auto">
            <DeleteAnalysisButton id={id} />
          </span>
        ) : null}
      </div>
      <ResultsDashboard analysis={row.result as AnalysisResult} />
    </main>
  );
}
