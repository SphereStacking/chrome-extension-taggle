const HEX3_RE = /^#?([0-9a-f]{3})$/i
const HEX6_RE = /^#?([0-9a-f]{6})$/i

export function hexToRgba(hex: string, alpha: number): string {
  let match = HEX6_RE.exec(hex)
  if (match) {
    const bigint = parseInt(match[1], 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  match = HEX3_RE.exec(hex)
  if (match) {
    const [r, g, b] = match[1].split('').map((c) => parseInt(c + c, 16))
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return `rgba(0, 0, 0, ${alpha})`
}

export function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}
