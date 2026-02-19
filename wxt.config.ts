import { defineConfig } from 'wxt'

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  srcDir: '.',
  entrypointsDir: 'src/entrypoints',
  manifest: {
    manifest_version: 3,
    name: 'Taggle for Google Calendar',
    description: 'Tag & group Google Calendar calendars, toggle visibility in bulk. Googleカレンダーのカレンダーをタグでグループ化し一括表示切替。',
    icons: {
      '16': 'icon-16.png',
      '32': 'icon-32.png',
      '48': 'icon-48.png',
      '128': 'icon-128.png'
    },
    permissions: ['storage', 'activeTab', 'scripting', 'sidePanel'],
    host_permissions: ['https://calendar.google.com/*'],
    action: {
      default_title: 'Taggle for Google Calendar',
      default_icon: {
        '16': 'icon-16.png',
        '32': 'icon-32.png',
        '48': 'icon-48.png',
        '128': 'icon-128.png'
      }
    },
    side_panel: {
      default_path: 'sidepanel.html'
    }
  }
})
