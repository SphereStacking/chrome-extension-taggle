import { onMounted, onUnmounted, ref } from 'vue'

const ACTIVE_MAP_KEY = 'gcalTaggleActiveMap'

export function useActiveTagMap() {
  const activeMap = ref<Record<string, boolean>>({})

  async function load() {
    const stored = await chrome.storage.local.get(ACTIVE_MAP_KEY)
    const value = stored[ACTIVE_MAP_KEY]
    if (value && typeof value === 'object') {
      activeMap.value = value as Record<string, boolean>
    }
  }

  async function setActive(tagId: string, active: boolean) {
    activeMap.value = { ...activeMap.value, [tagId]: active }
    await chrome.storage.local.set({ [ACTIVE_MAP_KEY]: activeMap.value })
  }

  const handleChange: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, area) => {
    if (area === 'local' && changes[ACTIVE_MAP_KEY]) {
      const newValue = changes[ACTIVE_MAP_KEY].newValue
      if (newValue && typeof newValue === 'object') {
        activeMap.value = newValue as Record<string, boolean>
      }
    }
  }

  onMounted(() => {
    load()
    chrome.storage.onChanged.addListener(handleChange)
  })

  onUnmounted(() => {
    chrome.storage.onChanged.removeListener(handleChange)
  })

  return { activeMap, setActive }
}
