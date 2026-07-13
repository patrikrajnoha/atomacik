<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import appContent from '../content/appContent.json'
import { useGameAudio } from '../composables/useGameAudio'

const props = defineProps({
  selectedSample: { type: Number, required: true },
  game: { type: Object, required: true },
})

const emit = defineEmits(['mark-analyzed', 'navigate', 'open-spectrometer'])
const content = appContent.spectrometer
const { playGameSound } = useGameAudio()
const peaks = content.peaks.map((peak) => ({ ...peak, ...content.peakPositions[peak.id] }))

const scanStarted = ref(false)
const scanProgress = ref(0)
const selectedPeaks = ref([])
const csChecked = ref(false)
const decision = ref('')
const activeMessage = ref('Vlož vzorku a spusti skenovanie. Spektrometer vykreslí energetický podpis látok vo vode.')
const elapsedSeconds = ref(0)
const mistakes = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const skipped = ref(false)
const skipConfirm = ref(false)
const autoAdvancing = ref(false)
const nextDestination = ref('')
let analysisTimer = null
let scanTimer = null

const alreadyAnalyzed = computed(() => props.game.analyzed[props.selectedSample - 1])
const batchStart = computed(() => props.selectedSample % 2 === 0 ? props.selectedSample - 1 : props.selectedSample)
const batchLabel = computed(() => `${batchStart.value}–${batchStart.value + 1}`)
const scanComplete = computed(() => scanProgress.value >= 100)
const naturalPeaks = computed(() => peaks.filter((peak) => peak.found))
const foundNaturalPeaks = computed(() => naturalPeaks.value.every((peak) => selectedPeaks.value.includes(peak.id)))
const correctDecision = computed(() => decision.value === 'not-found')
const complete = computed(() => scanComplete.value && foundNaturalPeaks.value && csChecked.value && correctDecision.value)
const analyzedCount = computed(() => props.game.analyzed.filter(Boolean).length)
const difficulty = computed(() => analyzedCount.value >= 4 ? { label: 'Expert', seconds: 70 } : analyzedCount.value >= 2 ? { label: 'Výskumník', seconds: 90 } : { label: 'Začiatočník', seconds: 110 })
const timeRemaining = computed(() => Math.max(0, difficulty.value.seconds - elapsedSeconds.value))
const analysisScore = computed(() => skipped.value ? 0 : Math.max(100, 1200 + timeRemaining.value * 4 + maxCombo.value * 30 - mistakes.value * 180))
const scanStatus = computed(() => {
  if (complete.value || alreadyAnalyzed.value) return 'Analýza uzavretá'
  if (!scanStarted.value) return 'Vzorka pripravená'
  if (!scanComplete.value) return `Skenovanie ${scanProgress.value}%`
  if (!foundNaturalPeaks.value || !csChecked.value) return 'Označ tri kontrolné oblasti'
  return 'Vyber záver merania'
})

watch(() => props.selectedSample, resetLabMiniGame)
onMounted(resetLabMiniGame)
onBeforeUnmount(() => {
  stopAnalysisTimer()
  stopScan()
})

function startAnalysisTimer() {
  stopAnalysisTimer()
  if (alreadyAnalyzed.value) return
  analysisTimer = window.setInterval(() => { elapsedSeconds.value += 1 }, 1000)
}

function stopAnalysisTimer() {
  if (!analysisTimer) return
  window.clearInterval(analysisTimer)
  analysisTimer = null
}

function stopScan() {
  if (!scanTimer) return
  window.clearInterval(scanTimer)
  scanTimer = null
}

function resetLabMiniGame() {
  stopScan()
  selectedPeaks.value = alreadyAnalyzed.value ? naturalPeaks.value.map((peak) => peak.id) : []
  csChecked.value = alreadyAnalyzed.value
  decision.value = alreadyAnalyzed.value ? 'not-found' : ''
  scanStarted.value = alreadyAnalyzed.value
  scanProgress.value = alreadyAnalyzed.value ? 100 : 0
  activeMessage.value = alreadyAnalyzed.value
    ? 'Táto vzorka už bola vyhodnotená. Cézium-137 nebolo potvrdené.'
    : 'Vlož vzorku a spusti skenovanie. Spektrometer vykreslí energetický podpis látok vo vode.'
  elapsedSeconds.value = 0
  mistakes.value = 0
  combo.value = 0
  maxCombo.value = 0
  skipped.value = false
  skipConfirm.value = false
  autoAdvancing.value = false
  nextDestination.value = ''
  startAnalysisTimer()
}

function registerStep(correct) {
  if (correct) {
    combo.value += 1
    maxCombo.value = Math.max(maxCombo.value, combo.value)
    playGameSound(combo.value >= 3 ? 'reward' : 'pop')
  } else {
    combo.value = 0
    mistakes.value += 1
    playGameSound('error')
  }
}

