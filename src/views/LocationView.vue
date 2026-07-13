<script setup>
import { computed } from 'vue'
import appContent from '../content/appContent.json'

defineProps({
  game: {
    type: Object,
    required: true,
  },
  locations: {
    type: Object,
    required: true,
  },
  location: {
    type: Object,
    default: null,
  },
})

defineEmits(['choose-location', 'navigate'])

const content = computed(() => appContent.location)
</script>

<template>
  <section class="content-section location-screen">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ content.eyebrow }}</p>
        <h1>{{ content.title }}</h1>
      </div>
      <button class="secondary-button" type="button" @click="$emit('navigate', 'home')">{{ content.buttons.home }}</button>
    </div>

    <p v-if="location" class="locked-location-note">
      {{ content.lockedNote.replace('{locationTitle}', location.title) }}
    </p>

    <div class="slovakia-layout">
      <div class="slovakia-map real-slovakia-map">
        <svg viewBox="0 0 760 360" class="slovakia-svg" :aria-label="content.mapAria">
          <title>{{ content.mapAria }}</title>
          <defs>
            <linearGradient id="slovakiaLand" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stop-color="#dff5d8" />
              <stop offset="48%" stop-color="#bde8c4" />
              <stop offset="100%" stop-color="#f7e7a6" />
            </linearGradient>
            <filter id="softMapShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#20303f" flood-opacity="0.16" />
            </filter>
          </defs>

          <path
            class="slovakia-shape"
            filter="url(#softMapShadow)"
            d="M44 210
               C57 198 68 203 76 190
               C85 174 99 170 110 157
               C126 138 148 135 166 126
               C188 115 205 104 229 100
               C250 96 264 77 288 80
               C315 83 332 70 358 79
               C386 88 399 104 425 101
               C450 97 462 80 490 86
               C514 92 530 104 558 101
               C590 98 616 109 641 126
               C662 140 684 135 708 149
               C732 162 736 181 716 196
               C696 211 665 213 641 225
               C612 240 584 231 558 244
               C532 257 506 258 479 251
               C449 244 429 262 400 272
               C370 282 342 270 314 279
               C288 287 271 309 242 305
               C217 302 199 286 174 289
               C143 292 123 279 96 282
               C73 284 55 269 70 249
               C80 236 36 230 44 210 Z"
          />

          <path class="region-line" d="M152 132 C164 169 160 228 143 292" />
          <path class="region-line" d="M276 82 C287 138 284 236 242 305" />
          <path class="region-line" d="M425 101 C410 154 412 218 400 272" />
          <path class="region-line" d="M558 101 C535 149 532 207 558 244" />
          <path class="region-line" d="M662 140 C640 169 630 199 641 225" />

          <path class="river-line" d="M65 239 C116 225 158 236 211 224 C271 211 316 190 374 198 C438 207 481 187 536 192 C600 198 640 178 694 157" />
          <path class="river-line thin" d="M134 140 C179 160 201 190 211 224" />
          <path class="river-line thin" d="M318 83 C358 125 374 161 374 198" />

          <path class="mountain-band" d="M253 88 L276 56 L302 83 M319 82 L345 49 L376 92 M420 94 L452 55 L488 96 M514 98 L541 72 L570 100" />
          <text x="383" y="52" text-anchor="middle" class="map-small-label">Tatry</text>
          <text x="88" y="266" text-anchor="middle" class="map-small-label">Bratislava</text>
          <text x="618" y="224" text-anchor="middle" class="map-small-label">Košice</text>

          <g
            class="map-location-pin bohunice-location"
            role="button"
            tabindex="0"
            :aria-label="content.pinAria.bohunice"
            @click="$emit('choose-location', 'bohunice')"
            @keydown.enter.prevent="$emit('choose-location', 'bohunice')"
            @keydown.space.prevent="$emit('choose-location', 'bohunice')"
          >
            <circle class="map-pin bohunice-pin" cx="156" cy="205" r="15" />
            <path class="pin-spark" d="M156 179v-16M138 187l-12-12M174 187l12-12" />
            <text x="156" y="169" text-anchor="middle" class="map-label">J. Bohunice</text>
          </g>

          <g
            class="map-location-pin mochovce-location"
            role="button"
            tabindex="0"
            :aria-label="content.pinAria.mochovce"
            @click="$emit('choose-location', 'mochovce')"
            @keydown.enter.prevent="$emit('choose-location', 'mochovce')"
            @keydown.space.prevent="$emit('choose-location', 'mochovce')"
          >
            <circle class="map-pin mochovce-pin" cx="238" cy="226" r="15" />
            <path class="pin-spark" d="M238 200v-16M220 208l-12-12M256 208l12-12" />
            <text x="238" y="260" text-anchor="middle" class="map-label">Mochovce</text>
          </g>
        </svg>
      </div>

      <div class="location-cards">
        <article v-for="place in locations" :key="place.id" class="location-card">
          <div class="location-card-head">
            <div>
              <p>{{ place.area }}</p>
              <h2>{{ place.title }}</h2>
            </div>
            <figure v-if="place.crestUrl" class="location-crest">
              <img :src="place.crestUrl" :alt="place.crestAlt" loading="lazy" />
            </figure>
          </div>
          <span>{{ place.plantLabel }}</span>
          <p>{{ place.intro }}</p>
          <button
            class="primary-button"
            type="button"
            :disabled="!!game.locationId && game.locationId !== place.id"
            @click="$emit('choose-location', place.id)"
          >
            {{ game.locationId === place.id ? content.cards.selected : content.cards.start }}
          </button>
        </article>
      </div>
    </div>
  </section>
</template>
