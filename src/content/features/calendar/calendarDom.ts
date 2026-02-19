import type { CalendarItem } from '../../../shared/types'
import { uniqueById } from '../../utils'

const HEADING_TEXTS = [
  'カレンダー リスト',
  'Calendar list',
  'マイカレンダー',
  'My calendars',
  '他のカレンダー',
  'Other calendars'
]

const CHECKBOX_SELECTOR = 'input[type="checkbox"][jsname]'

function hasCalendarCheckbox(container: ParentNode | null): boolean {
  if (!container) return false
  return !!container.querySelector(CHECKBOX_SELECTOR)
}

function findSectionByHeading(): HTMLElement | null {
  const headings = Array.from(document.querySelectorAll('h2'))
  const heading = headings.find((h) =>
    HEADING_TEXTS.some((text) => h.textContent?.includes(text))
  )
  if (!heading) return null

  const next = heading.nextElementSibling as HTMLElement | null
  if (next && hasCalendarCheckbox(next)) return next

  let sibling = heading.nextElementSibling as HTMLElement | null
  while (sibling) {
    if (hasCalendarCheckbox(sibling)) return sibling
    sibling = sibling.nextElementSibling as HTMLElement | null
  }

  const parent = heading.parentElement
  if (parent && hasCalendarCheckbox(parent)) return parent

  return null
}

function findSectionByAriaLabel(): HTMLElement | null {
  const labeled = Array.from(document.querySelectorAll<HTMLElement>('[aria-label]'))
  for (const el of labeled) {
    const label = el.getAttribute('aria-label') || ''
    if (!/calendar/i.test(label) && !label.includes('カレンダー')) continue
    if (hasCalendarCheckbox(el)) return el
  }
  return null
}

function findSectionByRoleTree(): HTMLElement | null {
  const tree = document.querySelector<HTMLElement>('div[role="tree"]')
  if (tree && hasCalendarCheckbox(tree)) return tree
  return null
}

export function findCalendarSection(): HTMLElement | null {
  return findSectionByHeading() || findSectionByAriaLabel() || findSectionByRoleTree()
}

export function findInsertionPoint(): HTMLElement | null {
  return findCalendarSection()
}

function getRowFromCheckbox(input: HTMLInputElement): HTMLElement {
  return (
    input.closest<HTMLElement>('div[role="treeitem"]') ||
    input.closest<HTMLElement>('div[role="listitem"]') ||
    input.closest<HTMLElement>('li') ||
    input.closest<HTMLElement>('div') ||
    input
  )
}

function extractCalendarName(row: HTMLElement, checkbox?: HTMLInputElement | null) {
  const aria = checkbox?.getAttribute('aria-label') || row.getAttribute('aria-label')
  if (aria) return aria.trim()

  const title = row.querySelector<HTMLElement>('[data-tooltip]')?.getAttribute('data-tooltip')
  if (title) return title.trim()

  const text = row.textContent?.replace(/\s+/g, ' ').trim()
  return text || 'Unknown'
}

function extractCalendarId(row: HTMLElement, checkbox?: HTMLInputElement | null) {
  const direct =
    row.getAttribute('data-id') ||
    checkbox?.getAttribute('data-id') ||
    checkbox?.closest<HTMLElement>('[data-id]')?.getAttribute('data-id') ||
    row.closest<HTMLElement>('[data-id]')?.getAttribute('data-id')
  if (direct) return direct

  let current: HTMLElement | null = row
  let depth = 0
  while (current && depth < 12) {
    const id = current.getAttribute('data-id')
    if (id) return id
    current = current.parentElement
    depth += 1
  }

  return null
}

export function collectCalendars(): CalendarItem[] {
  const container = findCalendarSection()
  const scope = container ?? document
  const checkboxes = Array.from(scope.querySelectorAll<HTMLInputElement>(CHECKBOX_SELECTOR))

  const calendars = checkboxes.map((checkbox) => {
    const row = getRowFromCheckbox(checkbox)
    const name = extractCalendarName(row, checkbox)
    const id = extractCalendarId(row, checkbox) || name
    return { id, name }
  })

  return uniqueById(calendars)
}

export function findCalendarRow(id: string, name?: string): HTMLElement | null {
  const container = findCalendarSection()
  const scope = container ?? document
  const checkboxes = Array.from(scope.querySelectorAll<HTMLInputElement>(CHECKBOX_SELECTOR))

  for (const checkbox of checkboxes) {
    const row = getRowFromCheckbox(checkbox)
    const rowId = extractCalendarId(row, checkbox)
    const rowName = extractCalendarName(row, checkbox)
    if (rowId === id || rowName === name || rowName === id) {
      return row
    }
  }

  return null
}
