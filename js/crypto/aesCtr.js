export async function importAesKey(keyBytes) {
  return await crypto.subtle.importKey("raw", keyBytes, { name: "AES-CTR" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function aesCtrEncrypt({ keyBytes, iv, plaintextBytes }) {
  const key = await importAesKey(keyBytes);
  const out = await crypto.subtle.encrypt(
    { name: "AES-CTR", counter: iv, length: 128 },
    key,
    plaintextBytes
  );
  return new Uint8Array(out);
}

export async function aesCtrDecrypt({ keyBytes, iv, ciphertextBytes }) {
  const key = await importAesKey(keyBytes);
  const out = await crypto.subtle.decrypt(
    { name: "AES-CTR", counter: iv, length: 128 },
    key,
    ciphertextBytes
  );
  return new Uint8Array(out);
}
