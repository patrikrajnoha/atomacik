import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { registerPwa } from './composables/usePwaUpdate'
import './styles.css'
import './styles/minigames.css'
import './styles/responsive.css'
import './styles/cohesion.css'
import './styles/focus.css'
import './styles/ux-polish.css'

registerPwa()
createApp(App).use(router).mount('#app')
