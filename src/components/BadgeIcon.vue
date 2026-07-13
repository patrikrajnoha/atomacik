<script setup>
defineProps({
  type: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <svg class="badge-icon" viewBox="0 0 64 64" aria-hidden="true">
    <circle class="badge-icon-bg" cx="32" cy="32" r="29" />

    <g v-if="type === 'id-card'">
      <rect class="badge-icon-main" x="14" y="18" width="36" height="28" rx="5" />
      <circle class="badge-icon-light" cx="24" cy="30" r="5" />
      <path class="badge-icon-line" d="M33 27h10M33 35h8" />
    </g>

    <g v-else-if="type === 'quiz'">
      <path class="badge-icon-main" d="M18 17h28v30H18z" />
      <path class="badge-icon-line" d="M25 28l5 5 10-12M25 42h15" />
    </g>

    <g v-else-if="type === 'map'">
      <path class="badge-icon-main" d="M14 21l12-5 12 5 12-5v31l-12 5-12-5-12 5z" />
      <path class="badge-icon-line" d="M26 16v31M38 21v31" />
      <circle class="badge-icon-light" cx="39" cy="31" r="4" />
    </g>

    <g v-else-if="type === 'bottle'">
      <path class="badge-icon-main" d="M27 13h10v10l8 12v12a6 6 0 0 1-6 6H25a6 6 0 0 1-6-6V35l8-12z" />
      <path class="badge-icon-light" d="M22 39h20v8a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3z" />
      <path class="badge-icon-line" d="M26 23h12" />
    </g>

    <g v-else-if="type === 'field'">
      <path class="badge-icon-main" d="M14 42c10-14 26-14 36 0v8H14z" />
      <path class="badge-icon-line" d="M18 43h28M23 35v15M32 31v19M41 35v15" />
      <circle class="badge-icon-light" cx="21" cy="24" r="5" />
    </g>

    <g v-else-if="type === 'spectrum'">
      <rect class="badge-icon-main" x="14" y="17" width="36" height="30" rx="5" />
      <path class="badge-icon-line" d="M19 39h26M22 35l5-9 6 6 5-11 5 14" />
      <circle class="badge-icon-light" cx="24" cy="48" r="2.5" />
      <circle class="badge-icon-light" cx="32" cy="48" r="2.5" />
      <circle class="badge-icon-light" cx="40" cy="48" r="2.5" />
    </g>

    <g v-else-if="type === 'medal'">
      <path class="badge-icon-main" d="M22 12h20l-5 18H27z" />
      <circle class="badge-icon-light" cx="32" cy="41" r="12" />
      <path class="badge-icon-line" d="M27 41l4 4 7-9" />
    </g>

    <g v-else>
      <path class="badge-icon-main" d="M32 12l18 8v13c0 11-7 18-18 21c-11-3-18-10-18-21V20z" />
      <path class="badge-icon-line" d="M24 34l6 6 12-14" />
    </g>
  </svg>
</template>
