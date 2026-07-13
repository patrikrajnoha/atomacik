<script setup>
defineProps({
  selectedWell: { type: Number, required: true },
  collected: { type: Array, required: true },
  labels: { type: Object, required: true },
  count: { type: Number, default: 6 },
})

const emit = defineEmits(['select'])
let swipeStart = null

function startSwipe(event) {
  swipeStart = event.clientX
}

function endSwipe(event, selectedWell, count) {
  if (swipeStart === null) return
  const distance = event.clientX - swipeStart
  swipeStart = null
  if (Math.abs(distance) < 45) return
  emit('select', Math.min(count, Math.max(1, selectedWell + (distance < 0 ? 1 : -1))))
}
</script>

<template>
  <div
    class="well-switcher"
    :aria-label="labels.wellSwitcherAria"
    @pointerdown="startSwipe"
    @pointerup="endSwipe($event, selectedWell, count)"
    @pointercancel="swipeStart = null"
  >
    <button class="well-arrow" type="button" :disabled="selectedWell === 1" :aria-label="labels.previousWell" @click="emit('select', selectedWell - 1)">&lt;</button>
    <div class="well-dots">
      <button v-for="well in count" :key="well" type="button" :class="{ active: selectedWell === well, collected: collected[well - 1] }" :aria-current="selectedWell === well ? 'step' : undefined" @click="emit('select', well)">
        {{ well }}
      </button>
    </div>
    <button class="well-arrow" type="button" :disabled="selectedWell === count" :aria-label="labels.nextWell" @click="emit('select', selectedWell + 1)">&gt;</button>
  </div>
</template>
