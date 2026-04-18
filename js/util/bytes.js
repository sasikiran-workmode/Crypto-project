const te = new TextEncoder();
const td = new TextDecoder("utf-8", { fatal: false });

export function utf8ToBytes(str) {
  return te.encode(str);
}

export function bytesToUtf8(bytes) {
  return td.decode(bytes);
}

export function concatBytes(arrays) {
  let total = 0;
  for (const a of arrays) total += a.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

export function sliceBytes(bytes, start, end) {
  return bytes.slice(start, end);
}

export function equalBytesConstantTime(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
