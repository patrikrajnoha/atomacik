<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import appContent from '../content/appContent.json'
import { useGameAudio } from '../composables/useGameAudio'
import BossAvatar from '../components/BossAvatar.vue'

const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['complete-interview', 'navigate'])

const content = computed(() => appContent.interview)
const { playGameSound } = useGameAudio()
const questions = computed(() => content.value.questions)

const currentIndex = ref(0)
const attempts = ref(0)
const feedback = ref(content.value.feedback.initial)
const showHint = ref(false)
const selectedOptionId = ref('')
const locked = ref(false)
const skipConfirm = ref(false)
let answerTimer = null

const currentQuestion = computed(() => questions.value[currentIndex.value])
const progressText = computed(() => `${currentIndex.value + 1}/${questions.value.length}`)

onBeforeUnmount(() => {
  if (answerTimer) window.clearTimeout(answerTimer)
})

function optionState(option) {
  if (!selectedOptionId.value) return ''
  if (option.correct) return 'correct'
  if (selectedOptionId.value === option.id) return 'wrong'
  return 'muted'
}

function answer(option) {
  if (locked.value) return

  selectedOptionId.value = option.id
  locked.value = true

  if (option.correct) {
    playGameSound('success')
    feedback.value = content.value.feedback.correct

    answerTimer = window.setTimeout(() => {
      if (currentIndex.value === questions.value.length - 1) {
      feedback.value = content.value.completion.replace('{playerName}', props.game.playerName)
      emit('complete-interview')
      return
      }

      currentIndex.value += 1
      attempts.value = 0
      showHint.value = false
      selectedOptionId.value = ''
      locked.value = false
      feedback.value = content.value.feedback.next
    }, 900)
    return
  }

  attempts.value += 1
  playGameSound('error')
  showHint.value = true
  feedback.value =
    attempts.value === 1
      ? content.value.feedback.retryFirst
      : content.value.feedback.retrySecond

  answerTimer = window.setTimeout(() => {
    selectedOptionId.value = ''
    locked.value = false
  }, 850)
}

function skipInterview() {
  if (!skipConfirm.value) {
    skipConfirm.value = true
    feedback.value = 'Preskočením pohovoru nezískaš XP. Stlač tlačidlo ešte raz na potvrdenie.'
    return
  }
  emit('complete-interview', { skipped: true })
}
</script>

<template>
  <section class="content-section interview-screen">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ content.eyebrow }}</p>
        <h1>{{ content.title }}</h1>
      </div>
      <span class="progress-pill">{{ progressText }}</span>
    </div>

    <div class="interview-layout">
      <div class="boss-card">
        <BossAvatar />
        <div class="boss-message"><span>Šéf · vedúci misie</span><p>{{ feedback }}</p></div>
      </div>

      <div class="quiz-card">
        <h2>{{ currentQuestion.text }}</h2>

        <button class="hint-button" type="button" @click="showHint = !showHint">
          {{ showHint ? content.hintButton.show : content.hintButton.hide }}
        </button>
        <p v-if="showHint" class="quiz-hint">{{ currentQuestion.hint }}</p>

        <div class="quiz-options">
          <button
            v-for="option in currentQuestion.options"
            :key="option.id"
            type="button"
            :class="optionState(option)"
            :disabled="locked"
            @click="answer(option)"
          >
            <strong>{{ option.id.toUpperCase() }}</strong>
            <span>{{ option.text }}</span>
          </button>
        </div>

        <button
          class="secondary-button skip-game-button interview-skip"
          :class="{ confirming: skipConfirm }"
          type="button"
          @click="skipInterview"
        >
          {{ skipConfirm ? 'Potvrdiť preskočenie' : 'Preskočiť minihru' }}
        </button>
      </div>
    </div>
  </section>
</template>
