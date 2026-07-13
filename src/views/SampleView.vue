<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import GameIcons from '../components/GameIcons.vue'
import MissionHud from '../components/sample/MissionHud.vue'
import WellSwitcher from '../components/sample/WellSwitcher.vue'
import appContent from '../content/appContent.json'
import { useGameAudio } from '../composables/useGameAudio'

const props = defineProps({
  game: { type: Object, required: true },
  location: { type: Object, default: null },
  selectedWell: { type: Number, required: true },
})

const emit = defineEmits(['collect-sample', 'navigate', 'open-sample'])

const content = appContent.sample
const { playGameSound } = useGameAudio()
const missions = Object.fromEntries(content.missions.map((missionItem, index) => [index + 1, missionItem]))
const spots = content.spots
const spotClues = content.spotClues
const pipeControls = content.pipeControls
const routineTasks = content.routineTasks
const routeGrid = content.routeGrid
const routeStart = { row: 1, col: 0 }
const blockedRouteTypes = ['mud', 'leaf', 'outflow', 'water']
const routeMoves = content.routeMoves
const wellNumbers = [1, 2, 3, 4, 5, 6]

const mission = computed(() => missions[props.selectedWell])
const routineTask = computed(() => routineTasks[props.selectedWell])
const isCollected = computed(() => props.game.collected[props.selectedWell - 1])
const locationLabel = computed(() => props.location?.title ?? 'lokalita')
const canReturn = computed(() => completed.value || isCollected.value)
const completedBeforeMission = computed(() => props.game.collected.filter(Boolean).length)
const difficulty = computed(() => {
  if (completedBeforeMission.value >= 4) return { id: 'expert', label: 'Expert', fillMin: 70, fillMax: 78, seconds: 60 }
  if (completedBeforeMission.value >= 2) return { id: 'standard', label: 'Výskumník', fillMin: 68, fillMax: 80, seconds: 75 }
  return { id: 'starter', label: 'Začiatočník', fillMin: 66, fillMax: 82, seconds: 90 }
})
const fillPerfect = computed(() => fillLevel.value >= difficulty.value.fillMin && fillLevel.value <= difficulty.value.fillMax)
const fillStability = computed(() => Math.max(0, Math.min(100, 100 - Math.abs(fillLevel.value - 74) * 5)))
const remainingBubbleCount = computed(() => bubbles.value.filter((item) => item.type === 'bubble').length)
const sensorTurbidity = computed(() => Math.round(sensorDepth.value < 28 ? 72 - sensorDepth.value : sensorDepth.value > 72 ? 18 + (sensorDepth.value - 72) * 2.5 : 8 + Math.abs(sensorDepth.value - 52) * 0.32))
const sensorStability = computed(() => Math.max(0, Math.round(100 - Math.abs(sensorDepth.value - 52) * 2.2)))
const sensorZone = computed(() => sensorDepth.value < 34 ? 'Povrchová vrstva' : sensorDepth.value > 70 ? 'Vrstva sedimentu' : 'Stabilný vodný stĺpec')
const bubbleTiltReady = computed(() => bubbleTilt.value >= 25 && bubbleTilt.value <= 48)
const routeBudget = computed(() => difficulty.value.id === 'expert' ? 5 : 6)
const pipePressure = computed(() => pipeControlStates.value.inlet === 'otvorený' ? (pipeControlStates.value.filter === 'čistý' ? 78 : 96) : 12)
const pipePurity = computed(() => pipeControlStates.value.filter === 'čistý' ? 96 : pipeControlStates.value.filter === 'preplach' ? 58 : 18)
const routineLocationOptions = computed(() => [...new Set([locationLabel.value, ...content.routineLocations])])
const assembledCode = computed(() => selectedCodeParts.value.join('-'))
const sampleStickerText = computed(() => {
  if (routineTask.value.kind === 'identity') return assembledCode.value || content.ui.stickerFallback.replace('{number}', props.selectedWell)
  return routineName.value || content.ui.stickerFallback.replace('{number}', props.selectedWell)
})
const pipeSystemReady = computed(() => pipeControls.every((control) => pipeControlStates.value[control.id] === control.correct))
const timeRemaining = computed(() => Math.max(0, difficulty.value.seconds - elapsedSeconds.value))
const timeBonus = computed(() => (skipped.value ? 0 : timeRemaining.value * 5))
const missionStars = computed(() => (skipped.value ? 0 : Math.max(1, 3 - missionMistakes.value)))
const missionScore = computed(() => skipped.value ? 0 : Math.max(100, 1000 + timeBonus.value + maxCombo.value * 25 - missionMistakes.value * 180 - Math.max(0, missionActions.value - 3) * 20))

