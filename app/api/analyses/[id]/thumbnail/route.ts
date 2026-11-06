import { get, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { handle, httpError, requireWorkspace, isUuid } from "@/lib/workspace";

const MAX_BYTES = 200 * 1024;

type Ctx = { params: Promise<{ id: string }> };

async function analysisId(ctx: Ctx): Promise<string> {
  const { id } = await ctx.params;
  if (!isUuid(id)) throw httpError(404, "Analysis not found.");
  return id;
}

/** Body: raw JPEG bytes (client-resized). Creator or admin only. */
export const POST = handle(async (req: Request, ctx: Ctx) => {
  const ws = await requireWorkspace();
  const id = await analysisId(ctx);
  const [row] = await sql`
    select id from analyses
    where id = ${id}::uuid and workspace_id = ${ws.workspaceId}
      and (${ws.isAdmin} or created_by = ${ws.userId})`;
  if (!row) throw httpError(404, "Analysis not found.");

  // ponytail: whole body buffered before the size check; fine at Vercel's 4.5MB request cap.
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.length > MAX_BYTES) throw httpError(413, "Thumbnail too large.");
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    throw httpError(415, "Thumbnail must be a JPEG.");
  }

  // Prefix is relied on by the workspace-deletion webhook.
  const { pathname } = await put(
    `workspaces/${ws.workspaceId}/analyses/${id}.jpg`,
    Buffer.from(bytes),
    { access: "private", contentType: "image/jpeg", allowOverwrite: true },
  );
  await sql`
    update analyses set thumbnail_url = ${pathname}
    where id = ${id}::uuid and workspace_id = ${ws.workspaceId}`;
  return NextResponse.json({ thumbnail_url: pathname });
});

/** Streams the private blob to any member of the owning workspace. */
export const GET = handle(async (_req: Request, ctx: Ctx) => {
  const ws = await requireWorkspace();
  const id = await analysisId(ctx);
  const [row] = await sql`
    select thumbnail_url from analyses
    where id = ${id}::uuid and workspace_id = ${ws.workspaceId}`;
  if (!row?.thumbnail_url) throw httpError(404, "No thumbnail.");

  const blob = await get(row.thumbnail_url as string, { access: "private" });
  if (!blob || blob.statusCode !== 200) throw httpError(404, "No thumbnail.");
  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
});
