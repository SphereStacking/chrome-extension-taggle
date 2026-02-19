import { sendMessage } from '../../shared/services/messaging'
import type { CalendarItem } from '../../shared/types'

export function useMessages() {
  const CACHE_KEY = 'gcalTaggleCalendarsCache'
  const TIMEOUT_MS = 5000

  function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: number | undefined
    const timeout = new Promise<T>((_, reject) => {
      timer = window.setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    })
    return Promise.race([promise, timeout]).finally(() => {
      if (timer !== undefined) window.clearTimeout(timer)
    })
  }

  async function getCalendars(): Promise<CalendarItem[]> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tabs[0]?.id) throw new Error('No active tab')

    try {
      const response = await withTimeout(
        sendMessage({
          type: 'GET_CALENDARS',
          tabId: tabs[0].id
        }),
        TIMEOUT_MS
      )

      if (response.error) throw new Error(response.error)
      const calendars = response.calendars ?? []
      await chrome.storage.local.set({ [CACHE_KEY]: calendars })
      return calendars
    } catch (error) {
      const cached = await chrome.storage.local.get(CACHE_KEY)
      const calendars = cached[CACHE_KEY] as CalendarItem[] | undefined
      if (calendars && calendars.length > 0) return calendars
      throw error
    }
  }

  async function toggleCalendars(calendarIds: string[], enabled: boolean): Promise<void> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tabs[0]?.id) throw new Error('No active tab')

    await sendMessage({
      type: 'TOGGLE_GROUP',
      tabId: tabs[0].id,
      calendarIds,
      enabled
    })
  }

  return { getCalendars, toggleCalendars }
}
