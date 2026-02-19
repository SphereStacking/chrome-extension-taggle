import { onMounted, onUnmounted, ref } from 'vue'

function detectGCalDarkMode(): boolean {
  const body = document.body
  const bgColor = getComputedStyle(body).backgroundColor
  const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) {
    const [, r, g, b] = match.map(Number)
    if (r < 50 && g < 50 && b < 50) return true
  }
  if (body.classList.contains('dark') || body.getAttribute('data-theme') === 'dark') return true
  if (document.documentElement.getAttribute('data-darkreader-scheme') === 'dark') return true
  return false
}

export function useTheme() {
  const osPrefersDark = window.matchMedia('(prefers-color-scheme: dark)')
  const isDark = ref(osPrefersDark.matches || detectGCalDarkMode())

  const handleMediaChange = (event: MediaQueryListEvent) => {
    isDark.value = event.matches || detectGCalDarkMode()
  }

  let observer: MutationObserver | undefined

  onMounted(() => {
    osPrefersDark.addEventListener('change', handleMediaChange)

    observer = new MutationObserver(() => {
      isDark.value = osPrefersDark.matches || detectGCalDarkMode()
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme']
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-darkreader-scheme', 'class']
    })
  })

  onUnmounted(() => {
    osPrefersDark.removeEventListener('change', handleMediaChange)
    observer?.disconnect()
  })

  return { isDark }
}
