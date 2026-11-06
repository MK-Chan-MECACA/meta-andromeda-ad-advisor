import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { handle, httpError, isUuid, requireWorkspace } from "@/lib/workspace";

/** Members delete their own analyses; admins delete any in the workspace. */
export const DELETE = handle(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const ws = await requireWorkspace();
    const { id } = await ctx.params;
    if (!isUuid(id)) throw httpError(404, "Analysis not found.");
    const rows = await sql`
      delete from analyses
      where id = ${id}::uuid and workspace_id = ${ws.workspaceId}
        and (${ws.isAdmin} or created_by = ${ws.userId})
      returning id, thumbnail_url`;
    if (!rows[0]) throw httpError(404, "Analysis not found.");
    if (rows[0].thumbnail_url) {
      // Row is already gone; an orphan blob is swept by the workspace-deletion webhook.
      await del(rows[0].thumbnail_url as string).catch((err) =>
        console.warn("Thumbnail blob delete failed:", err),
      );
    }
    return NextResponse.json({ deleted: id });
  },
);
