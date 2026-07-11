// One-off PWA icon generator: renders the "1%" mark onto near-black tiles.
// Run: node scripts/gen-icons.mjs  (requires devDependency: sharp)

import sharp from "sharp";
import { mkdirSync } from "node:fs";

const BG = "#0a0c0b";
const EMERALD = "#45b683";
const INK = "#e8ece9";

/** The mark: serif-weight "1" in ink, "%" in emerald, on the student ground. */
const tile = (pad) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${pad > 0 ? 0 : 96}" fill="${BG}"/>
  <text x="256" y="${332 - pad * 0.2}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-weight="700"
        font-size="${300 - pad * 1.6}" letter-spacing="-12">
    <tspan fill="${INK}">1</tspan><tspan fill="${EMERALD}">%</tspan>
  </text>
  <rect x="${96 + pad}" y="${392 - pad * 0.4}" width="${320 - pad * 2}" height="10" rx="5" fill="${EMERALD}" opacity="0.85"/>
</svg>`;

mkdirSync("public/icons", { recursive: true });

const jobs = [
  { file: "public/icons/icon-192.png", size: 192, pad: 0 },
  { file: "public/icons/icon-512.png", size: 512, pad: 0 },
  { file: "public/icons/icon-maskable-512.png", size: 512, pad: 64 },
  { file: "public/icons/apple-touch-icon.png", size: 180, pad: 24 },
];

for (const j of jobs) {
  await sharp(Buffer.from(tile(j.pad))).resize(j.size, j.size).png().toFile(j.file);
  console.log("wrote", j.file);
}

// Social preview card (og:image), 1200×630.
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#232a26" stroke-width="2"/>
  <text x="90" y="300" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="200" letter-spacing="-8">
    <tspan fill="${INK}">1</tspan><tspan fill="${EMERALD}">%</tspan>
  </text>
  <text x="92" y="380" font-family="Georgia, serif" font-size="40" fill="${INK}" opacity="0.92">The floor, not the ceiling.</text>
  <text x="92" y="440" font-family="monospace" font-size="24" fill="#8d968f">Student records reality. Teacher judges the record.</text>
  <text x="92" y="478" font-family="monospace" font-size="24" fill="#8d968f">One correction, one mission, every day.</text>
  <rect x="92" y="520" width="360" height="8" rx="4" fill="${EMERALD}" opacity="0.85"/>
</svg>`;
await sharp(Buffer.from(og)).png().toFile("public/og.png");
console.log("wrote public/og.png");