function startScan() {
  if (scanStarted.value || alreadyAnalyzed.value) return
  scanStarted.value = true
  scanProgress.value = 1
  activeMessage.value = 'Detektor prechádza energetické pásmo. Sleduj, ako sa skladá spektrum vzorky.'
  playGameSound('click')
  scanTimer = window.setInterval(() => {
    scanProgress.value = Math.min(100, scanProgress.value + 2)
    if (scanProgress.value >= 100) {
      stopScan()
      activeMessage.value = 'Sken je hotový. Označ píky prírodného pozadia a skontroluj oblasť Cs-137.'
      playGameSound('success')
    }
  }, 34)
}

function inspectPeak(peak) {
  if (!scanComplete.value || complete.value || alreadyAnalyzed.value) return
  if (peak.found) {
    if (!selectedPeaks.value.includes(peak.id)) {
      selectedPeaks.value.push(peak.id)
      registerStep(true)
    }
    activeMessage.value = peak.message
    return
  }
  if (!csChecked.value) registerStep(true)
  csChecked.value = true
  activeMessage.value = peak.message
}

function makeDecision(value) {
  if (!foundNaturalPeaks.value || !csChecked.value || complete.value) return
  decision.value = value
  const correct = value === 'not-found'
  registerStep(correct)
  activeMessage.value = correct
    ? 'Správne. Vidíš prirodzené kontrolné píky, ale v oblasti Cs-137 nie je signál nad hranicou detekcie.'
    : 'Pozor: označená oblasť Cs-137 nemá merateľný pík. Neprítomnosť píku nemožno zapísať ako nález.'
  if (correct) {
    stopAnalysisTimer()
    playGameSound('reward')
    emit('mark-analyzed', props.selectedSample)
    scheduleLabAdvance()
  }
}

function scheduleLabAdvance() {
  if (autoAdvancing.value) return
  const nextSample = [1, 2, 3, 4, 5, 6].find((sample) => !props.game.analyzed[sample - 1])
  const nextBatchStart = nextSample && nextSample % 2 === 0 ? nextSample - 1 : nextSample
  nextDestination.value = nextSample ? `Dvojica vzoriek ${nextBatchStart}–${nextBatchStart + 1}` : 'Výsledky merania'
  autoAdvancing.value = true
}

function continueLabAdvance() {
  const nextSample = [1, 2, 3, 4, 5, 6].find((sample) => !props.game.analyzed[sample - 1])
  autoAdvancing.value = false
  if (nextSample) emit('open-spectrometer', nextSample)
  else emit('navigate', 'results')
}

function finishAnalysis() {
  if (!complete.value && !alreadyAnalyzed.value) return
  if (!alreadyAnalyzed.value) emit('mark-analyzed', props.selectedSample)
  stopAnalysisTimer()
  emit('navigate', 'lab')
}

function skipAnalysis() {
  if (!skipConfirm.value) {
    skipConfirm.value = true
    activeMessage.value = 'Preskočením nezískaš XP, skóre ani časový bonus. Stlač tlačidlo ešte raz na potvrdenie.'
    return
  }
  skipped.value = true
  stopAnalysisTimer()
  stopScan()
  if (!alreadyAnalyzed.value) emit('mark-analyzed', props.selectedSample, { skipped: true })
  scheduleLabAdvance()
}
</script>

