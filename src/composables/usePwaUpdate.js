import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

const updateAvailable = ref(false)
let updateServiceWorker = null

export function registerPwa() {
  if (updateServiceWorker) return

  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateAvailable.value = true
    },
  })
}

function applyUpdate() {
  updateAvailable.value = false
  updateServiceWorker?.(true)
}

function dismissUpdate() {
  updateAvailable.value = false
}

export function usePwaUpdate() {
  return { updateAvailable, applyUpdate, dismissUpdate }
}
