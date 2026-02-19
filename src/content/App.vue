<script setup lang="ts">
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
    <TagList :tags="tags" :active-map="activeTagMap" :is-dark="isDark" @toggle="toggleTag" />
  </TaggleCard>
</template>
