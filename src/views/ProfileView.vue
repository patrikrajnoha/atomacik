<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AvatarVisual from '../components/AvatarVisual.vue'
import BadgeIcon from '../components/BadgeIcon.vue'
import appContent from '../content/appContent.json'
import { useGameAudio } from '../composables/useGameAudio'

const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
  location: {
    type: Object,
    default: null,
  },
  level: {
    type: Number,
    required: true,
  },
  levelProgressPercent: {
    type: Number,
    required: true,
  },
  levelProgressText: {
    type: String,
    required: true,
  },
  rank: {
    type: String,
    required: true,
  },
  badges: {
    type: Array,
    required: true,
  },
  collectedCount: {
    type: Number,
    required: true,
  },
  analyzedCount: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update-profile', 'navigate', 'reset'])

const content = computed(() => appContent.profile)
const playerName = ref(props.game.playerName)
const avatar = ref(props.game.avatar)
const previewName = computed(() => playerName.value.trim() || props.game.playerName || 'Mladý vedec')
const badgeIcons = computed(() => content.value.badgeIcons)
const animatedLevelProgress = ref(0)
const resetConfirm = ref(false)
const { soundEnabled, toggleSound } = useGameAudio()

onMounted(() => {
  window.requestAnimationFrame(() => {
    animatedLevelProgress.value = props.levelProgressPercent
  })
})

watch(
  () => [props.game.playerName, props.game.avatar],
  () => {
    playerName.value = props.game.playerName
    avatar.value = props.game.avatar
  },
)

function saveProfile() {
  emit('update-profile', {
    playerName: playerName.value.trim() || 'Mladý vedec',
    avatar: avatar.value,
  })
}

function requestReset() {
  if (!resetConfirm.value) {
    resetConfirm.value = true
    return
  }
  emit('reset')
}
</script>

<template>
  <section class="content-section profile-screen">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ content.eyebrow }}</p>
        <h1>{{ previewName }}</h1>
      </div>
      <button class="secondary-button" type="button" @click="$emit('navigate', 'map')">{{ content.button }}</button>
    </div>

    <div class="profile-layout">
      <div class="profile-card">
        <div class="profile-avatar" :class="`avatar-${avatar}`">
          <AvatarVisual :type="avatar" />
        </div>

        <div class="id-card">
          <span>{{ content.organization }}</span>
          <strong>{{ previewName }}</strong>
          <small>{{ location ? content.employeeRole.replace('{locationTitle}', location.title) : content.role }}</small>
          <small>{{ content.department }}</small>
        </div>

        <div class="level-panel">
          <span>{{ content.levelPrefix }} {{ level }}</span>
          <strong>{{ rank }}</strong>
          <div class="level-bar" aria-label="Postup do ďalšej úrovne">
            <i :style="{ width: `${animatedLevelProgress}%` }"></i>
          </div>
          <small>{{ levelProgressText }}</small>
        </div>

        <div class="profile-stats">
          <div>
            <strong>{{ game.xp }}</strong>
            <span>{{ content.stats.xp }}</span>
          </div>
          <div>
            <strong>{{ level }}</strong>
            <span>{{ content.stats.level }}</span>
          </div>
          <div>
            <strong>{{ collectedCount }}/6</strong>
            <span>{{ content.stats.samples }}</span>
          </div>
          <div>
            <strong>{{ analyzedCount }}/6</strong>
            <span>{{ content.stats.analyses }}</span>
          </div>
        </div>
      </div>

      <div class="profile-editor">
        <h2>{{ content.editTitle }}</h2>
        <label>
          {{ content.labels.playerName }}
          <input v-model="playerName" type="text" maxlength="24" />
        </label>

        <div class="avatar-picker avatar-card-picker" :aria-label="content.labels.avatarLabel">
          <button
            v-for="choice in ['atom', 'drop', 'cesium']"
            :key="choice"
            type="button"
            :class="{ selected: avatar === choice }"
            @click="avatar = choice"
          >
            <AvatarVisual :type="choice" />
            <strong>{{ appContent.employeeSetup.avatarNames[choice] }}</strong>
          </button>
        </div>

        <button class="primary-button" type="button" @click="saveProfile">{{ content.buttonSave }}</button>

        <div class="profile-audio-setting">
          <div>
            <strong>{{ content.sound.title }}</strong>
            <span>{{ content.sound.description }}</span>
          </div>
          <button
            class="profile-sound-toggle"
            type="button"
            :aria-pressed="soundEnabled"
            @click="toggleSound"
          >
            {{ soundEnabled ? content.sound.on : content.sound.off }}
          </button>
        </div>

        <div class="profile-danger-zone">
          <div>
            <strong>Začať hru odznova</strong>
            <span>Vymaže sa profil, XP, vzorky aj všetky odznaky.</span>
          </div>
          <button class="profile-reset-button" :class="{ confirming: resetConfirm }" type="button" @click="requestReset">
            {{ resetConfirm ? 'Potvrdiť vymazanie hry' : 'Resetovať hru' }}
          </button>
          <button v-if="resetConfirm" class="profile-reset-cancel" type="button" @click="resetConfirm = false">Zrušiť</button>
        </div>
      </div>

      <div class="badge-list">
        <h2>{{ content.badgesTitle }}</h2>
        <p v-if="badges.length === 0">{{ content.badgeEmpty }}</p>
        <span
          v-for="(badge, index) in badges"
          :key="badge.id"
          :class="{ newest: index === badges.length - 1 }"
          :style="{ '--badge-delay': `${index * 90}ms` }"
        >
          <BadgeIcon :type="badgeIcons[badge.id] || 'shield'" />
          <strong>{{ badge.label }}</strong>
        </span>
      </div>
    </div>
  </section>
</template>
