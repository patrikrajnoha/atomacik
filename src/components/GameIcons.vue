<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <svg v-if="name === 'well'" viewBox="0 0 96 96" class="icon-svg" aria-hidden="true">
    <path class="icon-dark" d="M18 42h60v36H18z" />
    <path class="icon-mid" d="M25 49h46v29H25z" />
    <path class="icon-light" d="M14 35h68v13H14z" />
    <path class="icon-line" d="M28 35V20h40v15M36 20h24" />
    <circle class="icon-water" cx="48" cy="65" r="12" />
  </svg>

  <svg v-else-if="name === 'plant'" viewBox="0 0 96 96" class="icon-svg" aria-hidden="true">
    <path class="icon-mid" d="M12 78h72v8H12z" />
    <path class="icon-dark" d="M20 78l5-46h18l5 46z" />
    <path class="icon-light" d="M54 78l5-52h17l5 52z" />
    <circle class="icon-water" cx="34" cy="58" r="7" />
    <path class="icon-line" d="M24 26c8-9 19-9 26 0M58 20c6-7 14-7 20 0" />
  </svg>

  <svg v-else-if="name === 'lab'" viewBox="0 0 96 96" class="icon-svg" aria-hidden="true">
    <path class="icon-dark" d="M20 84h56V36L48 15 20 36z" />
    <path class="icon-mid" d="M30 84V46h36v38z" />
    <path class="icon-light" d="M40 84V62h16v22z" />
    <path class="icon-line" d="M35 35h26M40 49h16" />
    <circle class="icon-water" cx="64" cy="56" r="6" />
  </svg>

  <svg v-else-if="name === 'bottle'" viewBox="0 0 96 96" class="icon-svg" aria-hidden="true">
    <path class="icon-light" d="M39 12h18v16l12 17v34a9 9 0 0 1-9 9H36a9 9 0 0 1-9-9V45l12-17z" />
    <path class="icon-water" d="M30 58h36v21a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6z" />
    <path class="icon-line" d="M39 28h18M36 14h24" />
  </svg>

  <svg v-else-if="name === 'spectrometer'" viewBox="0 0 96 96" class="icon-svg" aria-hidden="true">
    <rect class="icon-dark" x="16" y="22" width="64" height="52" rx="8" />
    <rect class="icon-light" x="24" y="30" width="48" height="27" rx="4" />
    <path class="icon-line" d="M29 52l8-13 9 9 8-15 12 19" />
    <circle class="icon-water" cx="34" cy="66" r="4" />
    <circle class="icon-water" cx="48" cy="66" r="4" />
    <circle class="icon-water" cx="62" cy="66" r="4" />
  </svg>

  <svg v-else-if="name === 'badge'" viewBox="0 0 96 96" class="icon-svg" aria-hidden="true">
    <path class="icon-light" d="M48 8l10 10 14-2 4 14 12 8-6 14 6 14-12 8-4 14-14-2-10 10-10-10-14 2-4-14-12-8 6-14-6-14 12-8 4-14 14 2z" />
    <path class="icon-water" d="M48 28c12 13 18 22 18 32a18 18 0 0 1-36 0c0-10 6-19 18-32z" />
    <path class="icon-line" d="M38 58l7 7 15-18" />
  </svg>
</template>
