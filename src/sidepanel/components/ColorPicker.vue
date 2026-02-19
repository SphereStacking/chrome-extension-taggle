<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { TAG_COLORS } from '../../shared/constants'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const customInputRef = ref<HTMLInputElement | null>(null)
const isCustom = computed(() => !TAG_COLORS.includes(props.modelValue))
const customColors = ref<string[]>([])
const CUSTOM_COLORS_KEY = 'gcalTaggleCustomColors'

async function loadCustomColors() {
  const stored = await chrome.storage.local.get(CUSTOM_COLORS_KEY)
  const colors = stored[CUSTOM_COLORS_KEY]
  if (Array.isArray(colors)) {
    const next = colors.slice(0, 7)
    customColors.value = next
    if (next.length !== colors.length) {
      await chrome.storage.local.set({ [CUSTOM_COLORS_KEY]: next })
    }
  } else {
    customColors.value = []
  }
}

function openCustomPicker() {
  customInputRef.value?.click()
}

function handleCustomChange(event: Event) {
  const target = event.target as HTMLInputElement | null
  if (!target?.value) return
  emit('update:modelValue', target.value)
}

onMounted(() => {
  loadCustomColors()
})
</script>

<template>
  <div class="space-y-2">
    <div role="radiogroup" aria-label="Tag color" class="flex flex-wrap gap-2">
      <button
        v-for="color in TAG_COLORS"
        :key="color"
        type="button"
        role="radio"
        :aria-checked="props.modelValue === color"
        :aria-label="`Select color ${color}`"
        class="relative h-8 w-8 rounded-full border-2 transition focus-visible:outline-none"
        :style="{
          backgroundColor: color,
          borderColor: props.modelValue === color ? '#0f172a' : 'transparent',
          transform: props.modelValue === color ? 'scale(1.05)' : 'scale(1)',
          boxShadow: props.modelValue === color ? '0 0 0 3px rgba(15, 23, 42, 0.4)' : 'none'
        }"
        @click="emit('update:modelValue', color)"
      >
        <span
          v-if="props.modelValue === color"
          class="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-white"
          style="text-shadow: 0 1px 2px rgba(0,0,0,0.6)"
        >
          ✓
        </span>
      </button>
    </div>

    <div role="radiogroup" aria-label="Custom tag color" class="flex flex-wrap items-center gap-2">
      <button
        v-for="color in customColors"
        :key="`custom-${color}`"
        type="button"
        role="radio"
        :aria-checked="props.modelValue === color"
        :aria-label="`Select color ${color}`"
        class="relative h-8 w-8 rounded-full border-2 transition focus-visible:outline-none"
        :style="{
          backgroundColor: color,
          borderColor: props.modelValue === color ? '#0f172a' : 'transparent',
          transform: props.modelValue === color ? 'scale(1.05)' : 'scale(1)',
          boxShadow: props.modelValue === color ? '0 0 0 3px rgba(15, 23, 42, 0.4)' : 'none'
        }"
        @click="emit('update:modelValue', color)"
      >
        <span
          v-if="props.modelValue === color"
          class="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-white"
          style="text-shadow: 0 1px 2px rgba(0,0,0,0.6)"
        >
          ✓
        </span>
      </button>

    <button
      type="button"
      class="relative h-8 w-8 rounded-full border-2 border-dashed sp-border text-xs font-semibold sp-muted transition hover:border-slate-400"
      :style="{
        backgroundColor: isCustom ? props.modelValue : 'transparent'
      }"
      aria-label="Pick custom color"
      @click="openCustomPicker"
    >
      <span>+</span>
    </button>
      <input ref="customInputRef" type="color" class="sr-only" :value="props.modelValue" @input="handleCustomChange" />
    </div>
  </div>
</template>
