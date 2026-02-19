<script setup lang="ts">
import { computed } from 'vue'
import type { TagItem } from '../../../shared/types'
import { buildTagStyle } from '../../ui/theme'

const props = defineProps<{
  tag: TagItem
  active: boolean
  isDark: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle', tag: TagItem): void
}>()

const baseStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  borderRadius: '9999px', borderWidth: '1px', borderStyle: 'solid',
  padding: '2px 8px', fontSize: '11px', fontWeight: '500',
  cursor: 'pointer', transition: 'all 200ms ease', background: 'none'
}

const style = computed(() => ({ ...baseStyle, ...buildTagStyle(props.tag.color, props.active, props.isDark) }))
</script>

<template>
  <button
    type="button"
    :style="style"
    :aria-pressed="props.active"
    :aria-label="`Toggle tag ${props.tag.name}`"
    @click="emit('toggle', props.tag)"
  >
    <span style="opacity: 0.6" aria-hidden="true">#</span>
    <span>{{ props.tag.name }}</span>
  </button>
</template>
