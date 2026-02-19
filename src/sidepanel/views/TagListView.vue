<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useTags } from '../../shared/composables/useTags'
import { useMessages } from '../composables/useMessages'
import { useActiveTagMap } from '../../shared/composables/useActiveTagMap'
import ViewHeader from '../components/ViewHeader.vue'
import type { TagItem } from '../../shared/types'
import { saveTags } from '../../shared/services/storage'

const emit = defineEmits<{
  (event: 'create'): void
  (event: 'edit', tag: TagItem): void
}>()

const { tags, remove, reorder } = useTags()
const { toggleCalendars } = useMessages()

const confirmingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const { activeMap, setActive } = useActiveTagMap()
const fileInputRef = ref<HTMLInputElement | null>(null)
const draggingId = ref<string | null>(null)
const dropIdx = ref(-1)
let dragFromHandle = false

function onHandlePointerDown() {
  dragFromHandle = true
  window.addEventListener('pointerup', () => { dragFromHandle = false }, { once: true })
}

function onDragStart(event: DragEvent, tag: TagItem) {
  if (!dragFromHandle) {
    event.preventDefault()
    return
  }
  draggingId.value = tag.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setDragImage(
      (event.currentTarget as HTMLElement),
      (event.currentTarget as HTMLElement).offsetWidth / 2,
      (event.currentTarget as HTMLElement).offsetHeight / 2
    )
  }
}

function onDragOver(event: DragEvent) {
  if (!draggingId.value) return
  event.preventDefault()
  const container = event.currentTarget as HTMLElement
  const children = Array.from(container.querySelectorAll('[data-tag-id]')) as HTMLElement[]

  let newIdx = children.length
  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect()
    if (event.clientY < rect.top + rect.height / 2) {
      newIdx = i
      break
    }
  }
  dropIdx.value = newIdx
}

function onDragLeave(event: DragEvent) {
  const container = event.currentTarget as HTMLElement
  if (!container.contains(event.relatedTarget as Node)) {
    dropIdx.value = -1
  }
}

function onDragEnd() {
  if (draggingId.value && dropIdx.value >= 0) {
    const dragI = tags.value.findIndex((t) => t.id === draggingId.value)
    if (dragI !== -1 && dropIdx.value !== dragI && dropIdx.value !== dragI + 1) {
      const arr = [...tags.value]
      const [moved] = arr.splice(dragI, 1)
      const insertAt = dropIdx.value > dragI ? dropIdx.value - 1 : dropIdx.value
      arr.splice(insertAt, 0, moved)
      reorder(arr.map((t) => t.id))
    }
  }
  draggingId.value = null
  dropIdx.value = -1
}

function dropIndicatorClass(idx: number): string {
  if (dropIdx.value < 0 || !draggingId.value) return ''
  const dragI = tags.value.findIndex((t) => t.id === draggingId.value)
  if (dropIdx.value === dragI || dropIdx.value === dragI + 1) return ''
  if (idx === dropIdx.value) return 'sp-drop-before'
  if (dropIdx.value === tags.value.length && idx === tags.value.length - 1) return 'sp-drop-after'
  return ''
}

function requestDelete(tag: TagItem) {
  confirmingId.value = tag.id
}

function cancelDelete() {
  confirmingId.value = null
}

async function confirmDelete(tag: TagItem) {
  deletingId.value = tag.id
  try {
    await remove(tag.id)
  } finally {
    deletingId.value = null
    confirmingId.value = null
  }
}

function exportTags() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tags: tags.value
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'gcal-taggle-tags.json'
  link.click()
  URL.revokeObjectURL(url)
}

function openImportDialog() {
  fileInputRef.value?.click()
}

function normalizeTags(input: unknown): TagItem[] | null {
  const raw = Array.isArray(input) ? input : (input as { tags?: unknown })?.tags
  if (!Array.isArray(raw)) return null

  const normalized: TagItem[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const name = typeof record.name === 'string' ? record.name.trim() : ''
    const color = typeof record.color === 'string' ? record.color : ''
    const calendarIds = Array.isArray(record.calendarIds) ? record.calendarIds.filter((id) => typeof id === 'string') : []
    if (!name || !color) continue
    const id = typeof record.id === 'string' && record.id.length > 0 ? record.id : crypto.randomUUID()
    normalized.push({ id, name, color, calendarIds })
  }

  return normalized
}

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) return
  target.value = ''

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const imported = normalizeTags(data)
    if (!imported || imported.length === 0) {
      alert('No valid tags found in the file.')
      return
    }
    const ok = confirm('Import will replace your current tags. Continue?')
    if (!ok) return
    await saveTags(imported)
  } catch (error) {
    alert('Failed to import. Please check the JSON format.')
  }
}

