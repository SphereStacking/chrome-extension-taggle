<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import ColorPicker from '../components/ColorPicker.vue'
import CalendarList from '../components/CalendarList.vue'
import ViewHeader from '../components/ViewHeader.vue'
import { useTags } from '../../shared/composables/useTags'
import { TAG_COLORS } from '../../shared/constants'
import type { TagItem } from '../../shared/types'

const props = defineProps<{
  mode: 'create' | 'edit'
  tag: TagItem | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const { create, update } = useTags()
const CUSTOM_COLORS_KEY = 'gcalTaggleCustomColors'

const form = reactive({
  name: '',
  color: TAG_COLORS[0],
  calendarIds: [] as string[]
})

const isSaving = ref(false)

watch(
  () => props.tag,
  (tag) => {
    if (props.mode === 'edit' && tag) {
      form.name = tag.name
      form.color = tag.color
      form.calendarIds = [...tag.calendarIds]
    } else {
      form.name = ''
      form.color = TAG_COLORS[0]
      form.calendarIds = []
    }
  },
  { immediate: true }
)

const isFormValid = computed(() => form.name.trim().length > 0)

async function submit() {
  if (!isFormValid.value) return
  isSaving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      color: form.color,
      calendarIds: [...form.calendarIds]
    }

    if (props.mode === 'create') {
      await create(payload)
      if (!TAG_COLORS.includes(payload.color)) {
        const stored = await chrome.storage.local.get(CUSTOM_COLORS_KEY)
        const existing = Array.isArray(stored[CUSTOM_COLORS_KEY]) ? (stored[CUSTOM_COLORS_KEY] as string[]) : []
        const next = [payload.color, ...existing.filter((item) => item !== payload.color)].slice(0, 7)
        await chrome.storage.local.set({ [CUSTOM_COLORS_KEY]: next })
      }
    } else if (props.mode === 'edit' && props.tag) {
      await update(props.tag.id, payload)
    }

    emit('close')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ViewHeader :title="props.mode === 'create' ? 'Create Tag' : 'Edit Tag'">
      <template #action>
        <button class="h-9 rounded-md px-3 text-xs sp-muted hover:bg-white/60 dark:hover:bg-white/5" type="button" @click="emit('close')">
          Back
        </button>
      </template>
    </ViewHeader>

    <div class="flex flex-1 flex-col gap-3">
      <div>
        <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Tag name</label>
        <input
          v-model="form.name"
          class="w-full rounded-md border sp-border sp-surface-2 px-2 py-1 text-sm sp-text outline-none focus:border-slate-400"
          type="text"
          placeholder="e.g. Work, Personal"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Color</label>
        <ColorPicker v-model="form.color" />
      </div>

      <div class="flex flex-1 flex-col">
        <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Calendars (optional)</label>
        <CalendarList v-model="form.calendarIds" class="flex-1 min-h-0" />
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <button
        class="rounded-md border sp-border px-3 py-1 text-xs sp-muted"
        type="button"
        @click="emit('close')"
      >
        Cancel
      </button>
      <button
        class="rounded-md px-3 py-1 text-xs font-medium sp-btn sp-btn-text disabled:opacity-50"
        type="button"
        :disabled="!isFormValid || isSaving"
        @click="submit"
      >
        {{ props.mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </div>
  </div>
</template>
