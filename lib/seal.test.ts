import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { seal, unseal } from "./seal.ts";
import { parseSignedRequest } from "./meta-signed-request.ts";

const key = randomBytes(32).toString("base64");

test("seal/unseal round-trips and uses a fresh IV each time", () => {
  const a = seal("EAAB-long-lived-token", key);
  const b = seal("EAAB-long-lived-token", key);
  assert.notEqual(a, b);
  assert.ok(!a.includes("EAAB"));
  assert.equal(unseal(a, key), "EAAB-long-lived-token");
});

test("unseal rejects tampered ciphertext", () => {
  const sealed = seal("secret", key);
  const buf = Buffer.from(sealed, "base64");
  buf[buf.length - 1] ^= 1;
  assert.throws(() => unseal(buf.toString("base64"), key));
});

test("unseal rejects the wrong key", () => {
  const sealed = seal("secret", key);
  assert.throws(() => unseal(sealed, randomBytes(32).toString("base64")));
});

test("bad key length is rejected", () => {
  const short = randomBytes(16).toString("base64");
  assert.throws(() => seal("x", short), /32 bytes/);
  assert.throws(() => unseal(seal("x", key), short), /32 bytes/);
});

/* ---------- Meta signed_request ---------- */

const appSecret = "app-secret";
function signedRequest(payload: object, secret = appSecret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${sig}.${body}`;
}

test("parseSignedRequest returns the payload for a valid signature", () => {
  const req = signedRequest({ algorithm: "HMAC-SHA256", user_id: "123" });
  assert.equal(parseSignedRequest(req, appSecret)?.user_id, "123");
});

test("parseSignedRequest rejects bad signatures and malformed input", () => {
  const req = signedRequest({ algorithm: "HMAC-SHA256", user_id: "123" }, "other");
  assert.equal(parseSignedRequest(req, appSecret), null);
  assert.equal(parseSignedRequest("garbage", appSecret), null);
  assert.equal(parseSignedRequest(null, appSecret), null);
  const wrongAlgo = signedRequest({ algorithm: "HMAC-MD5", user_id: "1" });
  assert.equal(parseSignedRequest(wrongAlgo, appSecret), null);
});
