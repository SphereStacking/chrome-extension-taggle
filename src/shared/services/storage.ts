import { STORAGE_KEY } from '../constants'
import type { StoragePayload, TagItem } from '../types'

const EMPTY_PAYLOAD: StoragePayload = {
  tags: [],
  updatedAt: 0
}

function normalizeTags(tags: TagItem[]): { normalized: TagItem[]; changed: boolean } {
  let changed = false
  const normalized = tags.map((tag) => {
    const legacyIds = (tag as TagItem & { calendarIds?: string[] }).calendarIds
    const legacyRefs = (tag as TagItem & { calendarRefs?: Array<{ id: string; name?: string }> }).calendarRefs
    if (Array.isArray(legacyIds)) {
      const filtered = legacyIds.filter((id) => typeof id === 'string')
      if (filtered.length !== legacyIds.length) changed = true
      return {
        ...tag,
        calendarIds: filtered
      }
    }
    if (Array.isArray(legacyRefs)) {
      changed = true
      return {
        ...tag,
        calendarIds: legacyRefs.map((ref) => ref.id).filter((id) => typeof id === 'string')
      }
    }
    changed = true
    return {
      ...tag,
      calendarIds: []
    }
  })
  return { normalized, changed }
}

export async function loadTags(): Promise<TagItem[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEY)
  const payload = stored[STORAGE_KEY] as StoragePayload | undefined
  if (!payload || !Array.isArray(payload.tags)) return []
  const { normalized, changed } = normalizeTags(payload.tags as TagItem[])
  if (changed) {
    await saveTags(normalized)
  }
  return normalized
}

export async function saveTags(tags: TagItem[]): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: {
      ...EMPTY_PAYLOAD,
      tags,
      updatedAt: Date.now()
    }
  })
}

export async function createTag(input: Omit<TagItem, 'id'>): Promise<TagItem> {
  const tags = await loadTags()
  const newTag: TagItem = {
    id: crypto.randomUUID(),
    ...input
  }
  await saveTags([newTag, ...tags])
  return newTag
}

export async function updateTag(tagId: string, updates: Partial<Omit<TagItem, 'id'>>): Promise<TagItem | null> {
  const tags = await loadTags()
  const index = tags.findIndex((tag) => tag.id === tagId)
  if (index === -1) return null

  const updated: TagItem = { ...tags[index], ...updates }
  tags[index] = updated
  await saveTags(tags)
  return updated
}

export async function deleteTag(tagId: string): Promise<void> {
  const tags = await loadTags()
  await saveTags(tags.filter((tag) => tag.id !== tagId))
}
