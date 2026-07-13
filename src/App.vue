<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from './components/AppShell.vue'
import appContent from './content/appContent.json'
import { useGameAudio } from './composables/useGameAudio'
import {
  GAMEPLAY_SCREENS,
  SAVE_VERSION,
  canAwardActivity,
  normalizeBooleanArray,
  normalizeRewardedActivities,
  normalizeXp,
  resolveResumeScreen,
  resolveSavedScreen,
} from './game/rules'

const content = appContent
const { playGameSound } = useGameAudio()
const route = useRoute()
const router = useRouter()

const screens = {
  home: defineAsyncComponent(() => import('./views/HomeView.vue')),
  employee: defineAsyncComponent(() => import('./views/EmployeeSetupView.vue')),
  interview: defineAsyncComponent(() => import('./views/InterviewView.vue')),
  location: defineAsyncComponent(() => import('./views/LocationView.vue')),
  briefing: defineAsyncComponent(() => import('./views/BriefingView.vue')),
  how: defineAsyncComponent(() => import('./views/HowItWorksView.vue')),
  map: defineAsyncComponent(() => import('./views/MapView.vue')),
  sample: defineAsyncComponent(() => import('./views/SampleView.vue')),
  lab: defineAsyncComponent(() => import('./views/LabView.vue')),
  spectrometer: defineAsyncComponent(() => import('./views/SpectrometerView.vue')),
  results: defineAsyncComponent(() => import('./views/ResultsView.vue')),
  conclusion: defineAsyncComponent(() => import('./views/ConclusionView.vue')),
  glossary: defineAsyncComponent(() => import('./views/GlossaryView.vue')),
  profile: defineAsyncComponent(() => import('./views/ProfileView.vue')),
  playlist: defineAsyncComponent(() => import('./views/PlaylistView.vue')),
}

const locations = { ...content.locations }

const currentScreen = computed(() => route.meta.screen || 'home')
const selectedWell = ref(1)
const selectedSample = ref(1)
const rewardEvent = ref(null)
const lastSavedScreen = ref('home')
const STORAGE_KEY = 'atomacik-save-v1'
let rewardTimer = null

const levelThresholds = [
  { level: 1, xp: 0, rank: content.profile.ranks.youngScientist },
  { level: 2, xp: 100, rank: content.profile.ranks.sampleCollector },
  { level: 3, xp: 300, rank: content.profile.ranks.labExplorer },
  { level: 4, xp: 600, rank: content.profile.ranks.fieldExpert },
  { level: 5, xp: 1000, rank: content.profile.ranks.measurementMaster },
  { level: 6, xp: 1500, rank: content.profile.ranks.guardian },
]

const game = reactive({
  locationId: '',
  collected: Array.from({ length: 6 }, () => false),
  analyzed: Array.from({ length: 6 }, () => false),
  xp: 0,
  playerName: content.game.defaults.playerName,
  avatar: content.game.defaults.avatar,
  employeeReady: false,
  interviewPassed: false,
  rewardedActivities: [],
})

loadSavedGame()

const selectedLocation = computed(() => locations[game.locationId] ?? null)
const collectedCount = computed(() => game.collected.filter(Boolean).length)
const analyzedCount = computed(() => game.analyzed.filter(Boolean).length)
const labUnlocked = computed(() => collectedCount.value === 6)
const resultsUnlocked = computed(() => analyzedCount.value === 6)
const resumeScreen = computed(() => resolveResumeScreen(game, lastSavedScreen.value, Object.keys(screens)))
const levelState = computed(() => {
  const currentIndex = levelThresholds.findLastIndex((threshold) => game.xp >= threshold.xp)
  const current = levelThresholds[Math.max(0, currentIndex)]
  const next = levelThresholds[currentIndex + 1] ?? null
  const progress = next ? game.xp - current.xp : 1
  const required = next ? next.xp - current.xp : 1

  return {
    current,
    next,
    progress,
    required,
    percent: Math.min(100, Math.max(0, (progress / required) * 100)),
  }
})
const level = computed(() => levelState.value.current.level)
const levelProgressPercent = computed(() => levelState.value.percent)
const levelProgressText = computed(() => {
  const state = levelState.value
  if (!state.next) return content.profile.maxLevelText

  return content.profile.levelProgress
    .replace('{progress}', state.progress)
    .replace('{required}', state.required)
    .replace('{level}', state.next.level)
})
const rank = computed(() => levelState.value.current.rank)
const badges = computed(() => {
  const unlocked = []
  const addBadge = (id) => unlocked.push({ id, label: content.profile.badges[id] })
  if (game.employeeReady) addBadge('newEmployee')
  if (game.interviewPassed) addBadge('interviewPassed')
  if (game.locationId) addBadge('explorer')
  if (collectedCount.value >= 1) addBadge('firstSample')
  if (collectedCount.value === 6) addBadge('fieldExpert')
  if (analyzedCount.value >= 1) addBadge('spectrometerFriend')
  if (analyzedCount.value === 6) addBadge('masterMeasurements')
  if (resultsUnlocked.value) addBadge('waterGuardian')
  return unlocked
})

