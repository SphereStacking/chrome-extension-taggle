import type { CalendarItem } from '../types'

export type RuntimeMessage =
  | { type: 'GET_CALENDARS'; tabId: number }
  | { type: 'TOGGLE_GROUP'; tabId: number; calendarIds: string[]; enabled: boolean }
  | { type: 'OPEN_SIDEPANEL' }
  | { type: 'TOGGLE_SIDEPANEL' }

export type ContentMessage =
  | { type: 'COLLECT_CALENDARS' }
  | { type: 'TOGGLE_GROUP'; calendarIds: string[]; enabled: boolean }

export type CalendarsResponse = { type: 'CALENDARS_RESPONSE'; calendars: CalendarItem[] }

type RuntimeResponseMap = {
  GET_CALENDARS: { calendars?: CalendarItem[]; error?: string }
  TOGGLE_GROUP: { ok: boolean } | { error: string }
  OPEN_SIDEPANEL: void
  TOGGLE_SIDEPANEL: void
}

export async function sendMessage<M extends RuntimeMessage>(
  message: M
): Promise<RuntimeResponseMap[M['type']]> {
  return chrome.runtime.sendMessage(message)
}
