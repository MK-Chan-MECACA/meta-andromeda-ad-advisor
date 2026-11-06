import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/** AES-256-GCM. Output: base64(iv[12] | tag[16] | ciphertext). */

function keyBytes(keyB64: string) {
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) throw new Error("Seal key must be 32 bytes (base64).");
  return key;
}

export function seal(plaintext: string, keyB64: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(keyB64), iv);
  const data = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64");
}

/** Throws on wrong key or tampered input. */
export function unseal(sealed: string, keyB64: string): string {
  const key = keyBytes(keyB64);
  const buf = Buffer.from(sealed, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
}
