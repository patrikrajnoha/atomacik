<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GameIcons from '../components/GameIcons.vue'
import appContent from '../content/appContent.json'
import { useGameAudio } from '../composables/useGameAudio'

const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
  location: {
    type: Object,
    default: null,
  },
  collectedCount: {
    type: Number,
    required: true,
  },
  labUnlocked: {
    type: Boolean,
    required: true,
  },
  rank: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['open-sample', 'navigate'])

const content = computed(() => appContent.map)
const { playGameSound } = useGameAudio()
const wells = [
  { id: 1, x: 15, y: 26, clue: 'pri lúke' },
  { id: 2, x: 34, y: 58, clue: 'za mostíkom' },
  { id: 3, x: 52, y: 25, clue: 'pri sade' },
  { id: 4, x: 72, y: 47, clue: 'pri ceste' },
  { id: 5, x: 23, y: 76, clue: 'na okraji obce' },
  { id: 6, x: 85, y: 72, clue: 'pri poli' },
]
const nextWell = computed(() => wells.find((well) => !props.game.collected[well.id - 1])?.id ?? null)
const labUnlocking = ref(false)
const lockedPulse = ref(false)
let unlockTimer = null
let lockedTimer = null

onMounted(() => {
  if (!props.labUnlocked || window.sessionStorage.getItem('atomacik-lab-unlock-seen-v2')) return
  labUnlocking.value = true
  playGameSound('fanfare')
  window.sessionStorage.setItem('atomacik-lab-unlock-seen-v2', 'true')
  unlockTimer = window.setTimeout(() => {
    labUnlocking.value = false
    emit('navigate', 'lab')
  }, 3000)
})

onBeforeUnmount(() => {
  if (unlockTimer) window.clearTimeout(unlockTimer)
  if (lockedTimer) window.clearTimeout(lockedTimer)
})

function openLab() {
  if (props.labUnlocked) {
    emit('navigate', 'lab')
    return
  }
  lockedPulse.value = false
  playGameSound('error')
  window.requestAnimationFrame(() => { lockedPulse.value = true })
  if (lockedTimer) window.clearTimeout(lockedTimer)
  lockedTimer = window.setTimeout(() => { lockedPulse.value = false }, 900)
}
</script>

<template>
  <section class="map-screen">
    <div v-if="!location" class="locked-panel">
      <p>{{ content.locked.text }}</p>
      <button class="primary-button" type="button" @click="$emit('navigate', 'location')">{{ content.locked.button }}</button>
    </div>

    <template v-else>
      <div class="section-heading">
        <div>
          <p class="eyebrow">{{ content.eyebrow.replace('{locationTitle}', location.title) }}</p>
          <h1>{{ content.title }}</h1>
          <p class="lead">{{ location.intro }}</p>
        </div>
        <div class="progress-card">
          <span>{{ rank }}</span>
          <strong>{{ content.rankLabel.replace('{collectedCount}', collectedCount) }}</strong>
        </div>
      </div>

      <div class="mission-map expedition-map" :class="{ 'lab-unlocking': labUnlocking }" aria-label="Mapa s elektrárňou, laboratóriom a studňami">
        <div class="map-place plant-place">
          <GameIcons name="plant" />
          <span>{{ location.plantLabel }}</span>
        </div>

        <button
          class="map-place lab-place"
          type="button"
          :class="{ locked: !labUnlocked, shaking: lockedPulse, unlocking: labUnlocking }"
          :aria-disabled="!labUnlocked"
          @click="openLab"
          :aria-label="labUnlocked ? content.lab.ariaUnlocked : content.lab.ariaLocked"
        >
          <GameIcons name="lab" />
          <span>{{ labUnlocked ? content.lab.unlock : content.lab.locked }}</span>
        </button>

        <button
          v-for="well in wells"
          :key="well.id"
          type="button"
          class="well-dot"
          :class="{ collected: game.collected[well.id - 1], next: nextWell === well.id }"
          :style="{ left: `${well.x}%`, top: `${well.y}%` }"
          @click="$emit('open-sample', well.id)"
        >
          <GameIcons name="well" />
          <span>{{ content.wellLabel.replace('{id}', well.id) }}</span>
          <small>{{ game.collected[well.id - 1] ? content.wellStates.collected : well.clue }}</small>
        </button>
      </div>

      <Teleport to="#notification-stack">
        <Transition name="mission-advance">
          <div v-if="labUnlocking" class="lab-unlock-banner" role="status">
            <GameIcons name="lab" />
            <div><small>NOVÁ OBLASŤ ODOMKNUTÁ</small><strong>Laboratórium je pripravené</strong><span>Vzorky sa presúvajú na analýzu…</span></div>
            <i><b></b></i>
          </div>
        </Transition>
      </Teleport>

      <p v-if="lockedPulse" class="map-lock-hint">Laboratórium odomkneš po odobratí všetkých 6 vzoriek.</p>

      <button v-else class="primary-button centered-action" type="button" @click="$emit('navigate', 'lab')">
        {{ content.action }}
      </button>
    </template>
  </section>
</template>
