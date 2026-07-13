<script setup>
import { computed, ref } from 'vue'
import appContent from '../content/appContent.json'
import { useGameAudio } from '../composables/useGameAudio'

const emit = defineEmits(['navigate', 'award-xp'])
const props = defineProps({
  game: { type: Object, required: true },
})

const content = computed(() => appContent.glossary)
const { playGameSound } = useGameAudio()
const activeTab = ref('dictionary')
const activeCardIndex = ref(0)
const cardFlipped = ref(false)
const selectedAnswer = ref('')
const quizIndex = ref(0)
const score = ref(0)
const cardRewardPulse = ref(false)
const quizRewardPulse = ref(false)
const tabOrder = ['dictionary', 'flashcards', 'quiz']

const terms = computed(() => content.value.terms)
const activeCard = computed(() => terms.value[activeCardIndex.value])
const currentQuestion = computed(() => terms.value[quizIndex.value])
const quizOptions = computed(() => {
  const correct = currentQuestion.value
  const others = terms.value.filter((term) => term.id !== correct.id).slice(quizIndex.value + 1, quizIndex.value + 3)
  const fallback = terms.value.filter((term) => term.id !== correct.id && !others.includes(term)).slice(0, 2 - others.length)
  return [correct, ...others, ...fallback].sort((a, b) => a.title.localeCompare(b.title, 'sk'))
})
const quizFeedback = computed(() => {
  if (!selectedAnswer.value) return ''
  return selectedAnswer.value === currentQuestion.value.id ? content.value.quiz.correct : content.value.quiz.wrong
})
const scoreText = computed(() => content.value.quiz.score.replace('{score}', score.value).replace('{total}', terms.value.length))
const activeCardRewardId = computed(() => `glossary-card:${activeCard.value.id}`)
const activeCardMastered = computed(() => props.game.rewardedActivities.includes(activeCardRewardId.value))

function setTab(tab) {
  activeTab.value = tab
}

function moveTab(event, direction) {
  const currentIndex = tabOrder.indexOf(activeTab.value)
  const nextIndex = (currentIndex + direction + tabOrder.length) % tabOrder.length
  setTab(tabOrder[nextIndex])
  event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex]?.focus()
}

function moveCard(delta) {
  activeCardIndex.value = (activeCardIndex.value + delta + terms.value.length) % terms.value.length
  cardFlipped.value = false
  cardRewardPulse.value = false
}

function answerQuiz(option) {
  if (selectedAnswer.value) return
  selectedAnswer.value = option.id
  if (option.id === currentQuestion.value.id) {
    score.value += 1
    const rewardId = `glossary-quiz:${currentQuestion.value.id}`
    quizRewardPulse.value = !props.game.rewardedActivities.includes(rewardId)
    emit('award-xp', { id: rewardId, label: content.value.quiz.rewardLabel, xp: 5 })
  } else {
    playGameSound('error')
  }
}

function nextQuestion() {
  selectedAnswer.value = ''
  quizRewardPulse.value = false
  quizIndex.value = (quizIndex.value + 1) % terms.value.length
}

function resetQuiz() {
  selectedAnswer.value = ''
  quizIndex.value = 0
  score.value = 0
  quizRewardPulse.value = false
}

function masterCard() {
  if (activeCardMastered.value) return
  cardRewardPulse.value = true
  emit('award-xp', { id: activeCardRewardId.value, label: content.value.flashcards.rewardLabel, xp: 3 })
}
</script>

