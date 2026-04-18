export function complimentBytes(bytes) {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    out[i] = (~bytes[i]) & 0xff;
  }
  return out;
}