function routeIcon(tile, active) {
  if (active) return '🧑'
  switch (tile.type) {
    case 'grass':
      return '🍀'
    case 'bridge':
      return '🌉'
    case 'safe':
      return '🟩'
    case 'sample':
      return '🧪'
    case 'start':
      return '🚩'
    case 'mud':
      return '🥾'
    case 'water':
      return '💧'
    case 'leaf':
      return '🍃'
    case 'outflow':
      return '🚱'
    default:
      return tile.label
  }
}

function routeIconLabel(tile, active) {
  if (active) return 'ty'
  return tile.type === 'safe' ? tile.label : tile.label
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

const routineIsCorrect = computed(() => {
  if (routineTask.value.kind === 'identity') {
    const expectedName = normalizeText(routineTask.value.correctName)
    const enteredName = normalizeText(assembledCode.value)
    const expectedLocation = normalizeText(locationLabel.value)
    const selectedLocation = normalizeText(selectedRoutineLocation.value)
    return enteredName === expectedName && selectedLocation === expectedLocation
  }
  return routineChoice.value === routineTask.value.correct
})

const message = ref('')
const selectedSpot = ref('')
const fillLevel = ref(18)
const pipeControlStates = ref({})
const selectedDepth = ref('')
const sensorDepth = ref(16)
const bubbleTilt = ref(0)
const sedimentDisturbed = ref(false)
const pipeRisk = ref(0)
const bubbles = ref([])
const routePosition = ref({ ...routeStart })
const routeVisited = ref([])
const routeMovesRemaining = ref(6)
const routeRisk = ref(0)
const completed = ref(false)
const routineReady = ref(false)
const routineName = ref('')
const routineChoice = ref('')
const selectedRoutineLocation = ref('')
const routineStickerPlaced = ref(false)
const selectedCodeParts = ref([])
const missionMistakes = ref(0)
const missionActions = ref(0)
const feedbackTone = ref('neutral')
const elapsedSeconds = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const skipped = ref(false)
const skipConfirm = ref(false)
const autoAdvancing = ref(false)
const advanceCountdown = ref(3)
let fillTimer = null
let fillPressStart = 0
let gameTimer = null
let advanceRevealTimer = null
let advanceTimer = null
let advanceCountdownTimer = null

watch(
  () => [props.selectedWell, props.location?.title],
  () => resetMission(),
  { immediate: true },
)

onBeforeUnmount(() => {
  stopFill()
  stopGameTimer()
  clearAdvanceTimers()
})

function resetMission() {
  stopFill()
  clearAdvanceTimers()
  resetProgress()
  completed.value = false
  routineReady.value = isCollected.value
  routineName.value = isCollected.value ? routineTask.value.correctName ?? `Studňa ${props.selectedWell}` : ''
  routineChoice.value = isCollected.value ? routineTask.value.correct ?? '' : ''
  selectedRoutineLocation.value = isCollected.value ? locationLabel.value : ''
  routineStickerPlaced.value = isCollected.value
  selectedCodeParts.value = isCollected.value && routineTask.value.correctName ? routineTask.value.correctName.split('-') : []
  message.value = isCollected.value ? content.messages.completed : mission.value.goal
  missionMistakes.value = 0
  missionActions.value = 0
  feedbackTone.value = 'neutral'
  elapsedSeconds.value = 0
  combo.value = 0
  maxCombo.value = 0
  skipped.value = false
  skipConfirm.value = false
  autoAdvancing.value = false
  startGameTimer()
}

function startGameTimer() {
  stopGameTimer()
  if (isCollected.value) return
  gameTimer = window.setInterval(() => {
    elapsedSeconds.value += 1
  }, 1000)
}

function stopGameTimer() {
  if (!gameTimer) return
  window.clearInterval(gameTimer)
  gameTimer = null
}

function resetProgress() {
  selectedSpot.value = ''
  fillLevel.value = 18
  pipeControlStates.value = Object.fromEntries(pipeControls.map((control) => [control.id, control.initial]))
  selectedDepth.value = ''
  sensorDepth.value = 16
  bubbleTilt.value = 0
  sedimentDisturbed.value = false
  pipeRisk.value = 0
  routePosition.value = { ...routeStart }
  routeVisited.value = [`${routeStart.row}-${routeStart.col}`]
  routeMovesRemaining.value = routeBudget.value
  routeRisk.value = 0
  bubbles.value = content.initialBubbles.map((item) => ({ ...item }))
}

function goToWell(well) {
  if (well !== props.selectedWell) emit('open-sample', well)
}

function finishMiniGame(text) {
  if (isCollected.value || completed.value || routineReady.value) return
  stopFill()
  stopGameTimer()
  routineReady.value = true
  routineName.value = routineTask.value.kind === 'identity' ? '' : `Studňa ${props.selectedWell}`
  selectedRoutineLocation.value = routineTask.value.kind === 'identity' ? '' : locationLabel.value
  message.value = `${text} ${content.messages.miniGameCompleteSuffix}`
  feedbackTone.value = 'success'
  playGameSound('success')
  if (routineTask.value.kind !== 'identity') {
    completed.value = true
    message.value = `${text} Záznam sa automaticky uložil do spoločného terénneho protokolu.`
    emit('collect-sample', props.selectedWell, { skipped: skipped.value })
    scheduleNextMission()
  }
}

function scheduleNextMission() {
  clearAdvanceTimers()
  advanceCountdown.value = 3

  // Let the XP reward finish first so fixed notifications never stack.
  advanceRevealTimer = window.setTimeout(() => {
    autoAdvancing.value = true
    playGameSound('reward')
    advanceCountdownTimer = window.setInterval(() => {
      advanceCountdown.value = Math.max(1, advanceCountdown.value - 1)
    }, 1000)
    advanceTimer = window.setTimeout(continueToNextMission, 3000)
  }, 2300)
}

function clearAdvanceTimers() {
  if (advanceRevealTimer) window.clearTimeout(advanceRevealTimer)
  if (advanceTimer) window.clearTimeout(advanceTimer)
  if (advanceCountdownTimer) window.clearInterval(advanceCountdownTimer)
  advanceRevealTimer = null
  advanceTimer = null
  advanceCountdownTimer = null
}

function continueToNextMission() {
  clearAdvanceTimers()
  autoAdvancing.value = false
  if (props.selectedWell < wellNumbers.length) emit('open-sample', props.selectedWell + 1)
  else emit('navigate', 'map')
}

function registerAction(correct = false) {
  missionActions.value += 1
  if (!correct) {
    missionMistakes.value += 1
    combo.value = 0
    playGameSound('error')
  } else {
    combo.value += 1
    maxCombo.value = Math.max(maxCombo.value, combo.value)
    playGameSound(combo.value >= 3 ? 'reward' : 'pop')
  }
  feedbackTone.value = correct ? 'success' : 'warning'
}

function skipMiniGame() {
  if (!skipConfirm.value) {
    skipConfirm.value = true
    message.value = 'Preskočením nezískaš body ani hviezdy. Stlač tlačidlo ešte raz na potvrdenie.'
    feedbackTone.value = 'warning'
    return
  }
  skipped.value = true
  skipConfirm.value = false
  finishMiniGame('Terénna časť bola preskočená.')
}

function finishRoutine() {
  if (canReturn.value) return
  if (!routineReady.value) {
    message.value = content.messages.routineRequired
    return
  }
  if (!routineIsCorrect.value) {
    message.value = routineTask.value.kind === 'identity' ? content.messages.identityCheck : content.messages.routineCheck
    return
  }
  routineStickerPlaced.value = true
  if (routineTask.value.kind === 'identity') routineName.value = assembledCode.value
  completed.value = true
  message.value = content.messages.marked
  emit('collect-sample', props.selectedWell, { skipped: skipped.value })
  scheduleNextMission()
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function startFill() {
  if (mission.value.kind !== 'fill' || canReturn.value || routineReady.value || fillTimer) return
  fillPressStart = Date.now()
  missionActions.value += 1
  feedbackTone.value = 'neutral'
  message.value = content.messages.fillStart
  fillTimer = window.setInterval(() => {
    fillLevel.value = clamp(fillLevel.value + 2.1, 18, 96)
    if (fillLevel.value >= 96) {
      stopFill()
      fillLevel.value = 18
      missionMistakes.value += 1
      feedbackTone.value = 'warning'
      message.value = content.messages.fillOverflow
    }
  }, 70)
}

function stopFill() {
  if (fillTimer) {
    window.clearInterval(fillTimer)
    fillTimer = null
    fillPressStart = 0
  }
}

function releaseFill() {
  if (mission.value.kind !== 'fill' || canReturn.value || routineReady.value) return
  const pressDuration = fillPressStart ? Date.now() - fillPressStart : 0
  stopFill()

  if (fillPerfect.value) finishMiniGame(content.messages.fillSuccess)
  else {
    if (pressDuration > 0) missionMistakes.value += 1
    feedbackTone.value = 'warning'
    message.value = fillLevel.value < 68 ? content.messages.fillTooLow : content.messages.fillTooHigh
    fillLevel.value = 18
  }
}

function chooseSpot(spot) {
  if (mission.value.kind !== 'spot' || canReturn.value || routineReady.value) return
  selectedSpot.value = spot.id
  registerAction(spot.id === 'clean')
  if (spot.id === 'clean') finishMiniGame(content.messages.spotSuccess)
  else message.value = content.messages.spotWrong.replace('{title}', spot.title).replace('{clue}', spot.clue)
}

function cyclePipeControl(control) {
  if (mission.value.kind !== 'pipes' || canReturn.value || routineReady.value) return

  const currentIndex = control.states.indexOf(pipeControlStates.value[control.id])
  const nextIndex = (Math.max(0, currentIndex) + 1) % control.states.length
  missionActions.value += 1
  pipeControlStates.value = {
    ...pipeControlStates.value,
    [control.id]: control.states[nextIndex],
  }

  if (control.id === 'outlet' && pipeControlStates.value.outlet === 'na zem') {
    pipeRisk.value = Math.min(100, pipeRisk.value + 25)
    registerAction(false)
  } else if (pipeControlStates.value.inlet === 'otvorený' && pipeControlStates.value.filter === 'zanesený') {
    pipeRisk.value = Math.min(100, pipeRisk.value + 15)
    registerAction(false)
  } else {
    playGameSound('click')
  }

  if (pipeSystemReady.value) {
    finishMiniGame(content.messages.pipeSuccess)
  } else {
    feedbackTone.value = pipeControlStates.value[control.id] === control.correct ? 'success' : 'neutral'
    message.value = pipeControlStates.value[control.id] === control.correct ? content.messages.pipeCorrectStep : content.messages.pipeHint
  }
}

function addCodePart(part) {
  if (canReturn.value || selectedCodeParts.value.includes(part)) return
  selectedCodeParts.value = [...selectedCodeParts.value, part]
}

function removeLastCodePart() {
  if (canReturn.value) return
  selectedCodeParts.value = selectedCodeParts.value.slice(0, -1)
}

function clearCodeParts() {
  if (canReturn.value) return
  selectedCodeParts.value = []
}

function confirmDepth() {
  if (mission.value.kind !== 'depth' || canReturn.value || routineReady.value) return
  const correct = sensorDepth.value >= 42 && sensorDepth.value <= 62 && sensorTurbidity.value <= 14
  registerAction(correct)
  if (correct) {
    selectedDepth.value = 'middle'
    finishMiniGame('Sonda potvrdila stabilnú vrstvu s nízkym zákalom.')
  } else {
    message.value = sensorDepth.value < 42
      ? 'Hodnoty pri hladine kolíšu. Posuň sondu hlbšie a sleduj stabilitu aj zákal.'
      : 'Sonda je príliš blízko sedimentu. Posuň ju vyššie, kým zákal neklesne.'
  }
}

function tapBottle() {
  if (mission.value.kind !== 'bubbles' || canReturn.value || routineReady.value) return
  if (bubbleTilt.value > 55) {
    sedimentDisturbed.value = true
    registerAction(false)
    message.value = 'Fľaša je naklonená príliš prudko – sediment sa rozvíril. Vráť ju do bezpečného uhla.'
    return
  }
  if (!bubbleTiltReady.value) {
    registerAction(false)
    message.value = 'Pri tomto uhle bubliny neuniknú. Nakloň fľašu do zeleného pásma a jemne poklep.'
    return
  }
  const nextBubble = bubbles.value.filter((item) => item.type === 'bubble').sort((a, b) => a.y - b.y)[0]
  if (!nextBubble) return
  registerAction(true)
  sedimentDisturbed.value = false
  bubbles.value = bubbles.value.filter((bubble) => bubble.id !== nextBubble.id)
  if (!bubbles.value.some((bubble) => bubble.type === 'bubble')) finishMiniGame(content.messages.bubbleSuccess)
  else message.value = 'Bublina unikla cez hrdlo. Drž bezpečný uhol a pokračuj jemným poklepaním.'
}

function moveRoute(move) {
  if (mission.value.kind !== 'route' || canReturn.value || routineReady.value) return
  if (routeMovesRemaining.value <= 0) {
    registerAction(false)
    routePosition.value = { ...routeStart }
    routeVisited.value = [`${routeStart.row}-${routeStart.col}`]
    routeMovesRemaining.value = routeBudget.value
    routeRisk.value = 0
    message.value = 'Minul si všetky kroky. Trasa sa obnovila – najprv si ju naplánuj.'
    return
  }
  const next = { row: routePosition.value.row + move.dy, col: routePosition.value.col + move.dx }
  const tile = routeGrid[next.row]?.[next.col]
  if (!tile) {
    routeMovesRemaining.value -= 1
    routeRisk.value = Math.min(100, routeRisk.value + 10)
    registerAction(false)
    message.value = content.messages.routeOutside
    return
  }
  if (blockedRouteTypes.includes(tile.type)) {
    routeMovesRemaining.value -= 1
    routeRisk.value = Math.min(100, routeRisk.value + (tile.type === 'outflow' ? 35 : 20))
    registerAction(false)
    message.value = content.messages.routeBlocked.replace('{label}', tile.label)
    return
  }
  registerAction(true)
  routeMovesRemaining.value -= 1
  routePosition.value = next
  routeVisited.value = [...new Set([...routeVisited.value, `${next.row}-${next.col}`])]
  if (tile.type === 'sample') finishMiniGame(content.messages.routeSuccess)
  else message.value = content.messages.routeStep
}
</script>

<template>
  <section class="content-section sample-layout sample-layout-clean">
    <div>
      <div class="sample-clean-heading">
        <div>
          <p class="eyebrow">{{ content.ui.wellHeading.replace('{number}', selectedWell).replace('{view}', mission.view) }}</p>
          <h1>{{ mission.title }}</h1>
          <p class="lead">{{ routineReady ? mission.routine : mission.goal }}</p>
        </div>
      </div>

      <WellSwitcher :selected-well="selectedWell" :collected="game.collected" :labels="content.ui" :count="wellNumbers.length" @select="goToWell" />

      <details class="mission-tip">
        <summary>Tip od šéfa</summary>
        <p>{{ mission.briefing }}</p>
      </details>

      <MissionHud v-if="!canReturn" :time-remaining="timeRemaining" :stars="missionStars" />

      <div v-if="!routineReady && !canReturn" :key="`mission-${selectedWell}`" class="well-mini-shell terrain-arrival" :class="mission.scene">
        <div v-if="mission.kind === 'fill'" class="well-game-stage fill-game-stage">
          <div class="precision-fill-scene" :class="{ perfect: fillPerfect }">
            <div class="field-faucet" aria-hidden="true">
              <span></span>
              <i></i>
            </div>
            <div class="falling-stream" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </div>
            <div class="precision-bottle" :style="{ '--water-level': `${fillLevel}%` }">
              <span class="precision-neck"></span>
              <span class="precision-water"></span>
              <span class="precision-target"></span>
              <strong>{{ content.ui.fillLine }}</strong>
            </div>
            <div class="stability-gauge">
              <span>{{ content.ui.stability }}</span>
              <i :style="{ width: `${fillStability}%` }"></i>
            </div>
          </div>
          <div class="fill-action">
            <button
              class="hold-button"
              type="button"
              @pointerdown="startFill"
              @pointerup="releaseFill"
              @pointerleave="releaseFill"
              @pointercancel="releaseFill"
              @keydown.space.prevent="startFill"
              @keyup.space.prevent="releaseFill"
              @keydown.enter.prevent="startFill"
              @keyup.enter.prevent="releaseFill"
            >
              {{ content.ui.holdButton }}
            </button>
            <div class="hold-progress-track" aria-hidden="true">
              <div class="hold-progress-bar" :style="{ width: `${fillLevel}%` }"></div>
            </div>
          </div>
          <div class="game-meter" :class="{ good: fillPerfect }">{{ Math.round(fillLevel) }}%</div>
        </div>

        <div v-else-if="mission.kind === 'spot'" class="well-game-stage spot-game-stage">
          <div class="top-water-map">
            <div class="river-clock" aria-label="Čas odberu 09:20">
              <span class="clock-face small-clock" aria-hidden="true">
                <i class="clock-hand hour"></i>
                <i class="clock-hand minute"></i>
                <b></b>
              </span>
              <strong>{{ content.ui.clockRiverLabel }}</strong>
            </div>
            <div class="spot-clues" :aria-label="content.ui.spotCluesAria">
              <span v-for="clue in spotClues" :key="clue">{{ clue }}</span>
            </div>
            <button v-for="spot in spots" :key="spot.id" type="button" class="sample-spot" :class="[spot.id, { selected: selectedSpot === spot.id }]" :style="{ left: `${spot.x}%`, top: `${spot.y}%` }" @click="chooseSpot(spot)">
              <strong>{{ spot.label }}</strong>
              <span>{{ spot.title }}</span>
              <small>{{ spot.score.join(' / ') }}</small>
            </button>
          </div>
        </div>

        <div v-else-if="mission.kind === 'pipes'" class="well-game-stage pipe-game-stage">
          <div class="pipe-telemetry">
            <div><span>Tlak</span><i><b :style="{ width: `${pipePressure}%` }"></b></i><strong>{{ pipePressure }}%</strong></div>
            <div><span>Čistota</span><i><b :style="{ width: `${pipePurity}%` }"></b></i><strong>{{ pipePurity }}%</strong></div>
            <div><span>Riziko úniku</span><i class="danger"><b :style="{ width: `${pipeRisk}%` }"></b></i><strong>{{ pipeRisk }}%</strong></div>
          </div>
          <div class="valve-system" :class="{ ready: pipeSystemReady }" :aria-label="content.ui.pipeBoardAria">
            <div class="flow-rail" aria-hidden="true">
              <span class="flow-node source"></span>
              <span class="flow-line"></span>
              <span class="flow-node filter"></span>
              <span class="flow-line"></span>
              <span class="flow-node bottle"></span>
            </div>
            <button
              v-for="control in pipeControls"
              :key="control.id"
              type="button"
              class="valve-card"
              :class="{ correct: pipeControlStates[control.id] === control.correct }"
              @click="cyclePipeControl(control)"
            >
              <span class="valve-icon" :class="control.id"></span>
              <strong>{{ control.label }}</strong>
              <small>{{ pipeControlStates[control.id] }}</small>
            </button>
          </div>
          <div class="pipe-hint">{{ content.ui.pipeHint }}</div>
        </div>

        <div v-else-if="mission.kind === 'depth'" class="well-game-stage depth-game-stage">
          <div class="sensor-lab">
            <div class="water-column" :class="{ stable: sensorDepth >= 42 && sensorDepth <= 62 }">
              <span class="surface-layer">povrch</span>
              <span class="stable-layer">stabilná zóna</span>
              <span class="sediment-layer">sediment</span>
              <span class="depth-probe" :style="{ top: `${sensorDepth}%` }"><i></i><b>SONDA</b></span>
            </div>
            <div class="sensor-console">
              <span class="mission-hud-label">MERANIE VODNÉHO STĹPCA</span>
              <h3>{{ sensorZone }}</h3>
              <label>
                Hĺbka sondy: <strong>{{ sensorDepth }} cm</strong>
                <input v-model.number="sensorDepth" type="range" min="8" max="88" step="1" />
              </label>
              <div class="sensor-readings">
                <span><small>Zákal</small><strong :class="{ good: sensorTurbidity <= 14 }">{{ sensorTurbidity }} NTU</strong></span>
                <span><small>Stabilita</small><strong :class="{ good: sensorStability >= 75 }">{{ sensorStability }}%</strong></span>
              </div>
              <button class="primary-button" type="button" @click="confirmDepth">Odobrať pri tejto hĺbke</button>
            </div>
          </div>
        </div>

        <div v-else-if="mission.kind === 'bubbles'" class="well-game-stage bubbles-game-stage">
          <div class="bubble-workbench">
            <div class="tilting-bottle" :class="{ ready: bubbleTiltReady, disturbed: sedimentDisturbed }" :style="{ transform: `rotate(${bubbleTilt * 0.42}deg)` }">
              <div class="bubble-bottle">
              <span v-for="item in bubbles" :key="item.id" class="bubble-dot" :class="item.type" :style="{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.size}px`, height: `${item.size}px` }" :aria-label="item.label">
                <span v-if="item.type !== 'bubble'">{{ item.type === 'sediment' ? '.' : 'L' }}</span>
              </span>
              </div>
            </div>
            <div class="tilt-console">
              <span class="mission-hud-label">MANIPULÁCIA SO VZORKOU</span>
              <strong>{{ bubbleTiltReady ? 'Bezpečný uhol' : bubbleTilt > 55 ? 'Riziko sedimentu' : 'Nakloň viac' }}</strong>
              <label>Uhol fľaše: {{ bubbleTilt }}°<input v-model.number="bubbleTilt" type="range" min="0" max="70" /></label>
              <div class="tilt-zone" :class="{ ready: bubbleTiltReady }"><i :style="{ left: `${(bubbleTilt / 70) * 100}%` }"></i></div>
              <button class="primary-button" type="button" @click="tapBottle">Jemne poklepať</button>
            </div>
          </div>
          <div class="game-meter">{{ content.ui.bubbleCount.replace('{count}', remainingBubbleCount) }}</div>
        </div>

        <div v-else class="well-game-stage route-game-stage">
          <div class="route-status">
            <span><small>Zostávajúce kroky</small><strong>{{ routeMovesRemaining }}/{{ routeBudget }}</strong></span>
            <span><small>Riziko kontaminácie</small><strong :class="{ danger: routeRisk >= 40 }">{{ routeRisk }}%</strong></span>
          </div>
          <div class="route-map route-grid" :aria-label="content.ui.routeMapAria">
            <template v-for="(row, rowIndex) in routeGrid" :key="rowIndex">
              <span v-for="(tile, colIndex) in row" :key="`${rowIndex}-${colIndex}`" :class="[tile.type, { active: routePosition.row === rowIndex && routePosition.col === colIndex, visited: routeVisited.includes(`${rowIndex}-${colIndex}`) }]">
                <span class="route-cell-icon">{{ routeIcon(tile, routePosition.row === rowIndex && routePosition.col === colIndex) }}</span>
                <small>{{ routeIconLabel(tile, routePosition.row === rowIndex && routePosition.col === colIndex) }}</small>
              </span>
            </template>
          </div>
          <div class="route-choices route-controls">
            <button v-for="move in routeMoves" :key="move.label" type="button" @click="moveRoute(move)">
              <span class="route-icon" :aria-hidden="true">{{ move.label === 'hore' ? '↑' : move.label === 'dole' ? '↓' : move.label === 'vpravo' ? '→' : '←' }}</span>
              <span>{{ move.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else :key="`routine-${selectedWell}`" class="routine-panel" :class="{ complete: canReturn }">
        <div v-if="!canReturn" class="stage-complete-banner">
          <span class="stage-complete-check">✓</span>
          <div>
            <strong>{{ skipped ? 'Terénna výzva preskočená' : 'Terénna výzva splnená' }}</strong>
            <span>Teraz vzorku správne označ a zapíš. V laboratóriu musí byť jednoznačne dohľadateľná.</span>
          </div>
          <span class="star-rating"><i v-for="star in 3" :key="star" :class="{ earned: star <= missionStars }">★</i></span>
        </div>
        <div class="routine-bottle-card">
          <GameIcons name="bottle" />
          <span class="routine-sticker" :class="{ placed: routineStickerPlaced || canReturn }">{{ sampleStickerText }}</span>
        </div>

        <div class="routine-form">
          <div class="routine-title">
            <strong>{{ routineTask.title }}</strong>
            <span>{{ routineTask.hint }}</span>
          </div>

          <div v-if="routineTask.kind === 'identity'" class="sample-code-card">
            <strong>{{ content.ui.sampleCodeCardTitle }}</strong>
            <span>{{ content.ui.sampleCodeCardText }}</span>
          </div>

          <div v-if="routineTask.kind === 'identity'" class="label-workbench">
            <div class="assembled-label" :class="{ ready: assembledCode }">
              <span>{{ content.ui.sampleName }}</span>
              <strong>{{ assembledCode || content.ui.emptyCode }}</strong>
            </div>
            <div class="code-part-grid" :aria-label="content.ui.codePartsAria">
              <button
                v-for="part in routineTask.codeParts"
                :key="part"
                type="button"
                :disabled="canReturn || selectedCodeParts.includes(part)"
                :class="{ used: selectedCodeParts.includes(part) }"
                @click="addCodePart(part)"
              >
                {{ part }}
              </button>
            </div>
            <div class="label-tools">
              <button class="secondary-button" type="button" :disabled="canReturn || selectedCodeParts.length === 0" @click="removeLastCodePart">{{ content.ui.undoCodePart }}</button>
              <button class="secondary-button" type="button" :disabled="canReturn || selectedCodeParts.length === 0" @click="clearCodeParts">{{ content.ui.clearCodeParts }}</button>
            </div>
          </div>

          <div v-if="routineTask.kind === 'identity'" class="routine-field">
            <span>{{ content.ui.location }}</span>
            <div class="routine-options">
              <button v-for="option in routineLocationOptions" :key="option" type="button" :disabled="canReturn" :class="{ selected: selectedRoutineLocation === option }" @click="selectedRoutineLocation = option">{{ option }}</button>
            </div>
          </div>

          <div v-else class="routine-field">
            <span>{{ content.ui.record }}</span>
            <div class="routine-options routine-options-grid">
              <button v-for="option in routineTask.options" :key="option" type="button" :disabled="canReturn" :class="{ selected: routineChoice === option }" @click="routineChoice = option">{{ option }}</button>
            </div>
          </div>

          <button class="primary-button routine-submit" type="button" :disabled="canReturn" @click="finishRoutine">
            {{ routineTask.kind === 'identity' ? content.ui.placeSticker : content.ui.saveRecord }}
          </button>

          <div v-if="canReturn" class="completion-feedback">
            <span>{{ content.ui.sampleReady }}</span>
            <strong>{{ completed ? (skipped ? 'Úloha bola preskočená' : content.ui.accuracy) : content.ui.alreadySaved }}</strong>
            <div v-if="completed" class="reward-line">
              <b v-if="!skipped">{{ content.ui.sampleRewardXp }}</b>
              <b v-if="!skipped">{{ missionScore }} bodov</b>
              <b v-if="!skipped">+{{ timeBonus }} časový bonus</b>
              <b v-else>Bez XP – terénna výzva bola preskočená</b>
            </div>
            <div v-if="completed" class="final-star-row" :aria-label="`${missionStars} z 3 hviezd`">
              <i v-for="star in 3" :key="star" :class="{ earned: star <= missionStars }">★</i>
              <span>{{ skipped ? 'Bez hodnotenia – úloha bola preskočená' : `Najlepšia séria: ${maxCombo}×` }}</span>
            </div>
          </div>
        </div>
      </div>

      <Teleport to="#notification-stack">
        <Transition name="mission-advance">
          <div v-if="autoAdvancing" class="auto-advance-card" role="status">
            <span class="advance-icon">✓</span>
            <div>
              <small>MISIA DOKONČENÁ</small>
              <strong>{{ selectedWell < wellNumbers.length ? `Ďalšia: studňa ${selectedWell + 1}` : 'Ďalšia zastávka: laboratórium' }}</strong>
              <span>Automatické pokračovanie o {{ advanceCountdown }} s.</span>
            </div>
            <button class="primary-button" type="button" @click="continueToNextMission">Pokračovať teraz</button>
            <i aria-hidden="true"><b></b></i>
          </div>
        </Transition>
      </Teleport>

      <p class="success-message game-feedback" :class="feedbackTone" aria-live="polite">{{ message }}</p>

      <div class="button-row sample-actions">
        <button :class="canReturn ? 'primary-button' : 'secondary-button'" type="button" @click="$emit('navigate', 'map')">{{ content.ui.backMap }}</button>
        <button
          v-if="!routineReady && !canReturn"
          class="secondary-button skip-game-button"
          :class="{ confirming: skipConfirm }"
          type="button"
          @click="skipMiniGame"
        >
          {{ skipConfirm ? 'Potvrdiť preskočenie' : 'Preskočiť minihru' }}
        </button>
      </div>
    </div>
  </section>
</template>