<template>
  <section class="content-section glossary-screen">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ content.eyebrow }}</p>
        <h1>{{ content.title }}</h1>
      </div>
      <button class="secondary-button" type="button" @click="$emit('navigate', 'home')">{{ content.button }}</button>
    </div>

    <div class="glossary-tabs" role="tablist" aria-label="Režim slovníka">
      <button id="tab-dictionary" role="tab" type="button" :tabindex="activeTab === 'dictionary' ? 0 : -1" :aria-selected="activeTab === 'dictionary'" aria-controls="panel-dictionary" :class="{ active: activeTab === 'dictionary' }" @click="setTab('dictionary')" @keydown.right.prevent="moveTab($event, 1)" @keydown.left.prevent="moveTab($event, -1)">{{ content.tabs.dictionary }}</button>
      <button id="tab-flashcards" role="tab" type="button" :tabindex="activeTab === 'flashcards' ? 0 : -1" :aria-selected="activeTab === 'flashcards'" aria-controls="panel-flashcards" :class="{ active: activeTab === 'flashcards' }" @click="setTab('flashcards')" @keydown.right.prevent="moveTab($event, 1)" @keydown.left.prevent="moveTab($event, -1)">{{ content.tabs.flashcards }}</button>
      <button id="tab-quiz" role="tab" type="button" :tabindex="activeTab === 'quiz' ? 0 : -1" :aria-selected="activeTab === 'quiz'" aria-controls="panel-quiz" :class="{ active: activeTab === 'quiz' }" @click="setTab('quiz')" @keydown.right.prevent="moveTab($event, 1)" @keydown.left.prevent="moveTab($event, -1)">{{ content.tabs.quiz }}</button>
    </div>

    <div v-if="activeTab === 'dictionary'" id="panel-dictionary" role="tabpanel" aria-labelledby="tab-dictionary" class="glossary-grid glossary-grid-rich">
      <article v-for="term in terms" :key="term.id" class="term-card">
        <span class="term-icon" :class="`term-icon-${term.icon}`" aria-hidden="true"></span>
        <h2>{{ term.title }}</h2>
        <p>{{ term.text }}</p>
      </article>
    </div>

    <div v-else-if="activeTab === 'flashcards'" id="panel-flashcards" role="tabpanel" aria-labelledby="tab-flashcards" class="flashcard-layout">
      <div>
        <p class="eyebrow">{{ content.flashcards.title }}</p>
        <p class="lead">{{ content.flashcards.hint }}</p>
      </div>

      <button class="flashcard" type="button" :class="{ flipped: cardFlipped, mastered: activeCardMastered, rewarded: cardRewardPulse }" @click="cardFlipped = !cardFlipped">
        <span class="term-icon" :class="`term-icon-${activeCard.icon}`" aria-hidden="true"></span>
        <strong>{{ activeCard.title }}</strong>
        <p>{{ cardFlipped ? activeCard.text : content.flashcards.showAnswer }}</p>
        <em v-if="activeCardMastered">{{ content.flashcards.mastered }}</em>
      </button>

      <div class="flashcard-controls">
        <button class="secondary-button" type="button" @click="moveCard(-1)">{{ content.flashcards.previous }}</button>
        <button class="primary-button" type="button" @click="cardFlipped = !cardFlipped">
          {{ cardFlipped ? content.flashcards.hideAnswer : content.flashcards.showAnswer }}
        </button>
        <button class="primary-button reward-action" type="button" :disabled="activeCardMastered" @click="masterCard">
          {{ activeCardMastered ? content.flashcards.mastered : content.flashcards.markKnown }}
          <span>{{ content.flashcards.reward }}</span>
        </button>
        <button class="secondary-button" type="button" @click="moveCard(1)">{{ content.flashcards.next }}</button>
      </div>
    </div>

    <div v-else id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz" class="glossary-quiz">
      <div class="quiz-card glossary-quiz-card" :class="{ rewarded: quizRewardPulse }">
        <div class="logic-card-head">
          <div>
            <p class="eyebrow">{{ content.quiz.title }}</p>
            <h2>{{ content.quiz.hint }}</h2>
          </div>
          <span class="progress-pill">{{ scoreText }}</span>
        </div>

        <p class="quiz-definition">{{ currentQuestion.text }}</p>

        <div class="quiz-options">
          <button
            v-for="option in quizOptions"
            :key="option.id"
            type="button"
            :class="{ correct: selectedAnswer && option.id === currentQuestion.id, wrong: selectedAnswer === option.id && option.id !== currentQuestion.id, muted: selectedAnswer && option.id !== currentQuestion.id && selectedAnswer !== option.id }"
            :disabled="Boolean(selectedAnswer)"
            @click="answerQuiz(option)"
          >
            <span class="term-icon small" :class="`term-icon-${option.icon}`" aria-hidden="true"></span>
            <span>{{ option.title }}</span>
          </button>
        </div>

        <p v-if="quizFeedback" class="success-message glossary-feedback">
          {{ quizFeedback }}
          <span v-if="quizRewardPulse">{{ content.quiz.reward }}</span>
        </p>

        <div class="button-row">
          <button class="primary-button" type="button" :disabled="!selectedAnswer" @click="nextQuestion">{{ content.flashcards.next }}</button>
          <button class="secondary-button" type="button" @click="resetQuiz">{{ content.quiz.reset }}</button>
        </div>
      </div>
    </div>
  </section>
</template>
