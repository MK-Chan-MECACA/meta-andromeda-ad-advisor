import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireWorkspace, isUuid } from "@/lib/workspace";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { DeleteAnalysisButton } from "./DeleteAnalysisButton";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ws = await requireWorkspace();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [row] = await sql`
    select id, created_at, created_by, model, result, thumbnail_url
    from analyses where id = ${id}::uuid and workspace_id = ${ws.workspaceId}`;
  if (!row) notFound();
  const canDelete = ws.isAdmin || row.created_by === ws.userId;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/dashboard/history">
            <ArrowLeft data-icon="inline-start" />
            History
          </Link>
        </Button>
        <header className="flex flex-wrap items-center gap-4">
          {row.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/analyses/${id}/thumbnail`}
              alt=""
              className="size-12 rounded-md border object-cover"
            />
          ) : null}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Analysis</h1>
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {new Date(row.created_at as string).toLocaleString("en-MY", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              <Badge variant="outline" className="font-mono">
                {row.model as string}
              </Badge>
            </p>
          </div>
          {canDelete ? (
            <div className="ml-auto">
              <DeleteAnalysisButton id={id} />
            </div>
          ) : null}
        </header>
      </div>
      <ResultsDashboard analysis={row.result as AnalysisResult} />
    </main>
  );
}
