<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ count: number; isDark: boolean }>()
const emit = defineEmits<{ (event: 'manage'): void }>()

const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const titleGroupStyle = { display: 'flex', alignItems: 'center', gap: '8px' }
const iconColor = computed(() => props.isDark ? '#cbd5e1' : '#64748b')
const titleStyle = computed(() => ({
  fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em',
  color: props.isDark ? '#f1f5f9' : '#334155'
}))
const badgeStyle = computed(() => ({
  borderRadius: '9999px', padding: '2px 6px', fontSize: '10px', fontWeight: '500',
  backgroundColor: props.isDark ? '#303030' : '#f1f5f9',
  color: props.isDark ? '#e7e7e7' : '#475569'
}))
const buttonStyle = computed(() => ({
  height: '24px', width: '24px', borderRadius: '6px', border: 'none', background: 'none',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: props.isDark ? '#f1f5f9' : '#334155'
}))
const svgStyle = { height: '16px', width: '16px' }
</script>

<template>
  <div :style="headerStyle">
    <div :style="titleGroupStyle">
      <span :style="{ color: iconColor, cursor: 'grab' }" aria-hidden="true">
        <svg viewBox="0 0 24 24" :style="svgStyle" fill="currentColor">
          <path d="M7 19v-2h2v2H7m4 0v-2h2v2h-2m4 0v-2h2v2h-2M7 15v-2h2v2H7m4 0v-2h2v2h-2m4 0v-2h2v2h-2M7 11V9h2v2H7m4 0V9h2v2h-2m4 0V9h2v2h-2M7 7V5h2v2H7m4 0V5h2v2h-2m4 0V5h2v2h-2z" />
        </svg>
      </span>
      <span :style="titleStyle">TAGGLE</span>
      <span :style="badgeStyle">
        {{ props.count }}
      </span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px;">
      <button
        :style="buttonStyle"
        type="button"
        aria-label="Open Taggle settings"
        @click="emit('manage')"
      >
        <svg viewBox="0 0 24 24" :style="svgStyle" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3.5" />
          <path
            d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.02.02a2 2 0 1 1-2.83 2.83l-.02-.02a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.08 1.64V21a2 2 0 1 1-4 0v-.04a1.8 1.8 0 0 0-1.08-1.64 1.8 1.8 0 0 0-1.98.36l-.02.02a2 2 0 1 1-2.83-2.83l.02-.02a1.8 1.8 0 0 0 .36-1.98 1.8 1.8 0 0 0-1.64-1.08H3a2 2 0 1 1 0-4h.04a1.8 1.8 0 0 0 1.64-1.08 1.8 1.8 0 0 0-.36-1.98l-.02-.02a2 2 0 1 1 2.83-2.83l.02.02a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.08-1.64V3a2 2 0 1 1 4 0v.04a1.8 1.8 0 0 0 1.08 1.64 1.8 1.8 0 0 0 1.98-.36l.02-.02a2 2 0 1 1 2.83 2.83l-.02.02a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.64 1.08H21a2 2 0 1 1 0 4h-.04a1.8 1.8 0 0 0-1.64 1.08z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
