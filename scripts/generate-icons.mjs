import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/icon.svg')
const sizes = [16, 32, 48, 128]

const svg = readFileSync(svgPath)

for (const size of sizes) {
  const outPath = resolve(root, `public/icon-${size}.png`)
  await sharp(svg).resize(size, size).png().toFile(outPath)
  console.log(`Generated: icon-${size}.png`)
}

console.log('Done!')
