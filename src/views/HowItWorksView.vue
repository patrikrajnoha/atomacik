<script setup>
import { computed } from 'vue'
import appContent from '../content/appContent.json'

defineEmits(['navigate'])

const content = computed(() => appContent.howItWorks)
</script>

<template>
  <section class="content-section">
    <p class="eyebrow">{{ content.eyebrow }}</p>
    <h1>{{ content.title }}</h1>
    <p class="lead">
      {{ content.lead }}
    </p>

    <ol class="steps-list">
      <li v-for="step in content.steps" :key="step">{{ step }}</li>
    </ol>

    <div class="button-row">
      <button class="primary-button" type="button" @click="$emit('navigate', 'location')">{{ content.buttons.start }}</button>
      <button class="secondary-button" type="button" @click="$emit('navigate', 'home')">{{ content.buttons.backHome }}</button>
    </div>
  </section>
</template>
