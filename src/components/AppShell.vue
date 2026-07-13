<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AvatarVisual from './AvatarVisual.vue'
import AtomacikLogo from './AtomacikLogo.vue'
import appContent from '../content/appContent.json'

const props = defineProps({
  currentScreen: { type: String, required: true },
  collectedCount: { type: Number, required: true },
  analyzedCount: { type: Number, required: true },
  location: { type: Object, default: null },
  xp: { type: Number, required: true },
  playerName: { type: String, required: true },
  avatar: { type: String, required: true },
  level: { type: Number, required: true },
  rank: { type: String, required: true },
  reward: { type: Object, default: null },
  labUnlocked: { type: Boolean, required: true },
  resultsUnlocked: { type: Boolean, required: true },
})

const emit = defineEmits(['navigate'])

const content = computed(() => appContent.appShell)
const menuOpen = ref(false)
const playlistStarted = ref(false)
const playerDockOpen = ref(false)
const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
const navItems = computed(() => {
  if (!props.location) {
    return [
      { screen: 'employee', label: content.value.nav.employee, activeScreens: ['home', 'employee', 'interview', 'location'] },
      { screen: 'glossary', label: content.value.nav.glossary, activeScreens: ['glossary'] },
      { screen: 'playlist', label: content.value.nav.playlist, activeScreens: ['playlist'] },
    ]
  }

  const items = [
    { screen: 'map', label: content.value.nav.map, activeScreens: ['briefing', 'map', 'sample'] },
    { screen: 'lab', label: content.value.nav.lab, activeScreens: ['lab', 'spectrometer'], disabled: !props.labUnlocked },
  ]

  if (props.resultsUnlocked) {
    items.push({ screen: 'results', label: content.value.nav.results, activeScreens: ['results', 'conclusion'] })
  }

  items.push({ screen: 'glossary', label: content.value.nav.glossary, activeScreens: ['glossary'] })
  items.push({ screen: 'playlist', label: content.value.nav.playlist, activeScreens: ['playlist'] })
  return items
})

const missionLabel = computed(() => {
  if (!props.location) return content.value.missionLabels.default
  if (props.resultsUnlocked) return content.value.missionLabels.resultsUnlocked
  if (props.labUnlocked) return content.value.missionLabels.labUnlocked
  return content.value.missionLabels.defaultMission
})

watch(
  () => props.currentScreen,
  (screen) => {
    menuOpen.value = false
    if (screen === 'playlist') {
      playlistStarted.value = true
      playerDockOpen.value = false
    }
  },
  { immediate: true },
)

function updateOnlineStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

function isActive(item) {
  return item.activeScreens.includes(props.currentScreen)
}

function navigate(item) {
  if (item.disabled) return
  menuOpen.value = false
  emit('navigate', item.screen)
}

function navigateTo(screen) {
  menuOpen.value = false
  emit('navigate', screen)
}

</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Preskočiť na hlavný obsah</a>
    <div class="game-atmosphere" aria-hidden="true">
      <i></i><i></i><i></i><i></i><i></i>
    </div>
    <header class="topbar" aria-label="Hlavná navigácia">
      <button class="brand-button" type="button" @click="navigateTo('home')" :aria-label="content.brandAria">
        <span class="brand-mark"><AtomacikLogo /></span>
        <span>Atómáčik</span>
      </button>

      <button
        class="menu-toggle"
        :class="{ open: menuOpen }"
        type="button"
        aria-controls="mobile-navigation"
        :aria-expanded="menuOpen"
        :aria-label="menuOpen ? 'Zavrieť menu' : 'Otvoriť menu'"
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span><span></span>
      </button>

      <nav id="mobile-navigation" class="nav-links" :class="{ 'is-open': menuOpen }" aria-label="Herné kroky">
        <button
          v-for="item in navItems"
          :key="item.screen"
          type="button"
          :class="{ active: isActive(item) }"
          :disabled="item.disabled"
          @click="navigate(item)"
        >
          {{ item.label }}
        </button>
      </nav>

      <div class="status-strip" aria-label="Postup hry">
        <button class="player-chip" type="button" @click="navigateTo('profile')">
          <AvatarVisual :type="avatar" />
          <span>
            <strong>{{ playerName }}</strong>
            <small>{{ content.status.levelPrefix }} {{ level }} - {{ xp }} {{ content.status.xpSuffix }}</small>
          </span>
        </button>

        <div v-if="location" class="mission-chip">
          <strong>{{ missionLabel }}</strong>
          <div class="mission-dots" aria-label="Vzorky a merania">
            <i
              v-for="sample in 6"
              :key="sample"
              :class="{ done: sample <= collectedCount, analyzed: sample <= analyzedCount }"
            ></i>
          </div>
        </div>
      </div>
    </header>

    <Teleport to="body">
      <div id="notification-stack" class="notification-stack" aria-label="Herné oznámenia">
        <Transition name="reward-pop">
          <div v-if="reward" :key="reward.id" class="reward-toast" role="status" aria-live="polite">
            <strong>{{ reward.label }}</strong>
            <span v-if="reward.xp"><b>+{{ reward.xp }} XP</b></span>
          </div>
        </Transition>
      </div>
    </Teleport>

    <main id="main-content" tabindex="-1">
      <slot />
    </main>

    <section
      v-if="playlistStarted"
      class="persistent-player"
      :class="{ 'playlist-mode': currentScreen === 'playlist', 'dock-mode': currentScreen !== 'playlist', collapsed: currentScreen !== 'playlist' && !playerDockOpen }"
      :aria-label="content.music.title"
    >
      <button v-if="currentScreen !== 'playlist' && !playerDockOpen" class="player-reveal" type="button" aria-label="Zobraziť prehrávač" @click="playerDockOpen = true">♪</button>
      <div v-if="currentScreen !== 'playlist' && playerDockOpen" class="player-dock-head">
        <button type="button" @click="navigateTo('playlist')">Otvoriť playlist</button>
        <button type="button" aria-label="Skryť prehrávač" @click="playerDockOpen = false">×</button>
      </div>
      <div v-if="!isOnline" class="player-offline" role="status">
        <span aria-hidden="true">↯</span>
        <strong>{{ content.music.offlineTitle }}</strong>
        <p>{{ content.music.offlineBody }}</p>
      </div>
      <iframe
        v-else
        :title="content.music.iframeTitle"
        :src="content.music.embedUrl"
        width="100%"
        :height="currentScreen === 'playlist' ? 352 : 152"
        frameborder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      ></iframe>
    </section>

  </div>
</template>
