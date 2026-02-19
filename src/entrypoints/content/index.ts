import { defineContentScript } from 'wxt/sandbox'
import { createApp } from 'vue'
import App from '../../content/App.vue'
import { collectCalendars, findInsertionPoint } from '../../content/features/calendar/calendarDom'
import type { ContentMessage, CalendarsResponse } from '../../shared/services/messaging'
import { toggleGroup } from '../../content/features/calendar/calendarToggle'

function debounce(fn: () => void, delayMs: number): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  return () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(fn, delayMs)
  }
}

const ROOT_ID = 'gcal-taggle-root'
const POSITION_KEY = 'gcalTagglePositionIndex'
let mountInProgress = false

async function loadPositionIndex(): Promise<number | null> {
  const stored = await chrome.storage.local.get(POSITION_KEY)
  const value = stored[POSITION_KEY]
  return Number.isInteger(value) && value >= 0 ? value : null
}

async function savePositionIndex(parent: HTMLElement, host: HTMLElement) {
  const siblings = Array.from(parent.children).filter((el) => el !== host)
  const next = host.nextElementSibling
  const index = next ? siblings.indexOf(next) : siblings.length
  await chrome.storage.local.set({ [POSITION_KEY]: index })
}

function getDragAfterElement(parent: HTMLElement, y: number, host: HTMLElement) {
  const candidates = Array.from(parent.children).filter((el) => el !== host) as HTMLElement[]
  let closest: { offset: number; element: HTMLElement | null } = { offset: Number.NEGATIVE_INFINITY, element: null }

  for (const child of candidates) {
    const box = child.getBoundingClientRect()
    const offset = y - (box.top + box.height / 2)
    if (offset < 0 && offset > closest.offset) {
      closest = { offset, element: child }
    }
  }

  return closest.element
}

function setupDragAndDrop(parent: HTMLElement, host: HTMLElement) {
  if (host.dataset.gcalTaggleDraggable === 'true') return
  host.dataset.gcalTaggleDraggable = 'true'
  host.draggable = true

  let isDraggingSelf = false

  host.addEventListener('dragstart', () => {
    isDraggingSelf = true
    host.classList.add('gcal-taggle-dragging')
  })

  host.addEventListener('dragend', () => {
    isDraggingSelf = false
    host.classList.remove('gcal-taggle-dragging')
    void savePositionIndex(parent, host)
  })

  parent.addEventListener('dragover', (event) => {
    if (!isDraggingSelf) return
    event.preventDefault()
    const after = getDragAfterElement(parent, event.clientY, host)
    if (after === null) {
      parent.appendChild(host)
    } else {
      parent.insertBefore(host, after)
    }
  })
}

async function mountApp() {
  if (document.getElementById(ROOT_ID) || mountInProgress) return true
  mountInProgress = true

  try {
    const insertionPoint = findInsertionPoint()
    if (!insertionPoint || !insertionPoint.parentElement) {
      return false
    }

    const anchor = insertionPoint.parentElement
    const parent = anchor.parentElement ?? anchor
    const host = document.createElement('div')
    host.id = ROOT_ID
    const savedIndex = await loadPositionIndex()
    const siblings = Array.from(parent.children).filter((el) => el !== host)
    if (savedIndex !== null && savedIndex >= 0 && savedIndex < siblings.length) {
      parent.insertBefore(host, siblings[savedIndex])
    } else {
      parent.insertBefore(host, anchor)
    }

    const shadow = host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `
.tag-enter-active { transition: all 200ms ease-out; }
.tag-enter-from { opacity: 0; transform: scale(0.9); }
.tag-leave-active { transition: all 150ms ease-in; }
.tag-leave-from { opacity: 1; transform: scale(1); }
.tag-leave-to { opacity: 0; transform: scale(0.9); }
`
    shadow.appendChild(style)

    const appRoot = document.createElement('div')
    shadow.appendChild(appRoot)

    createApp(App).mount(appRoot)
    setupDragAndDrop(parent, host)
    return true
  } finally {
    mountInProgress = false
  }
}

function ensureMounted() {
  void mountApp()
  const debouncedMount = debounce(() => {
    if (!document.getElementById(ROOT_ID)) {
      void mountApp()
    }
  }, 300)
  const observer = new MutationObserver(debouncedMount)
  observer.observe(document.body, { childList: true, subtree: true })
}

export default defineContentScript({
  matches: ['https://calendar.google.com/*'],
  runAt: 'document_idle',
  main() {
    chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
      if (message.type === 'COLLECT_CALENDARS') {
        const calendars = collectCalendars()
        sendResponse({ type: 'CALENDARS_RESPONSE', calendars } satisfies CalendarsResponse)
        return true
      }

      if (message.type === 'TOGGLE_GROUP') {
        toggleGroup(message.calendarIds, message.enabled)
        sendResponse({ ok: true })
      }
      return true
    })

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(ensureMounted, 1000)
      })
    } else {
      setTimeout(ensureMounted, 1000)
    }
  }
})
