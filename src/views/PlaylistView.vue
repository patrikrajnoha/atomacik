<script setup>
import appContent from '../content/appContent.json'

const content = appContent.playlist
</script>

<template>
  <section class="content-section playlist-screen">
    <div class="playlist-copy">
      <p class="eyebrow">{{ content.eyebrow }}</p>
      <h1>{{ content.title }}</h1>
      <p class="lead">{{ content.lead }}</p>
    </div>

    <div class="playlist-cards" aria-label="Tipy k prehrávaniu hudby">
      <article v-for="(card, index) in content.cards" :key="card.title">
        <span aria-hidden="true">{{ index + 1 }}</span>
        <strong>{{ card.title }}</strong>
        <p>{{ card.text }}</p>
      </article>
    </div>

    <p class="playlist-note">{{ content.note }}</p>
  </section>
</template>
