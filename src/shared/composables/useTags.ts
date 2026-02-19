import { onMounted, onUnmounted, ref } from 'vue'
import { createTag, deleteTag, loadTags, updateTag } from '../services/storage'
import type { TagItem } from '../types'
import { STORAGE_KEY } from '../constants'

export function useTags() {
  const tags = ref<TagItem[]>([])

  async function refreshTags() {
    tags.value = await loadTags()
  }

  async function create(payload: Omit<TagItem, 'id'>) {
    await createTag(payload)
    await refreshTags()
  }

  async function update(tagId: string, updates: Partial<Omit<TagItem, 'id'>>) {
    await updateTag(tagId, updates)
    await refreshTags()
  }

  async function remove(tagId: string) {
    await deleteTag(tagId)
    await refreshTags()
  }

  const handleChange: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      refreshTags()
    }
  }

  onMounted(() => {
    refreshTags()
    chrome.storage.onChanged.addListener(handleChange)
  })

  onUnmounted(() => {
    chrome.storage.onChanged.removeListener(handleChange)
  })

  return { tags, refreshTags, create, update, remove }
}
