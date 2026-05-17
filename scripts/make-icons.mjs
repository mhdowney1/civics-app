import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync, crc32 } from 'node:zlib'

const __filename = fileURLToPath(import.meta.url)
const outDir = resolve(dirname(__filename), '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const BG = [0x0f, 0x0f, 0x0f, 0xff]
const FG = [0x4a, 0xde, 0x80, 0xff]

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(body) >>> 0, 0)
  return Buffer.concat([len, body, crcBuf])
}

function makePng(size, draw) {
  const pixels = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      pixels[i + 0] = BG[0]
      pixels[i + 1] = BG[1]
      pixels[i + 2] = BG[2]
      pixels[i + 3] = BG[3]
    }
  }
  draw(pixels, size)

  // raw with 0-filter per row
  const stride = size * 4
  const filtered = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    filtered[y * (stride + 1)] = 0
    filtered.set(pixels.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1)
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const idat = deflateSync(filtered)
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function setPixel(pixels, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const i = (y * size + x) * 4
  pixels[i + 0] = color[0]
  pixels[i + 1] = color[1]
  pixels[i + 2] = color[2]
  pixels[i + 3] = color[3]
}

function drawCircleFilled(pixels, size, cx, cy, r, color) {
  const r2 = r * r
  const minX = Math.max(0, Math.floor(cx - r))
  const maxX = Math.min(size - 1, Math.ceil(cx + r))
  const minY = Math.max(0, Math.floor(cy - r))
  const maxY = Math.min(size - 1, Math.ceil(cy + r))
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r2) setPixel(pixels, size, x, y, color)
    }
  }
}

function drawStar(pixels, size, cx, cy, radius, color) {
  const spikes = 5
  const outer = radius
  const inner = radius * 0.42
  const points = []
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (Math.PI * i) / spikes - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  // bounding box
  let minX = size,
    minY = size,
    maxX = 0,
    maxY = 0
  for (const [x, y] of points) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  minX = Math.max(0, Math.floor(minX))
  minY = Math.max(0, Math.floor(minY))
  maxX = Math.min(size - 1, Math.ceil(maxX))
  maxY = Math.min(size - 1, Math.ceil(maxY))
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (pointInPolygon(x + 0.5, y + 0.5, points))
        setPixel(pixels, size, x, y, color)
    }
  }
}

function pointInPolygon(px, py, vs) {
  let inside = false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1]
    const xj = vs[j][0],
      yj = vs[j][1]
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function drawIcon({ size, padding = 0 }) {
  return makePng(size, (pixels, s) => {
    const cx = s / 2
    const cy = s / 2
    const innerSize = s - padding * 2
    const innerCx = cx
    const innerCy = cy
    drawCircleFilled(pixels, s, innerCx, innerCy, innerSize * 0.42, FG)
    drawStar(pixels, s, innerCx, innerCy, innerSize * 0.28, BG)
  })
}

writeFileSync(resolve(outDir, 'icon-192.png'), drawIcon({ size: 192 }))
writeFileSync(resolve(outDir, 'icon-512.png'), drawIcon({ size: 512 }))
writeFileSync(
  resolve(outDir, 'icon-maskable-512.png'),
  drawIcon({ size: 512, padding: 56 }),
)
writeFileSync(resolve(outDir, 'apple-icon-180.png'), drawIcon({ size: 180 }))
console.log('Wrote PWA icons to', outDir)
