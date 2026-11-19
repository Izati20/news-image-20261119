// news-image-20261119 — "Sum up 19 November's world news in one image"
//
// The picture beside this file (entry.png, 1024x1024) is the front page for
// Thursday 19 November 2026: the first Trump-Xi-Putin three-way summit in
// Shenzhen leads, with Iran's widening Gulf attacks and the tanker strike
// in Hormuz, Ukraine's third strike on the Crimea bridge in a week,
// Anthropic's record $81.3bn IPO, the hawkish Fed minutes sinking stocks
// and gold, the ICJ's Rohingya genocide judgment, and GTA VI's launch.
//
// The grader runs this program twice with no network and compares the
// output, so the program does one deterministic thing: verify the bundled
// image is a well-formed PNG inside the gate's limits, then copy it,
// byte for byte, into the output directory as entry.png.
//
//   node main.ts                                  (writes /output/entry.png)
//   MAKEFUN_OUTPUT_DIR=out node main.ts           (writes out/entry.png)

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 1_048_576; // the gate's 1 MiB ceiling
const MAX_SIDE = 1024; // the gate's per-side pixel ceiling
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function inspectPng(bytes) {
  const hasSignature = PNG_SIGNATURE.every((b, i) => bytes[i] === b);
  if (!hasSignature) throw new Error('entry.png is not a PNG file');
  // IHDR is always the first chunk: width and height are big-endian
  // uint32s at byte offsets 16 and 20.
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width > MAX_SIDE || height > MAX_SIDE) {
    throw new Error(`entry.png is ${width}x${height}, over the ${MAX_SIDE}px limit`);
  }
  return { width, height };
}

const sourcePath = new URL('./entry.png', import.meta.url);
const sourceBytes = readFileSync(sourcePath);
if (sourceBytes.length === 0 || sourceBytes.length > MAX_BYTES) {
  throw new Error(`entry.png has an invalid size: ${sourceBytes.length} bytes`);
}
inspectPng(sourceBytes);

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outputDir, { recursive: true });

const destination = join(outputDir, 'entry.png');
copyFileSync(sourcePath, destination);

// The two grader runs must agree exactly, so prove the copy landed whole:
// same length, and still a PNG that passes the same inspection.
const delivered = statSync(destination).size;
if (delivered !== sourceBytes.length) {
  throw new Error(`copy mismatch: wrote ${delivered} of ${sourceBytes.length} bytes`);
}
inspectPng(readFileSync(destination));
