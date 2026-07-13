import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { registerSW } from 'virtual:pwa-register'
import './styles.css'
import './styles/minigames.css'
import './styles/responsive.css'
import './styles/cohesion.css'
import './styles/focus.css'
import './styles/ux-polish.css'

registerSW({ immediate: true })
createApp(App).use(router).mount('#app')
