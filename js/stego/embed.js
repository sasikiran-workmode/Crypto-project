import { ZWC_SET } from "./zwcAlphabet.js";

function countWords(cover) {
  const normalized = cover.trim().replace(/\s+/g, " ");
  if (!normalized) return 0;
  return normalized.split(" ").length;
}

export function ensureCoverText(cover) {
  const normalized = (cover ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "This is a confidential text";
  }
  return normalized;
}

export function embedInCover(cover, invisibleStream) {
  const normalized = ensureCoverText(cover);
  if (countWords(normalized) < 2) {
    throw new Error("Cover text must contain at least two words.");
  }
  const arr = normalized.split(" ");
  const targetIndex = Math.floor(Math.random() * Math.floor(arr.length / 2));
  return arr
    .slice(0, targetIndex + 1)
    .concat([invisibleStream + arr[targetIndex + 1]])
    .concat(arr.slice(targetIndex + 2))
    .join(" ");
}

export function detachInvisibleStream(carrier) {
  const str = (carrier ?? "").toString();
  const words = str.split(" ");
  for (const word of words) {
    let hasZwc = false;
    for (const ch of word) {
      if (ZWC_SET.has(ch)) {
        hasZwc = true;
        break;
      }
    }
    if (!hasZwc) continue;

    const chars = Array.from(word);
    let limit = 0;
    for (; limit < chars.length; limit++) {
      if (!ZWC_SET.has(chars[limit])) break;
    }
    if (limit > 0) return chars.slice(0, limit).join("");
  }
  throw new Error(
    "Invisible stream not detected! Please copy and paste the StegCloak text sent by the sender."
  );
}

