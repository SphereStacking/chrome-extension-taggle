<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useMessages } from '../composables/useMessages'
import type { CalendarItem } from '../../shared/types'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const selected = computed({
  get: () => props.modelValue,
  set: (value: string[]) => emit('update:modelValue', value)
})

const calendars = ref<CalendarItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const query = ref('')

const { getCalendars } = useMessages()

async function loadCalendars() {
  isLoading.value = true
  error.value = null
  try {
    calendars.value = await getCalendars()
  } catch (err) {
    error.value = 'Please ensure you are on Google Calendar page.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCalendars()
})

const filteredCalendars = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return calendars.value
  return calendars.value.filter((calendar) => calendar.name.toLowerCase().includes(term))
})
</script>

<template>
  <div class="flex flex-col space-y-2">
    <input
      v-model="query"
      type="text"
      placeholder="Search calendars..."
      class="w-full rounded-md border sp-border sp-surface-2 px-2 py-1 text-xs sp-text outline-none focus:border-slate-400"
    />
    <div class="flex-1 min-h-0 space-y-1 overflow-y-auto rounded-md border sp-border p-2">
    <div v-if="isLoading" class="text-xs sp-muted">Loading calendars...</div>
    <div v-else-if="error" class="text-xs text-amber-600 dark:text-amber-300">{{ error }}</div>
    <div v-else-if="calendars.length === 0" class="text-xs sp-muted">Calendar list not found.</div>
    <div v-else-if="filteredCalendars.length === 0" class="text-xs sp-muted">
      No calendars match your search.
    </div>
    <template v-else>
      <label
        v-for="calendar in filteredCalendars"
        :key="calendar.id"
        class="flex items-center gap-2 rounded-md px-2 py-1 text-xs sp-text hover:bg-white/60 dark:hover:bg-white/5"
      >
        <input v-model="selected" type="checkbox" :value="calendar.id" />
        <span>{{ calendar.name }}</span>
      </label>
    </template>
    </div>
  </div>
</template>
