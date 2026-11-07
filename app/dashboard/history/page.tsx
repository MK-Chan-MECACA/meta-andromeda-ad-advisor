import Link from "next/link";
import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { requireWorkspace } from "@/lib/workspace";
import { History } from "lucide-react";
import { VerdictBadge } from "@/components/VerdictBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function HistoryPage() {
  const ws = await requireWorkspace();
  const rows = await sql`
    select id, created_at, created_by, model, thumbnail_url,
           result->>'verdict' as verdict, result->>'bottomLine' as bottom_line,
           input->'copy'->>'headline' as headline
    from analyses where workspace_id = ${ws.workspaceId}
    order by created_at desc limit 100`;

  // Author display names (deleted users fall back to "former member").
  const ids = [...new Set(rows.map((r) => r.created_by as string).filter(Boolean))];
  const users = ids.length
    ? (await (await clerkClient()).users.getUserList({ userId: ids, limit: 100 })).data
    : [];
  const authorName = (id: string | null) => {
    if (!id) return "former member";
    if (id === ws.userId) return "you";
    const u = users.find((x) => x.id === id);
    return u?.fullName || u?.primaryEmailAddress?.emailAddress || "member";
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length
              ? `${rows.length} ${rows.length === 1 ? "analysis" : "analyses"} in this workspace${rows.length === 100 ? " (latest 100)" : ""}.`
              : "Analyses run in this workspace appear here."}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard">New analysis</Link>
        </Button>
      </header>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <History className="size-8 text-muted-foreground" aria-hidden />
            <div>
              <p className="font-medium">No analyses yet</p>
              <p className="text-sm text-muted-foreground">Run your first one to see it here.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">Run an analysis</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 pl-4">
                  <span className="sr-only">Creative</span>
                </TableHead>
                <TableHead>Ad</TableHead>
                <TableHead className="w-32">Verdict</TableHead>
                <TableHead className="hidden w-40 md:table-cell">Run by</TableHead>
                <TableHead className="w-44 pr-4 text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const href = `/dashboard/history/${r.id}`;
                return (
                  <TableRow key={r.id as string} className="relative">
                    <TableCell className="pl-4">
                      {r.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/analyses/${r.id}/thumbnail`}
                          alt=""
                          className="size-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-md bg-muted" aria-hidden />
                      )}
                    </TableCell>
                    <TableCell className="max-w-0">
                      {/* Stretched link: the whole row is clickable. */}
                      <Link
                        href={href}
                        className="block truncate font-medium after:absolute after:inset-0"
                      >
                        {(r.headline as string) || (r.bottom_line as string)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <VerdictBadge verdict={r.verdict as string} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {authorName(r.created_by as string | null)}
                    </TableCell>
                    <TableCell className="pr-4 text-right font-mono text-xs text-muted-foreground tabular-nums">
                      {new Date(r.created_at as string).toLocaleString("en-MY", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </main>
  );
}
