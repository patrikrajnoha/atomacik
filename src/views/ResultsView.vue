<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import appContent from '../content/appContent.json'
import { useGameAudio } from '../composables/useGameAudio'

const props = defineProps({
  resultsUnlocked: { type: Boolean, required: true },
})

defineEmits(['navigate'])

const content = computed(() => appContent.results)
const { playGameSound } = useGameAudio()
const visibleRows = ref(0)
const csScanComplete = ref(false)
const summaryVisible = ref(false)
const scanProgress = ref(0)
const timers = []

onMounted(() => {
  if (!props.resultsUnlocked) return
  for (let row = 1; row <= 6; row += 1) {
    timers.push(window.setTimeout(() => {
      visibleRows.value = row
      playGameSound('pop')
    }, 300 + row * 180))
  }
  timers.push(window.setTimeout(() => {
    const scanTimer = window.setInterval(() => {
      scanProgress.value = Math.min(100, scanProgress.value + 4)
      if (scanProgress.value >= 100) {
        window.clearInterval(scanTimer)
        csScanComplete.value = true
        playGameSound('success')
      }
    }, 28)
    timers.push(scanTimer)
  }, 1550))
  timers.push(window.setTimeout(() => {
    summaryVisible.value = true
    playGameSound('reward')
  }, 2450))
})

onBeforeUnmount(() => timers.forEach((timer) => {
  window.clearTimeout(timer)
  window.clearInterval(timer)
}))
</script>

<template>
  <section class="content-section results-screen">
    <p class="eyebrow">{{ content.eyebrow }}</p>
    <h1>{{ content.title }}</h1>

    <div v-if="!resultsUnlocked" class="locked-panel">
      <p>{{ content.locked }}</p>
      <button class="primary-button" type="button" @click="$emit('navigate', 'lab')">{{ content.button }}</button>
    </div>

    <div v-else class="results-reveal">
      <div class="results-scanner" :class="{ complete: csScanComplete }">
        <div><span>VYHODNOTENIE DÁT</span><strong>{{ csScanComplete ? 'Kontrola Cs-137 dokončená' : 'Porovnávam energetické spektrá…' }}</strong></div>
        <i><b :style="{ width: `${scanProgress}%` }"></b></i>
        <small>{{ scanProgress }}%</small>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ content.table.header.sample }}</th>
              <th>{{ content.table.header.bi }}</th>
              <th>{{ content.table.header.pb }}</th>
              <th>{{ content.table.header.cs }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sample in 6" :key="sample" :class="{ revealed: sample <= visibleRows }">
              <td>Studňa {{ sample }}</td>
              <td><span class="result-cell natural">{{ content.table.values.found }}</span></td>
              <td><span class="result-cell natural">{{ content.table.values.found }}</span></td>
              <td><span class="result-cell cesium" :class="{ verified: csScanComplete }">{{ csScanComplete ? content.table.values.notFound : 'kontrola…' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <Transition name="result-verdict">
        <div v-if="summaryVisible" class="result-verdict">
          <span class="verdict-stamp">OVERENÉ</span>
          <div><strong>Cs-137 nebolo zachytené</strong><p class="result-summary">{{ content.summary }}</p></div>
        </div>
      </Transition>

      <button class="primary-button centered-action" type="button" :disabled="!summaryVisible" @click="$emit('navigate', 'conclusion')">{{ summaryVisible ? content.action : 'Vyhodnocujem výsledky…' }}</button>
    </div>
  </section>
</template>
