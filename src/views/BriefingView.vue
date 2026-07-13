<script setup>
import { computed } from 'vue'
import appContent from '../content/appContent.json'
import BossAvatar from '../components/BossAvatar.vue'

defineProps({
  game: {
    type: Object,
    required: true,
  },
  location: {
    type: Object,
    required: true,
  },
})

defineEmits(['navigate'])

const content = computed(() => appContent.briefing)
</script>

<template>
  <section class="content-section briefing-screen">
    <div class="briefing-layout">
      <div class="boss-card large-boss-card">
        <div class="boss-profile-block">
          <BossAvatar />
          <span><small>VEDÚCI MISIE</small><strong>Šéf</strong><em>Environmentálny tím</em></span>
        </div>
        <div>
          <p class="eyebrow">{{ content.eyebrow }}</p>
          <h1>{{ content.title.replace('{locationTitle}', location.title) }}</h1>
          <p class="lead">
            {{ content.lead.replace('{playerName}', game.playerName).replace('{plantLabel}', location.plantLabel) }}
          </p>
        </div>
      </div>

      <div class="mission-brief-list">
        <span v-for="step in content.steps" :key="step">{{ step }}</span>
      </div>

      <div class="button-row">
        <button class="primary-button" type="button" @click="$emit('navigate', 'map')">{{ content.buttons.startTour }}</button>
        <button class="secondary-button" type="button" @click="$emit('navigate', 'profile')">{{ content.buttons.showProfile }}</button>
      </div>
    </div>
  </section>
</template>
