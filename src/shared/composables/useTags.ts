import { onMounted, onUnmounted, ref } from 'vue'
import { createTag, deleteTag, loadTags, saveTags, updateTag } from '../services/storage'
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

  async function reorder(orderedIds: string[]) {
    const map = new Map(tags.value.map((t) => [t.id, t]))
    const reordered = orderedIds.map((id) => map.get(id)).filter((t): t is TagItem => !!t)
    tags.value = reordered
    await saveTags(reordered)
  }

  return { tags, refreshTags, create, update, remove, reorder }
}
