import { createApp } from 'vue'
import App from '../../sidepanel/App.vue'
import '../../sidepanel/styles.css'

const app = createApp(App)
app.mount('#app')

const port = chrome.runtime.connect({ name: 'sidepanel' })

if (chrome?.windows) {
  chrome.windows.getCurrent((win) => {
    if (win?.id !== undefined) {
      port.postMessage({ type: 'SIDEPANEL_INIT', windowId: win.id })
    }
  })
}
