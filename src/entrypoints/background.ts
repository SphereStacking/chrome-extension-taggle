import { defineBackground } from 'wxt/sandbox'
import type { ContentMessage, RuntimeMessage } from '../shared/services/messaging'

const sidePanelState = new Map<number, boolean>()

type MessageHandler = (
  message: RuntimeMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => boolean | void

const handlers: Record<RuntimeMessage['type'], MessageHandler> = {
  GET_CALENDARS(message, _sender, sendResponse) {
    if (message.type !== 'GET_CALENDARS') return
    chrome.tabs
      .sendMessage(message.tabId, { type: 'COLLECT_CALENDARS' } satisfies ContentMessage)
      .then((response) => sendResponse(response))
      .catch((error: Error) => sendResponse({ error: error.message }))
    return true
  },
  TOGGLE_GROUP(message, _sender, sendResponse) {
    if (message.type !== 'TOGGLE_GROUP') return
    chrome.tabs
      .sendMessage(message.tabId, {
        type: 'TOGGLE_GROUP',
        calendarIds: message.calendarIds,
        enabled: message.enabled
      } satisfies ContentMessage)
      .then((response) => sendResponse(response))
      .catch((error: Error) => sendResponse({ error: error.message }))
    return true
  },
  OPEN_SIDEPANEL(_message, sender) {
    const windowId = sender.tab?.windowId
    if (windowId !== undefined) {
      chrome.sidePanel.open({ windowId })
      sidePanelState.set(windowId, true)
    }
  },
  TOGGLE_SIDEPANEL(_message, sender) {
    const windowId = sender.tab?.windowId
    if (windowId === undefined) return
    const isOpen = sidePanelState.get(windowId) ?? false
    if (isOpen && 'close' in chrome.sidePanel) {
      ;(chrome.sidePanel as unknown as { close: (opts: { windowId: number }) => void }).close({ windowId })
      sidePanelState.set(windowId, false)
    } else {
      chrome.sidePanel.open({ windowId })
      sidePanelState.set(windowId, true)
    }
  },
}

export default defineBackground(() => {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'sidepanel') return

    let windowId: number | undefined

    port.onMessage.addListener((message) => {
      if (message.type === 'SIDEPANEL_INIT' && typeof message.windowId === 'number') {
        windowId = message.windowId
        sidePanelState.set(windowId, true)
      }
    })

    port.onDisconnect.addListener(() => {
      if (windowId !== undefined) {
        sidePanelState.set(windowId, false)
      }
    })
  })

  chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender, sendResponse) => {
    const handler = handlers[message.type]
    if (handler) {
      return handler(message, sender, sendResponse)
    }
  })
})
