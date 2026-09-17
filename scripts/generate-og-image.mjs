// Renders public/og.png (1200×630), the image shown when the site is shared:
// the wealth parade of the 100, with the "you" marker in the middle where
// almost everyone believes they stand. No dependencies — rectangles are
// rasterised by hand and the PNG is encoded with node's zlib.
//
//   node scripts/generate-og-image.mjs

import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { profiles } from '../src/data/profiles.js'

const W = 1200
const H = 630
const px = Buffer.alloc(W * H * 3)

const PAPER = [255, 248, 236]
const INK = [31, 27, 58]
const ACCENT = [91, 75, 255]
const NEG = [229, 72, 77]
const RULE = [201, 191, 168]
const CORAL = [255, 90, 54]

function fill(x0, y0, x1, y1, [r, g, b]) {
  const xa = Math.max(0, Math.round(Math.min(x0, x1)))
  const xb = Math.min(W, Math.round(Math.max(x0, x1)))
  const ya = Math.max(0, Math.round(Math.min(y0, y1)))
  const yb = Math.min(H, Math.round(Math.max(y0, y1)))
  for (let y = ya; y < yb; y++) {
    let i = (y * W + xa) * 3
    for (let x = xa; x < xb; x++) {
      px[i++] = r; px[i++] = g; px[i++] = b
    }
  }
}
function disc(cx, cy, radius, color) {
  for (let y = -radius; y <= radius; y++) {
    const half = Math.sqrt(radius * radius - y * y)
    fill(cx - half, cy + y, cx + half, cy + y + 1, color)
  }
}

fill(0, 0, W, H, PAPER)

// plot area
const X0 = 70, X1 = 1130, Y0 = 110, Y1 = 545
const sorted = [...profiles].sort((a, b) => a.economics.netWealth - b.economics.netWealth)
const values = sorted.map((p) => p.economics.netWealth)
const max = Math.max(...values) * 1.02
const min = Math.min(0, ...values)
const slot = (X1 - X0) / 100
const barW = slot - 3
const yFor = (v) => Y0 + (1 - (v - min) / (max - min)) * (Y1 - Y0)
const yZero = yFor(0)

// faint gridlines
for (let k = 1; k <= 3; k++) fill(X0, yFor((max * k) / 4), X1, yFor((max * k) / 4) + 1, [239, 227, 204])

sorted.forEach((p, i) => {
  const v = p.economics.netWealth
  const x = X0 + i * slot + 1.5
  const yv = yFor(v)
  const top = Math.min(yZero, yv)
  const bottom = Math.max(yZero, yv, top + 2)
  fill(x, top, x + barW, bottom, v < 0 ? NEG : ACCENT)
})
fill(X0, yZero, X1, yZero + 2, RULE)

// "you" marker at the middle: where almost everyone thinks they are
const mx = X0 + 50 * slot
fill(mx - 3, 150, mx + 3, yZero, PAPER)
fill(mx - 1.5, 150, mx + 1.5, yZero, CORAL)
disc(mx, 150, 10, PAPER)
disc(mx, 150, 8, CORAL)

// thin ink rule at the bottom, as on the page footer
fill(X0, 585, X1, 587, INK)

// ── PNG encoding ────────────────────────────────────────────────────────────
const crcTable = new Int32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c
})
function crc32(buf) {
  let c = -1
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
const raw = Buffer.alloc((W * 3 + 1) * H)
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0 // filter: none
  px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3)
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const target = join(root, 'public', 'og.png')
writeFileSync(target, png)
console.log(`Wrote ${target} (${png.length} bytes)`)
