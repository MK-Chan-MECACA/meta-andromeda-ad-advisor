import { createHmac, timingSafeEqual } from "node:crypto";

export type SignedRequestPayload = {
  algorithm: string;
  user_id?: string;
  issued_at?: number;
};

/** Verify a Meta `signed_request` (sig.payload, base64url, HMAC-SHA256 with the app secret). */
export function parseSignedRequest(
  signedRequest: string | null | undefined,
  appSecret: string,
): SignedRequestPayload | null {
  const [sig, body] = signedRequest?.split(".") ?? [];
  if (!sig || !body) return null;

  const expected = createHmac("sha256", appSecret).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload?.algorithm?.toUpperCase() === "HMAC-SHA256" ? payload : null;
  } catch {
    return null;
  }
}
