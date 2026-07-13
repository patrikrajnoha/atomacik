<script setup>
import { computed, onMounted, ref } from 'vue'
import AtomMascot from '../components/AtomMascot.vue'
import appContent from '../content/appContent.json'

const props = defineProps({
  game: { type: Object, required: true },
  collectedCount: { type: Number, required: true },
  analyzedCount: { type: Number, required: true },
  resumeScreen: { type: String, default: 'employee' },
})

const emit = defineEmits(['navigate', 'reset'])

const content = computed(() => appContent.home)
const firstVisit = ref(false)
const resetConfirm = ref(false)
const hasProgress = computed(() => Boolean(
  props.game.employeeReady || props.game.interviewPassed || props.game.locationId || props.game.xp,
))
const progressText = computed(() => {
  if (props.analyzedCount > 0) return content.value.progress.analysis.replace('{count}', props.analyzedCount)
  if (props.collectedCount > 0) return content.value.progress.samples.replace('{count}', props.collectedCount)
  if (props.game.locationId) return content.value.progress.mission
  return content.value.progress.onboarding
})

onMounted(() => {
  firstVisit.value = !window.sessionStorage.getItem('atomacik-home-intro-v2')
  window.sessionStorage.setItem('atomacik-home-intro-v2', 'true')
})

function startOrResume() {
  emit('navigate', hasProgress.value ? props.resumeScreen : 'employee')
}

function requestNewGame() {
  if (!resetConfirm.value) {
    resetConfirm.value = true
    return
  }
  resetConfirm.value = false
  emit('reset')
}
</script>

<template>
  <section class="hero-screen" :class="{ 'first-visit-intro': firstVisit && !hasProgress }">
    <div class="hero-copy">
      <p class="eyebrow">{{ content.eyebrow }}</p>
      <h1>{{ content.title }}</h1>
      <p class="hero-text">
        {{ content.heroText }}
      </p>

      <p v-if="hasProgress" class="resume-note"><strong>{{ content.resumeTitle }}</strong> {{ progressText }}</p>

      <div class="button-row">
        <button class="primary-button" type="button" @click="startOrResume">{{ hasProgress ? content.buttons.resume : content.buttons.start }}</button>
        <button v-if="hasProgress" class="secondary-button new-game-button" :class="{ confirming: resetConfirm }" type="button" @click="requestNewGame">
          {{ resetConfirm ? content.buttons.confirmNew : content.buttons.newGame }}
        </button>
        <button class="secondary-button" type="button" @click="$emit('navigate', 'how')">{{ content.buttons.how }}</button>
      </div>
    </div>

    <AtomMascot />
  </section>
</template>
