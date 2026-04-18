import { deriveIvAndKeyFromPassword } from "../crypto/pbkdf2.js";
import { aesCtrEncrypt, aesCtrDecrypt } from "../crypto/aesCtr.js";
import { hmacSha256 } from "../crypto/hmac.js";
import { concatBytes, equalBytesConstantTime, sliceBytes } from "../util/bytes.js";
import { compressStringToBytes, decompressBytesToString } from "../codec/compress.js";
import { complimentBytes } from "../codec/compliment.js";
import { bytesToZwcStream, zwcStreamToBytes } from "../stego/encode.js";
import { shrinkZwcStream, expandZwcStream } from "../stego/shrink.js";
import { embedInCover, detachInvisibleStream, ensureCoverText } from "../stego/embed.js";

const SALT_LEN = 8;
const HMAC_LEN = 32;

export function validatePassword5Digits(password) {
  return typeof password === "string" && /^\d{5}$/.test(password);
}

export async function hide({ secretText, password, coverText }) {
  if (!secretText || !secretText.trim()) {
    throw new Error("Secret is required.");
  }
  if (!validatePassword5Digits(password)) {
    throw new Error("Password must be exactly 5 digits.");
  }

  const cover = ensureCoverText(coverText);

  const compressed = await compressStringToBytes(secretText);
  const prepared = complimentBytes(compressed);

  const salt = new Uint8Array(SALT_LEN);
  crypto.getRandomValues(salt);

  const { iv, keyBytes } = await deriveIvAndKeyFromPassword({ password, saltBytes: salt });

  const ciphertext = await aesCtrEncrypt({ keyBytes, iv, plaintextBytes: prepared });
  const hmac = await hmacSha256({ keyBytes, dataBytes: prepared });

  const payload = concatBytes([salt, hmac, ciphertext]);
  const zwcStream = bytesToZwcStream({ payloadBytes: payload, encrypt: true, integrity: true });
  const shrunk = shrinkZwcStream(zwcStream);
  return embedInCover(cover, shrunk);
}

export async function reveal({ carrierText, password }) {
  if (!carrierText || !carrierText.trim()) {
    throw new Error("Carrier message is required.");
  }
  if (!validatePassword5Digits(password)) {
    throw new Error("Password must be exactly 5 digits.");
  }

  const detached = detachInvisibleStream(carrierText);
  const expanded = expandZwcStream(detached);
  const { encrypt, integrity, payloadBytes } = zwcStreamToBytes(expanded);

  if (!encrypt || !integrity) {
    throw new Error("Unsupported payload format.");
  }
  if (payloadBytes.length < SALT_LEN + HMAC_LEN + 1) {
    throw new Error("Corrupted payload.");
  }

  const salt = sliceBytes(payloadBytes, 0, SALT_LEN);
  const sentHmac = sliceBytes(payloadBytes, SALT_LEN, SALT_LEN + HMAC_LEN);
  const ciphertext = sliceBytes(payloadBytes, SALT_LEN + HMAC_LEN);

  const { iv, keyBytes } = await deriveIvAndKeyFromPassword({ password, saltBytes: salt });

  const decrypted = await aesCtrDecrypt({ keyBytes, iv, ciphertextBytes: ciphertext });
  const vHmac = await hmacSha256({ keyBytes, dataBytes: decrypted });

  if (!equalBytesConstantTime(sentHmac, vHmac)) {
    throw new Error("Wrong password or corrupted message.");
  }

  const restored = complimentBytes(decrypted);
  return await decompressBytesToString(restored);
}

