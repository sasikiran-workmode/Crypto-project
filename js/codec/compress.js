import { utf8ToBytes, bytesToUtf8 } from "../util/bytes.js";

async function streamToUint8Array(stream) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
    chunks.push(chunk);
    total += chunk.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

export function canUseCompressionStream() {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

export async function compressStringToBytes(str) {
  if (!canUseCompressionStream()) {
    return utf8ToBytes(str);
  }
  const bytes = utf8ToBytes(str);
  const cs = new CompressionStream("deflate");
  const compressed = new Blob([bytes]).stream().pipeThrough(cs);
  return await streamToUint8Array(compressed);
}

export async function decompressBytesToString(bytes) {
  if (!canUseCompressionStream()) {
    return bytesToUtf8(bytes);
  }
  const ds = new DecompressionStream("deflate");
  const decompressed = new Blob([bytes]).stream().pipeThrough(ds);
  const outBytes = await streamToUint8Array(decompressed);
  return bytesToUtf8(outBytes);
}