function loadSavedGame() {
  if (typeof window === 'undefined') return

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved) return

    game.locationId = locations[saved.game?.locationId] ? saved.game.locationId : ''
    game.collected = normalizeBooleanArray(saved.game?.collected)
    game.analyzed = normalizeBooleanArray(saved.game?.analyzed)
    game.xp = normalizeXp(saved.game?.xp)
    game.playerName = saved.game?.playerName || content.game.defaults.playerName
    game.avatar = ['atom', 'drop', 'cesium'].includes(saved.game?.avatar) ? saved.game.avatar : 'atom'
    game.employeeReady = Boolean(saved.game?.employeeReady)
    game.interviewPassed = Boolean(saved.game?.interviewPassed)
    game.rewardedActivities = normalizeRewardedActivities(saved.game?.rewardedActivities)
    lastSavedScreen.value = saved.resumeScreen || saved.currentScreen || 'home'

    selectedWell.value = Math.min(6, Math.max(1, Number(saved.selectedWell) || 1))
    selectedSample.value = Math.min(6, Math.max(1, Number(saved.selectedSample) || 1))
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

function persistGame() {
  if (typeof window === 'undefined') return

  const save = {
    version: SAVE_VERSION,
    currentScreen: currentScreen.value,
    resumeScreen: lastSavedScreen.value,
    selectedWell: selectedWell.value,
    selectedSample: selectedSample.value,
    game: {
      locationId: game.locationId,
      collected: [...game.collected],
      analyzed: [...game.analyzed],
      xp: game.xp,
      playerName: game.playerName,
      avatar: game.avatar,
      employeeReady: game.employeeReady,
      interviewPassed: game.interviewPassed,
      rewardedActivities: [...game.rewardedActivities],
    },
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
  } catch {
    // The game remains playable when storage is unavailable or full.
  }
}

async function go(screen, replace = false) {
  const destination = resolveSavedScreen(screen, game, Object.keys(screens))
  if (destination !== currentScreen.value) {
    await router[replace ? 'replace' : 'push']({ name: destination })
  }
  await nextTick()
  const heading = document.querySelector('#main-content h1')
  if (heading) {
    heading.setAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
  }
}

function chooseLocation(locationId) {
  if (!locations[locationId]) return
  if (game.locationId === locationId) {
    go('briefing')
    return
  }
  if (game.locationId && game.locationId !== locationId) {
    go('briefing')
    return
  }

  game.locationId = locationId
  game.collected = Array.from({ length: 6 }, () => false)
  game.analyzed = Array.from({ length: 6 }, () => false)
  game.xp += 20
  showReward(content.game.rewards.locationSelected, 20)
  selectedWell.value = 1
  selectedSample.value = 1
  go('briefing')
}

function completeInterview(options = {}) {
  if (!game.interviewPassed && !options.skipped) {
    game.interviewPassed = true
    game.xp += 20
    showReward(content.game.rewards.interviewComplete, 20)
  }
  game.interviewPassed = true
  go('location')
}

function openSample(wellNumber) {
  selectedWell.value = wellNumber
  go('sample')
}

function collectSample(wellNumber, options = {}) {
  if (!game.collected[wellNumber - 1] && !options.skipped) {
    game.xp += 15
    showReward(content.game.rewards.sampleCollected.replace('{number}', wellNumber), 15)
  }
  game.collected[wellNumber - 1] = true
}

