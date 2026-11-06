import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { handle, httpError, requireWorkspace } from "@/lib/workspace";

/** Members delete their own analyses; admins delete any in the workspace. */
export const DELETE = handle(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const ws = await requireWorkspace();
    const { id } = await ctx.params;
    const rows = await sql`
      delete from analyses
      where id = ${id}::uuid and workspace_id = ${ws.workspaceId}
        and (${ws.isAdmin} or created_by = ${ws.userId})
      returning id, thumbnail_url`;
    if (!rows[0]) throw httpError(404, "Analysis not found.");
    return NextResponse.json({ deleted: id });
  },
);
