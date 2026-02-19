<script setup lang="ts">
import { ref } from 'vue'
import TagListView from './views/TagListView.vue'
import TagFormView from './views/TagFormView.vue'
import SidepanelLayout from './components/SidepanelLayout.vue'
import { useTheme } from '../shared/composables/useTheme'
import type { TagItem } from '../shared/types'

const { isDark } = useTheme()

const view = ref<'list' | 'form'>('list')
const formMode = ref<'create' | 'edit'>('create')
const editTarget = ref<TagItem | null>(null)

function openCreate() {
  formMode.value = 'create'
  editTarget.value = null
  view.value = 'form'
}

function openEdit(tag: TagItem) {
  formMode.value = 'edit'
  editTarget.value = tag
  view.value = 'form'
}

function closeForm() {
  view.value = 'list'
  editTarget.value = null
}
</script>

<template>
  <div :class="{ dark: isDark }">
    <div class="min-h-screen w-full p-4 sp-bg sp-text sp-fade-in">
      <SidepanelLayout>
        <TagListView v-if="view === 'list'" @create="openCreate" @edit="openEdit" />
        <TagFormView v-else :mode="formMode" :tag="editTarget" @close="closeForm" />
      </SidepanelLayout>
    </div>
  </div>
</template>
