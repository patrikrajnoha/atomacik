<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import GameIcons from '../components/GameIcons.vue'
import appContent from '../content/appContent.json'
import { useGameAudio } from '../composables/useGameAudio'

defineEmits(['navigate'])

const content = computed(() => appContent.conclusion)
const { playGameSound } = useGameAudio()
const answer = ref('')
const submitted = ref(false)
const evaluatedAnswer = ref('')
const finalizing = ref(false)
const finaleVisible = ref(false)
const correctAnswer = content.value.choices[1]
const choices = content.value.choices

const isCorrect = computed(() => answer.value === correctAnswer)
const evaluatedCorrect = computed(() => evaluatedAnswer.value === correctAnswer)
const particles = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  x: (index * 37 + 11) % 100,
  delay: (index % 7) * 0.12,
  duration: 2.4 + (index % 5) * 0.35,
  color: ['#ffd166', '#55d6aa', '#78c8ff', '#ffffff'][index % 4],
}))
let finaleTimer = null

onBeforeUnmount(() => {
  if (finaleTimer) window.clearTimeout(finaleTimer)
})

function submitAnswer() {
  if (answer.value && !finalizing.value) {
    evaluatedAnswer.value = answer.value
    submitted.value = true
    if (!isCorrect.value) {
      playGameSound('error')
      return
    }
    finalizing.value = true
    playGameSound('success')
    finaleTimer = window.setTimeout(() => {
      finaleVisible.value = true
      playGameSound('fanfare')
      finaleTimer = null
    }, 650)
  }
}
</script>

<template>
  <section class="content-section conclusion-screen" :class="{ celebrating: finaleVisible }">
    <div v-if="!finaleVisible" class="conclusion-layout">
    <div class="conclusion-question">
      <p class="eyebrow">{{ content.eyebrow }}</p>
      <h1>{{ content.title }}</h1>

      <div class="choice-group" role="radiogroup" :aria-label="content.aria">
        <label v-for="choice in choices" :key="choice" class="choice-card">
          <input v-model="answer" type="radio" name="conclusion" :value="choice" />
          <span>{{ choice }}</span>
        </label>
      </div>

      <button class="primary-button" type="button" :disabled="!answer || finalizing" @click="submitAnswer">{{ finalizing ? 'Odomykám odznak…' : content.button }}</button>

      <div v-if="submitted" class="feedback-box" :class="{ correct: evaluatedCorrect }">
        <strong>{{ evaluatedCorrect ? content.feedback.correct : content.feedback.wrong }}</strong>
        <p>
          {{ content.detail }}
        </p>
      </div>
    </div>

    <div v-if="finalizing" class="badge-card badge-preview">
      <GameIcons name="badge" />
      <p>{{ content.badge.label }}</p>
      <h2>Odomyká sa…</h2>
    </div>
    </div>

    <Transition name="finale-reveal">
      <div v-if="finaleVisible" class="game-finale">
        <div class="finale-atmosphere" aria-hidden="true">
          <span
            v-for="particle in particles"
            :key="particle.id"
            :style="{ '--x': `${particle.x}%`, '--delay': `${particle.delay}s`, '--duration': `${particle.duration}s`, '--particle': particle.color }"
          ></span>
          <i class="finale-wave wave-one"></i>
          <i class="finale-wave wave-two"></i>
        </div>

        <div class="finale-copy">
          <span class="finale-kicker">{{ content.finale.kicker }}</span>
          <div class="guardian-badge">
            <i class="badge-orbit orbit-one"></i>
            <i class="badge-orbit orbit-two"></i>
            <div class="badge-halo"></div>
            <GameIcons name="badge" />
            <span class="badge-check">✓</span>
          </div>
          <p class="finale-unlocked">NOVÝ ODZNAK ODOMKNUTÝ</p>
          <h1>{{ content.finale.title }}</h1>
          <p class="finale-subtitle">{{ content.finale.subtitle }}</p>

          <div class="finale-stats">
            <span v-for="(stat, index) in content.finale.stats" :key="stat" :style="{ '--stat-delay': `${0.9 + index * 0.16}s` }">
              <b>✓</b>{{ stat }}
            </span>
          </div>

          <div class="button-row finale-actions">
            <button class="primary-button" type="button" @click="$emit('navigate', 'profile')">{{ content.finale.profileButton }}</button>
            <button class="secondary-button" type="button" @click="$emit('navigate', 'map')">{{ content.finale.mapButton }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>
