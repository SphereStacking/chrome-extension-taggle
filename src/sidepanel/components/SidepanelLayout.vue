<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<template>
  <div class="flex min-h-[calc(100vh-2rem)] flex-col gap-4">
    <div class="flex-1">
      <slot />
    </div>
    <footer class="mt-auto flex items-center justify-between sp-muted">
      <a
        class="flex items-center gap-0.5 text-[10px] sp-muted hover:text-slate-900 dark:hover:text-white"
        href="https://www.spherestacking.com/"
        target="_blank"
        rel="noreferrer"
      >
        <Icon icon="mdi:copyright" class="text-xs" />
        SphereStacking
      </a>
      <div class="flex items-center gap-2">
        <a
          class="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          href="https://github.com/SphereStacking/chrome-extension-taggle"
          target="_blank"
          rel="noreferrer"
        >
          <Icon icon="mdi:github" class="text-base" />
        </a>
        <a
          class="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          href="https://ko-fi.com/spherestacking"
          target="_blank"
          rel="noreferrer"
        >
          <Icon icon="simple-icons:kofi" class="text-sm" />
        </a>
      </div>
    </footer>
  </div>
</template>
