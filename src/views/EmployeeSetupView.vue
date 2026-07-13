<script setup>
import { computed, ref, watch } from 'vue'
import AvatarVisual from '../components/AvatarVisual.vue'
import appContent from '../content/appContent.json'

const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update-profile', 'navigate'])

const content = computed(() => appContent.employeeSetup)
const defaultName = content.value.placeholders.playerName
const playerName = ref(props.game.playerName === appContent.game.defaults.playerName ? defaultName : props.game.playerName)
const avatar = ref(props.game.avatar)
const nameTouched = ref(false)
const nameValid = computed(() => playerName.value.trim().length > 0)

watch(
  () => [props.game.playerName, props.game.avatar],
  () => {
    playerName.value = props.game.playerName === appContent.game.defaults.playerName ? defaultName : props.game.playerName
    avatar.value = props.game.avatar
  },
)

function continueToInterview() {
  nameTouched.value = true
  if (!nameValid.value) return

  emit('update-profile', {
    playerName: playerName.value.trim(),
    avatar: avatar.value,
  })
  emit('navigate', 'interview')
}
</script>

<template>
  <section class="content-section onboarding-screen">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ content.eyebrow }}</p>
        <h1>{{ content.title }}</h1>
      </div>
      <button class="secondary-button" type="button" @click="$emit('navigate', 'home')">{{ content.buttons.backHome }}</button>
    </div>

    <div class="onboarding-grid">
      <div class="employee-form">
        <label>
          {{ content.labels.playerName }}
          <input
            v-model="playerName"
            type="text"
            maxlength="24"
            :placeholder="content.placeholders.playerName"
            required
            @blur="nameTouched = true"
          />
          <small v-if="nameTouched && !nameValid" class="field-error">{{ content.errors.nameRequired }}</small>
        </label>

        <div class="avatar-picker clean-picker avatar-card-picker" :aria-label="content.labels.avatarLabel">
          <button
            v-for="choice in ['atom', 'drop', 'cesium']"
            :key="choice"
            type="button"
            :class="{ selected: avatar === choice }"
            @click="avatar = choice"
          >
            <AvatarVisual :type="choice" />
            <strong>{{ choice === 'atom' ? content.avatarNames.atom : choice === 'drop' ? content.avatarNames.drop : content.avatarNames.cesium }}</strong>
          </button>
        </div>

        <button class="primary-button" type="button" :disabled="!nameValid" @click="continueToInterview">{{ content.buttons.continue }}</button>
      </div>

    </div>
  </section>
</template>
