<script setup lang="ts">
import { computed } from 'vue'
import type { TagItem } from '../../../shared/types'
import TagButton from './TagButton.vue'

const props = defineProps<{
  tags: TagItem[]
  activeMap: Record<string, boolean>
  isDark: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle', tag: TagItem): void
}>()

const wrapperStyle = { marginTop: '8px', display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }
const emptyStyle = computed(() => ({
  borderRadius: '9999px', padding: '2px 8px', fontSize: '11px',
  color: props.isDark ? '#cbd5e1' : '#94a3b8'
}))
</script>

<template>
  <div :style="wrapperStyle">
    <TransitionGroup name="tag">
      <TagButton
        v-for="tag in props.tags"
        :key="tag.id"
        :tag="tag"
        :active="!!props.activeMap[tag.id]"
        :is-dark="props.isDark"
        @toggle="emit('toggle', $event)"
      />
    </TransitionGroup>

    <span v-if="props.tags.length === 0" :style="emptyStyle">
      No tags yet — click ⚙ to manage
    </span>
  </div>
</template>
