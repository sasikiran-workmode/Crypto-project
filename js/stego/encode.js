import { ZWC, ZWC_SET } from "./zwcAlphabet.js";

function zwcFor2Bits(v) {
  return ZWC[v & 0b11];
}

function bitsForZwc(ch) {
  const idx = ZWC.indexOf(ch);
  if (idx < 0 || idx > 3) throw new Error("Invalid ZWC symbol");
  return idx;
}

export function bytesToZwcStream({ payloadBytes, encrypt = true, integrity = true }) {
  const flag = integrity && encrypt ? ZWC[0] : encrypt ? ZWC[1] : ZWC[2];
  let out = flag;
  for (let i = 0; i < payloadBytes.length; i++) {
    const b = payloadBytes[i];
    out += zwcFor2Bits(b >> 6);
    out += zwcFor2Bits(b >> 4);
    out += zwcFor2Bits(b >> 2);
    out += zwcFor2Bits(b);
  }
  return out;
}

export function zwcStreamToBytes(zwcStream) {
  if (!zwcStream || zwcStream.length < 2) throw new Error("Empty ZWC stream");
  const flagChar = zwcStream[0];
  const flagIdx = ZWC.indexOf(flagChar);
  if (flagIdx < 0 || flagIdx > 2) throw new Error("Unknown crypto flag");
  const encrypt = flagIdx === 0 || flagIdx === 1;
  const integrity = flagIdx === 0;

  const body = zwcStream.slice(1);
  const chars = Array.from(body);
  if (chars.length % 4 !== 0) throw new Error("Malformed ZWC body");

  const out = new Uint8Array(chars.length / 4);
  for (let i = 0; i < chars.length; i += 4) {
    const b0 = bitsForZwc(chars[i]);
    const b1 = bitsForZwc(chars[i + 1]);
    const b2 = bitsForZwc(chars[i + 2]);
    const b3 = bitsForZwc(chars[i + 3]);
    out[i / 4] = (b0 << 6) | (b1 << 4) | (b2 << 2) | b3;
  }
  return { encrypt, integrity, payloadBytes: out };
}

export function containsAnyZwc(str) {
  for (const ch of str) {
    if (ZWC_SET.has(ch)) return true;
  }
  return false;
}

