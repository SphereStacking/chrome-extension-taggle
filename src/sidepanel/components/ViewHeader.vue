<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    actionLabel?: string
  }>(),
  {
    subtitle: undefined,
    actionLabel: undefined
  }
)

const emit = defineEmits<{
  (event: 'action'): void
}>()
</script>

<template>
  <div class="flex w-full shrink-0 min-h-[48px] items-center justify-between gap-3">
    <div>
      <h2 class="text-lg font-semibold sp-text">{{ props.title }}</h2>
      <p v-if="props.subtitle" class="min-h-[16px] text-xs sp-muted">{{ props.subtitle }}</p>
      <p v-else class="min-h-[16px] text-xs text-transparent">.</p>
    </div>
    <button
      v-if="props.actionLabel"
      class="h-9 rounded-md px-3 text-xs font-medium sp-btn sp-btn-text"
      type="button"
      @click="emit('action')"
    >
      {{ props.actionLabel }}
    </button>
    <slot v-else name="action" />
  </div>
</template>
