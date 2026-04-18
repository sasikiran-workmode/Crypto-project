import { utf8ToBytes } from "../util/bytes.js";

export async function deriveIvAndKeyFromPassword({ password, saltBytes }) {
  if (!crypto?.subtle) throw new Error("WebCrypto not available");
  const pwKey = await crypto.subtle.importKey("raw", utf8ToBytes(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 10000,
      hash: "SHA-512",
    },
    pwKey,
    48 * 8
  );
  const bytes = new Uint8Array(bits);
  const iv = bytes.slice(0, 16);
  const keyBytes = bytes.slice(16, 48);
  return { iv, keyBytes };
}
