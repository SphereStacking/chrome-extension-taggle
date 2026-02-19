<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ isDark: boolean }>()

const outerStyle = { padding: '0 20px' }

const cardStyle = computed(() => ({
  width: '100%',
  cursor: 'grab',
  borderRadius: '8px',
  border: `1px solid ${props.isDark ? '#3a3a3a' : 'rgba(226, 232, 240, 0.5)'}`,
  backgroundColor: props.isDark ? '#2a2a2a' : 'rgba(255, 255, 255, 0.7)',
  padding: '8px',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(8px)'
}))
</script>

<template>
  <div :style="outerStyle">
    <div :style="cardStyle">
      <slot />
    </div>
  </div>
</template>
