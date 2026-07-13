<script setup>
import { computed, ref, watch } from 'vue'
import appContent from '../content/appContent.json'

const props = defineProps({
  game: { type: Object, required: true },
  location: { type: Object, default: null },
  labUnlocked: { type: Boolean, required: true },
  resultsUnlocked: { type: Boolean, required: true },
})

const emit = defineEmits(['open-spectrometer', 'navigate'])

const content = computed(() => appContent.lab)
const selectedSample = ref(1)
const sampleNumbers = [1, 2, 3, 4, 5, 6]

const analyzedCount = computed(() => props.game.analyzed.filter(Boolean).length)
const selectedAnalyzed = computed(() => props.game.analyzed[selectedSample.value - 1])
const selectedBatchStart = computed(() => selectedSample.value % 2 === 0 ? selectedSample.value - 1 : selectedSample.value)
const selectedBatchLabel = computed(() => `${selectedBatchStart.value}–${selectedBatchStart.value + 1}`)
const nextPendingSample = computed(() => sampleNumbers.find((sample) => !props.game.analyzed[sample - 1]) ?? 1)
const selectedState = computed(() => (selectedAnalyzed.value ? content.value.states.completed : content.value.states.pending))
watch(
  () => props.labUnlocked,
  (unlocked) => {
    if (unlocked) selectedSample.value = nextPendingSample.value
  },
  { immediate: true },
)

function chooseSample(sample) {
  selectedSample.value = sample
}

function openSelectedSample() {
  emit('open-spectrometer', selectedSample.value)
}

</script>

<template>
  <section class="content-section lab-screen">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ content.eyebrow.replace('{locationTitle}', location ? location.title : '') }}</p>
        <h1>{{ content.title }}</h1>
      </div>
      <button class="secondary-button" type="button" @click="$emit('navigate', 'map')">{{ content.buttons.map }}</button>
    </div>

    <div v-if="!labUnlocked" class="locked-panel">
      <p>{{ content.locked }}</p>
      <button class="primary-button" type="button" @click="$emit('navigate', 'map')">{{ content.buttons.backMap }}</button>
    </div>

    <div v-else class="lab-hub">
      <div class="lab-progress-simple" aria-label="Postup meraní">
        <span>{{ content.common.measurements }}</span>
        <strong>{{ analyzedCount }}/6</strong>
        <i><b :style="{ width: `${(analyzedCount / 6) * 100}%` }"></b></i>
      </div>

      <div class="lab-workbench lab-workbench-scene">
        <div class="lab-table" aria-label="Laboratórny pracovný stôl">
          <div class="lab-shelf">
            <button
              v-for="sample in sampleNumbers"
              :key="sample"
              type="button"
              class="rack-vial"
              :class="{ active: selectedSample === sample, done: game.analyzed[sample - 1] }"
              @click="chooseSample(sample)"
            >
              <span></span>
              <strong>{{ sample }}</strong>
              <small>{{ game.analyzed[sample - 1] ? content.rack.done : content.rack.pending }}</small>
            </button>
          </div>

          <div class="bench-stage">
            <div class="bench-vial" :class="{ done: selectedAnalyzed }">
              <span class="vial-cap"></span>
              <span class="vial-liquid"></span>
              <b>{{ content.common.sampleLabel.replace('{number}', selectedSample) }}</b>
            </div>

            <div class="bench-arrow" aria-hidden="true"></div>

            <div class="bench-spectrometer" :class="{ ready: !selectedAnalyzed, done: selectedAnalyzed }">
              <div class="spectro-screen">
                <i></i>
                <span>{{ selectedAnalyzed ? content.common.done : content.common.ready }}</span>
              </div>
              <div class="spectro-slot"></div>
            </div>
          </div>
        </div>

        <div class="selected-sample-card">
          <p class="eyebrow">{{ content.selectedSample }}</p>
          <h2>Dvojica vzoriek {{ selectedBatchLabel }}</h2>
          <small class="batch-note">Vzorky {{ selectedBatchLabel }} vyhodnotíš v jednom meraní.</small>
          <p>{{ selectedState }}</p>

          <div class="lab-checklist">
            <span class="done">{{ content.checklist.label }}</span>
            <span :class="{ done: selectedAnalyzed, current: !selectedAnalyzed }">{{ content.checklist.spectrometer }}</span>
            <span :class="{ done: selectedAnalyzed }">{{ content.checklist.record }}</span>
          </div>

          <div class="button-row">
            <button class="primary-button" type="button" @click="openSelectedSample">
              {{ selectedAnalyzed ? content.buttons.viewMeasurement : content.buttons.measure }}
            </button>
            <button v-if="resultsUnlocked" class="secondary-button" type="button" @click="$emit('navigate', 'results')">
              {{ content.buttons.results }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