async function toggleTag(tag: TagItem) {
  const current = !!activeMap.value[tag.id]
  const next = !current
  setActive(tag.id, next)
  try {
    await toggleCalendars(tag.calendarIds, next)
  } catch {
    setActive(tag.id, current)
  }
}
</script>

<template>
  <div class="space-y-4 sp-slide-up">
    <ViewHeader title="Tags" subtitle="Manage your tag groups" action-label="New Tag" @action="emit('create')" />

    <div class="flex items-center gap-2">
      <button
        class="h-8 rounded-md border sp-border px-3 text-xs sp-muted hover:bg-white/60 dark:hover:bg-white/5"
        type="button"
        @click="exportTags"
      >
        Export JSON
      </button>
      <button
        class="h-8 rounded-md border sp-border px-3 text-xs sp-muted hover:bg-white/60 dark:hover:bg-white/5"
        type="button"
        @click="openImportDialog"
      >
        Import JSON
      </button>
      <input ref="fileInputRef" type="file" accept="application/json" class="hidden" @change="handleImport" />
    </div>

    <div v-if="tags.length === 0" class="rounded-lg border border-dashed sp-border p-4 text-xs sp-muted">
      No tags yet.
    </div>

    <div v-else class="space-y-2" @dragover="onDragOver" @dragleave="onDragLeave">
      <div
        v-for="(tag, idx) in tags"
        :key="tag.id"
        :data-tag-id="tag.id"
        class="sp-tag-row flex items-center gap-2 rounded-lg border sp-border sp-surface px-3 py-2 sp-stagger"
        :class="[{ 'sp-dragging': draggingId === tag.id }, dropIndicatorClass(idx)]"
        :style="{ '--sp-index': idx }"
        draggable="true"
        @dragstart="onDragStart($event, tag)"
        @dragend="onDragEnd"
      >
        <Icon icon="mdi:drag" class="sp-drag-handle text-base sp-muted shrink-0 cursor-grab" @pointerdown="onHandlePointerDown" />
        <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: tag.color }"></span>
        <div class="flex-1">
          <div class="text-xs font-medium sp-text">#{{ tag.name }}</div>
          <div class="text-[10px] sp-muted">{{ tag.calendarIds.length }} calendars</div>
        </div>
        <div v-if="confirmingId === tag.id" class="flex items-center gap-2 text-xs">
          <span class="text-slate-600 dark:text-slate-300">Delete?</span>
          <button
            class="rounded-md bg-red-500 px-2 py-1 text-[10px] font-medium text-white disabled:opacity-50"
            type="button"
            :disabled="deletingId === tag.id"
            @click="confirmDelete(tag)"
          >
            Yes
          </button>
          <button
            class="rounded-md border sp-border px-2 py-1 text-[10px] sp-muted"
            type="button"
            :disabled="deletingId === tag.id"
            @click="cancelDelete"
          >
            No
          </button>
        </div>
        <div v-else class="flex items-center gap-1">
          <button
            class="rounded-md p-1.5 sp-muted hover:bg-white/60 dark:hover:bg-white/5"
            type="button"
            :title="activeMap[tag.id] ? 'Disable' : 'Enable'"
            @click="toggleTag(tag)"
          >
            <Icon :icon="activeMap[tag.id] ? 'mdi:eye' : 'mdi:eye-off-outline'" class="text-base" />
          </button>
          <button
            class="rounded-md p-1.5 sp-muted hover:bg-white/60 dark:hover:bg-white/5"
            type="button"
            title="Edit"
            @click="emit('edit', tag)"
          >
            <Icon icon="mdi:pencil-outline" class="text-base" />
          </button>
          <button
            class="rounded-md p-1.5 text-red-600 hover:bg-white/60 dark:text-red-400 dark:hover:bg-white/5"
            type="button"
            title="Delete"
            @click="requestDelete(tag)"
          >
            <Icon icon="mdi:delete-outline" class="text-base" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
