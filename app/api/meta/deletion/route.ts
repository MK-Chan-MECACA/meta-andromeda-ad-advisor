import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { parseSignedRequest } from "@/lib/meta-signed-request";

/**
 * Meta Data Deletion Callback (public). Meta POSTs a form-encoded
 * `signed_request`; we drop every workspace connection made by that
 * Facebook user and return the status URL + confirmation code Meta expects.
 */
export async function POST(req: Request) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const form = await req.formData().catch(() => null);
  const payload = parseSignedRequest(
    form?.get("signed_request")?.toString(),
    appSecret,
  );
  if (!payload?.user_id) {
    return NextResponse.json({ error: "Invalid signed_request." }, { status: 400 });
  }

  // Scoped by fb_user_id, not workspace: Meta identifies the person, not the tenant.
  await sql`delete from meta_connections where fb_user_id = ${payload.user_id}`;

  // ponytail: no deletion-status store — deletion is synchronous, so the code is a receipt only.
  const confirmationCode = randomBytes(8).toString("hex");
  return NextResponse.json({
    url: new URL(`/meta-deletion?code=${confirmationCode}`, req.url).toString(),
    confirmation_code: confirmationCode,
  });
}
