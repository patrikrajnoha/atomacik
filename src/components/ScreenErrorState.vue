<script setup>
defineProps({
  error: { type: Error, default: null },
})

function reloadPage() {
  window.location.reload()
}
</script>

<template>
  <section class="content-section route-state route-error" role="alert">
    <div>
      <strong>Túto časť sa nepodarilo načítať.</strong>
      <span>Skontroluj pripojenie a skús to znova.</span>
    </div>
    <button class="primary-button" type="button" @click="reloadPage">Načítať znova</button>
  </section>
</template>
