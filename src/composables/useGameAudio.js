import { ref } from 'vue'

const STORAGE_KEY = 'atomacik-sound-enabled'
const soundEnabled = ref(typeof window === 'undefined' ? true : window.localStorage.getItem(STORAGE_KEY) !== 'false')
let audioContext = null

function getContext() {
  if (typeof window === 'undefined' || !soundEnabled.value) return null
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  if (!audioContext) audioContext = new AudioContext()
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

function tone(frequency, duration = 0.1, type = 'sine', delay = 0, volume = 0.035) {
  const context = getContext()
  if (!context) return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const start = context.currentTime + delay
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

function playGameSound(name) {
  if (!soundEnabled.value) return
  if (name === 'fanfare') {
    tone(392, 0.18, 'triangle', 0, 0.035)
    tone(523, 0.2, 'triangle', 0.13, 0.04)
    tone(659, 0.22, 'triangle', 0.27, 0.04)
    tone(784, 0.34, 'sine', 0.42, 0.045)
    tone(1047, 0.42, 'sine', 0.62, 0.035)
    tone(523, 0.65, 'sine', 0.62, 0.018)
  } else if (name === 'success') {
    tone(523, 0.12, 'sine', 0)
    tone(659, 0.14, 'sine', 0.1)
    tone(784, 0.2, 'sine', 0.2)
  } else if (name === 'error') {
    tone(190, 0.13, 'sawtooth', 0, 0.025)
    tone(155, 0.16, 'sawtooth', 0.1, 0.02)
  } else if (name === 'reward') {
    tone(659, 0.1, 'triangle', 0)
    tone(880, 0.12, 'triangle', 0.08)
    tone(1047, 0.22, 'triangle', 0.16)
  } else if (name === 'pop') {
    tone(460, 0.075, 'sine', 0, 0.025)
  } else {
    tone(360, 0.065, 'sine', 0, 0.02)
  }
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, String(soundEnabled.value))
  if (soundEnabled.value) playGameSound('click')
}

export function useGameAudio() {
  return { soundEnabled, toggleSound, playGameSound }
}