<template>
  <section class="content-section spectrometer-game">
    <div class="section-heading">
      <div>
        <p class="eyebrow">LABORATÓRNY DETEKTÍV</p>
        <h1>{{ content.title.replace('{sample}', batchLabel) }}</h1>
        <p class="lead">Dve vzorky vyhodnotíš v jednom meraní. Skontroluj tri oblasti spektra a vyber záver, ktorý zodpovedá výsledku.</p>
      </div>
      <span class="scan-status" :class="{ done: complete || alreadyAnalyzed }">{{ scanStatus }}</span>
    </div>

    <div class="mission-hud analysis-hud" aria-label="Hodnotenie laboratórnej analýzy">
      <div>
        <span class="mission-hud-label">MISIA: PREČÍTAJ SPEKTRUM</span>
        <strong>Nájdi prirodzené kontrolné píky a over oblasť cézia-137.</strong>
      </div>
      <div class="mission-hud-score">
        <span class="mission-hud-meta"><b>⏱ {{ timeRemaining }} s</b><b>{{ difficulty.label }}</b><b v-if="combo >= 2" class="combo-chip">{{ combo }}× séria</b></span>
        <span>{{ analysisScore }} bodov</span>
      </div>
    </div>

    <div class="scan-workbench">
      <aside class="sample-loader">
        <div class="scan-vial" :class="{ loaded: scanStarted }"><span></span><strong>VZ-{{ batchLabel }}</strong></div>
        <div class="scanner-slot" :class="{ active: scanStarted && !scanComplete, ready: scanComplete }"><i></i><span>{{ scanStarted ? 'VZORKA V DETEKTORE' : 'ČAKÁ NA VZORKU' }}</span></div>
        <button class="primary-button scan-button" type="button" :disabled="scanStarted" @click="startScan">{{ scanStarted ? 'Sken spustený' : 'Spustiť sken' }}</button>
      </aside>

      <div class="spectrum-console" :class="{ scanning: scanStarted && !scanComplete, ready: scanComplete }">
        <div class="scan-progress"><i :style="{ width: `${scanProgress}%` }"></i><span>{{ scanProgress }}%</span></div>
        <svg viewBox="0 0 620 260" class="spectrum-chart" role="img" :aria-label="content.ui.chartAria">
          <line class="axis" x1="50" y1="220" x2="580" y2="220" />
          <line class="axis" x1="50" y1="40" x2="50" y2="220" />
          <polyline v-if="scanStarted" class="spectrum-line" points="60,216 96,212 122,205 150,104 178,206 230,211 282,204 310,128 340,204 398,214 442,210 470,172 498,210 560,216" />
          <line v-if="scanStarted && !scanComplete" class="scan-beam" :x1="55 + scanProgress * 5.2" y1="38" :x2="55 + scanProgress * 5.2" y2="220" />
          <g v-for="peak in peaks" :key="peak.id" :class="{ hidden: !scanComplete }">
            <g class="peak-button" role="button" :tabindex="scanComplete ? 0 : -1" :aria-label="content.ui.peakAria.replace('{label}', peak.label)" @click="inspectPeak(peak)" @keydown.enter.prevent="inspectPeak(peak)" @keydown.space.prevent="inspectPeak(peak)">
              <circle :class="['peak-target', { selected: selectedPeaks.includes(peak.id) || (peak.id === 'cs' && csChecked), muted: !peak.found }]" :cx="peak.x" :cy="220 - peak.height" r="18" />
            </g>
            <text class="peak-label" :x="peak.x" y="246" text-anchor="middle">{{ peak.label }}</text>
          </g>
        </svg>
        <div class="detector-message" aria-live="polite">{{ activeMessage }}</div>
      </div>
    </div>

    <div v-if="scanComplete" class="evidence-board">
      <span v-for="peak in peaks" :key="peak.id" :class="{ checked: selectedPeaks.includes(peak.id) || (peak.id === 'cs' && csChecked) }">
        <b>{{ peak.label }}</b><small>{{ peak.found ? (selectedPeaks.includes(peak.id) ? 'pík potvrdený' : 'označ pík') : (csChecked ? 'bez merateľného píku' : 'skontroluj oblasť') }}</small>
      </span>
    </div>

    <div v-if="foundNaturalPeaks && csChecked" class="scientific-decision">
      <div><p class="eyebrow">VEDECKÝ ZÁVER</p><h2>Čo ukazuje toto spektrum?</h2></div>
      <button type="button" :class="{ wrong: decision === 'found' }" @click="makeDecision('found')">Cs-137 bolo zachytené</button>
      <button type="button" :class="{ correct: decision === 'not-found' }" @click="makeDecision('not-found')">Cs-137 nebolo zachytené</button>
    </div>

    <div v-if="complete || alreadyAnalyzed" class="completion-feedback analysis-feedback">
      <span>Analýza vzorky je uzavretá</span>
      <strong>Prirodzené kontrolné píky potvrdené · Cs-137 nezachytené</strong>
      <div v-if="!alreadyAnalyzed" class="reward-line"><b>{{ content.reward.xp }}</b><b>{{ analysisScore }} bodov</b><b>Najlepšia séria {{ maxCombo }}×</b></div>
    </div>

    <Transition name="mission-advance">
      <div v-if="autoAdvancing" class="auto-advance-card lab-advance" role="status">
        <span class="advance-icon">✓</span>
        <div>
          <small>ANALÝZA DOKONČENÁ</small>
          <strong>Ďalej: {{ nextDestination }}</strong>
          <span>Pokračuj, keď budeš pripravený.</span>
        </div>
        <button class="primary-button" type="button" @click="continueLabAdvance">Pokračovať</button>
      </div>
    </Transition>

    <div class="button-row">
      <button class="primary-button" type="button" :disabled="!complete && !alreadyAnalyzed" @click="finishAnalysis">{{ alreadyAnalyzed ? content.buttons.alreadyDone : content.buttons.finish }}</button>
      <button v-if="!complete && !alreadyAnalyzed" class="secondary-button skip-game-button" :class="{ confirming: skipConfirm }" type="button" @click="skipAnalysis">{{ skipConfirm ? 'Potvrdiť preskočenie' : 'Preskočiť minihru' }}</button>
      <button class="secondary-button" type="button" @click="$emit('navigate', 'lab')">{{ content.buttons.backLab }}</button>
    </div>
  </section>
</template>
