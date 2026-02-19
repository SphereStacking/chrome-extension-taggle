<script setup lang="ts">
import { computed } from 'vue'
import TaggleCard from './features/taggle/TaggleCard.vue'
import TagHeader from './features/taggle/TagHeader.vue'
import TagList from './features/taggle/TagList.vue'
import { useTags } from '../shared/composables/useTags'
import { useTheme } from '../shared/composables/useTheme'
import { useActiveTagMap } from '../shared/composables/useActiveTagMap'
import { toggleGroup } from './features/calendar/calendarToggle'
import type { TagItem } from '../shared/types'

const { tags } = useTags()
const { isDark } = useTheme()
const { activeMap: activeTagMap, setActive } = useActiveTagMap()

const sortedTags = computed(() => [...tags.value].sort((a, b) => a.name.localeCompare(b.name, 'ja')))

function openSidePanel() {
  chrome.runtime.sendMessage({ type: 'TOGGLE_SIDEPANEL' })
}

function toggleTag(tag: TagItem) {
  const current = !!activeTagMap.value[tag.id]
  const next = !current
  setActive(tag.id, next)
  toggleGroup(tag.calendarIds, next)
}

</script>

<template>
  <TaggleCard :is-dark="isDark">
    <TagHeader :count="tags.length" :is-dark="isDark" @manage="openSidePanel" />
    <TagList :tags="sortedTags" :active-map="activeTagMap" :is-dark="isDark" @toggle="toggleTag" />
  </TaggleCard>
</template>
