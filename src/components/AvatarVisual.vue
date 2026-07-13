<script setup>
defineProps({
  type: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="avatar-visual" :class="`avatar-visual-${type}`" role="img" :aria-label="`Avatar ${type}`">
    <svg v-if="type === 'drop'" viewBox="0 0 180 180" aria-hidden="true">
      <defs>
        <linearGradient id="dropAvatarGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#b8efff" />
          <stop offset="55%" stop-color="#5fc7f2" />
          <stop offset="100%" stop-color="#2f80ed" />
        </linearGradient>
      </defs>
      <path class="avatar-drop-body" d="M90 10 C126 48 148 82 148 114 C148 151 122 170 90 170 C58 170 32 151 32 114 C32 82 54 48 90 10 Z" />
      <ellipse class="avatar-drop-highlight" cx="68" cy="62" rx="16" ry="28" transform="rotate(24 68 62)" />
      <circle class="avatar-face" cx="73" cy="107" r="6" />
      <circle class="avatar-face" cx="107" cy="107" r="6" />
      <path class="avatar-smile-line" d="M72 126 Q90 140 108 126" />
    </svg>

    <svg v-else-if="type === 'cesium'" viewBox="0 0 180 180" aria-hidden="true">
      <ellipse class="avatar-orbit blue" cx="90" cy="90" rx="70" ry="24" />
      <ellipse class="avatar-orbit mint" cx="90" cy="90" rx="70" ry="24" transform="rotate(62 90 90)" />
      <ellipse class="avatar-orbit coral" cx="90" cy="90" rx="70" ry="24" transform="rotate(-58 90 90)" />
      <circle class="avatar-core isotope" cx="90" cy="90" r="42" />
      <text class="avatar-core-text" x="90" y="102" text-anchor="middle">Cs</text>
      <circle class="avatar-electron blue-dot" cx="24" cy="85" r="9" />
      <circle class="avatar-electron mint-dot" cx="132" cy="140" r="8" />
    </svg>

    <svg v-else viewBox="0 0 180 180" aria-hidden="true">
      <ellipse class="avatar-orbit blue" cx="90" cy="90" rx="70" ry="24" />
      <ellipse class="avatar-orbit mint" cx="90" cy="90" rx="70" ry="24" transform="rotate(62 90 90)" />
      <ellipse class="avatar-orbit coral" cx="90" cy="90" rx="70" ry="24" transform="rotate(-58 90 90)" />
      <circle class="avatar-core atom" cx="90" cy="90" r="42" />
      <circle class="avatar-face" cx="78" cy="84" r="5" />
      <circle class="avatar-face" cx="102" cy="84" r="5" />
      <path class="avatar-smile-line" d="M74 102 Q90 116 106 102" />
      <circle class="avatar-electron blue-dot" cx="24" cy="85" r="9" />
      <circle class="avatar-electron coral-dot" cx="136" cy="52" r="8" />
    </svg>
  </div>
</template>
