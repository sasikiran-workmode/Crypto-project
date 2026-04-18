import { ZWC } from "./zwcAlphabet.js";

function findOptimal(secret, characters) {
  const dict = {};
  for (const c of characters) dict[c] = {};

  const size = secret.length;
  for (let j = 0; j < size; j++) {
    let count = 1;
    while (j < size && secret[j] === secret[j + 1]) {
      count++;
      j++;
    }
    if (count >= 2) {
      let itr = count;
      while (itr >= 2) {
        const key = secret[j];
        dict[key][itr] = (dict[key][itr] || 0) + Math.floor(count / itr) * (itr - 1);
        itr--;
      }
    }
  }

  const getOptimal = [];
  for (const key of Object.keys(dict)) {
    for (const count of Object.keys(dict[key])) {
      getOptimal.push([key + count, dict[key][count]]);
    }
  }
  getOptimal.sort((a, b) => b[1] - a[1]);

  let reqZwc = getOptimal
    .filter((val) => val[0][1] === "2")
    .slice(0, 2)
    .map((chars) => chars[0][0]);

  if (reqZwc.length !== 2) {
    const remaining = characters.filter((c) => !reqZwc.includes(c));
    reqZwc = reqZwc.concat(remaining.slice(0, 2 - reqZwc.length));
  }
  return reqZwc.slice().sort();
}

const tableMap = [
  ZWC[0] + ZWC[1],
  ZWC[0] + ZWC[2],
  ZWC[0] + ZWC[3],
  ZWC[1] + ZWC[2],
  ZWC[1] + ZWC[3],
  ZWC[2] + ZWC[3],
];

function getCompressFlag(zwc1, zwc2) {
  return ZWC[tableMap.indexOf(zwc1 + zwc2)];
}

function extractCompressFlag(flag) {
  return tableMap[ZWC.indexOf(flag)].split("");
}

function replaceAll(str, pattern, replacement) {
  return str.split(pattern).join(replacement);
}

export function shrinkZwcStream(stream) {
  const repeatChars = findOptimal(stream, ZWC.slice(0, 4));
  const flag = getCompressFlag(repeatChars[0], repeatChars[1]);
  let out = stream;
  out = replaceAll(out, repeatChars[0] + repeatChars[0], ZWC[4]);
  out = replaceAll(out, repeatChars[1] + repeatChars[1], ZWC[5]);
  return flag + out;
}

export function expandZwcStream(shrunk) {
  if (!shrunk) throw new Error("Empty shrunk stream");
  const flag = shrunk[0];
  const invisibleStream = shrunk.slice(1);
  const repeatChars = extractCompressFlag(flag);
  let out = invisibleStream;
  out = replaceAll(out, ZWC[4], repeatChars[0] + repeatChars[0]);
  out = replaceAll(out, ZWC[5], repeatChars[1] + repeatChars[1]);
  return out;
}

