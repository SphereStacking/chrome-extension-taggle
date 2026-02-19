import { findCalendarRow } from './calendarDom'

export function toggleGroup(calendarIds: string[], targetState: boolean) {
  const missingIds: string[] = []
  const toggledIds: string[] = []

  for (const id of calendarIds) {
    const row = findCalendarRow(id)
    if (!row) {
      missingIds.push(id)
      continue
    }

    const checkbox = row.querySelector<HTMLInputElement>('input[type="checkbox"]')
    if (!checkbox) {
      missingIds.push(id)
      continue
    }

    if (checkbox.checked !== targetState) {
      checkbox.click()
    }
    toggledIds.push(id)
  }

  return { toggledIds, missingIds }
}
