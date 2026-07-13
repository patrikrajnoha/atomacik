<script setup>
defineProps({
  timeRemaining: { type: Number, required: true },
  stars: { type: Number, required: true },
})
</script>

<template>
  <div class="mission-hud mission-hud-simple" aria-label="Stav terénnej úlohy">
    <div class="mission-hud-score">
      <span class="mission-time">Zostáva {{ timeRemaining }} s</span>
      <span class="star-rating" :aria-label="`${stars} z 3 hviezd`">
        <i v-for="star in 3" :key="star" :class="{ earned: star <= stars }">★</i>
      </span>
    </div>
  </div>
</template>