function openSpectrometer(sampleNumber) {
  selectedSample.value = sampleNumber
  go('spectrometer')
}

function markAnalyzed(sampleNumber, options = {}) {
  const batchStart = sampleNumber % 2 === 0 ? sampleNumber - 1 : sampleNumber
  const batch = [batchStart, batchStart + 1]
  const hasPendingSample = batch.some((number) => !game.analyzed[number - 1])
  if (hasPendingSample && !options.skipped) {
    game.xp += 20
    showReward(content.game.rewards.analysisComplete.replace('{number}', `${batchStart}–${batchStart + 1}`), 20)
  }
  batch.forEach((number) => {
    game.analyzed[number - 1] = true
  })
}

function awardXp(reward) {
  const xp = Number(reward?.xp) || 0
  if (xp <= 0 || !canAwardActivity(game.rewardedActivities, reward?.id)) return
  game.rewardedActivities.push(reward.id)
  game.xp += xp
  showReward(reward.label, xp)
}

function updateProfile(profile) {
  game.playerName = profile.playerName
  game.avatar = profile.avatar
  if (!game.employeeReady) {
    showReward(content.game.rewards.profileCreated, 0)
  }
  game.employeeReady = true
}

function showReward(label, xp = 0) {
  if (typeof window !== 'undefined' && rewardTimer) {
    window.clearTimeout(rewardTimer)
  }

  rewardEvent.value = {
    id: Date.now(),
    label,
    xp,
  }
  playGameSound(xp > 0 ? 'reward' : 'success')

  if (typeof window !== 'undefined') {
    rewardTimer = window.setTimeout(() => {
      rewardEvent.value = null
      rewardTimer = null
    }, 2200)
  }
}

function resetGame() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
  }

  game.locationId = ''
  game.collected = Array.from({ length: 6 }, () => false)
  game.analyzed = Array.from({ length: 6 }, () => false)
  game.xp = 0
  game.playerName = content.game.defaults.playerName
  game.avatar = content.game.defaults.avatar
  game.employeeReady = false
  game.interviewPassed = false
  game.rewardedActivities = []
  lastSavedScreen.value = 'home'
  selectedWell.value = 1
  selectedSample.value = 1
  go('home')
}

onBeforeUnmount(() => {
  if (rewardTimer) window.clearTimeout(rewardTimer)
})

watch([currentScreen, lastSavedScreen, selectedWell, selectedSample, game], persistGame, { deep: true })

watch(currentScreen, (screen) => {
  if (GAMEPLAY_SCREENS.includes(screen)) lastSavedScreen.value = screen
  const allowed = resolveSavedScreen(screen, game, Object.keys(screens))
  if (allowed !== screen) go(allowed, true)
})
</script>

<template>
  <AppShell
    :current-screen="currentScreen"
    :collected-count="collectedCount"
    :analyzed-count="analyzedCount"
    :location="selectedLocation"
    :xp="game.xp"
    :player-name="game.playerName"
    :avatar="game.avatar"
    :level="level"
    :rank="rank"
    :reward="rewardEvent"
    :lab-unlocked="labUnlocked"
    :results-unlocked="resultsUnlocked"
    @navigate="go"
  >
    <Transition name="screen-shift" mode="out-in">
    <component
      :is="screens[currentScreen]"
      :key="currentScreen"
      :game="game"
      :locations="locations"
      :location="selectedLocation"
      :selected-well="selectedWell"
      :selected-sample="selectedSample"
      :collected-count="collectedCount"
      :analyzed-count="analyzedCount"
      :lab-unlocked="labUnlocked"
      :results-unlocked="resultsUnlocked"
      :rank="rank"
      :level="level"
      :level-progress-percent="levelProgressPercent"
      :level-progress-text="levelProgressText"
      :badges="badges"
      v-bind="currentScreen === 'home' ? { resumeScreen } : {}"
      @navigate="go"
      @choose-location="chooseLocation"
      @complete-interview="completeInterview"
      @open-sample="openSample"
      @collect-sample="collectSample"
      @open-spectrometer="openSpectrometer"
      @mark-analyzed="markAnalyzed"
      @update-profile="updateProfile"
      @award-xp="awardXp"
      @reset="resetGame"
    />
    </Transition>
  </AppShell>
</template>
