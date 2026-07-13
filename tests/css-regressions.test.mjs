import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const cohesion = fs.readFileSync('src/styles/cohesion.css', 'utf8')
const responsive = fs.readFileSync('src/styles/responsive.css', 'utf8')
const shell = fs.readFileSync('src/components/AppShell.vue', 'utf8')
const sample = fs.readFileSync('src/views/SampleView.vue', 'utf8')
const map = fs.readFileSync('src/views/MapView.vue', 'utf8')

test('field shell does not render the obsolete live label', () => {
  const rule = cohesion.match(/\.well-mini-shell::after\s*\{([^}]+)\}/)?.[1] ?? ''
  assert.match(rule, /content:\s*none/)
  assert.match(rule, /display:\s*none/)
})

test('touch rules preserve spot target positioning', () => {
  assert.doesNotMatch(responsive, /\.sample-spot:hover[^}]*transform:\s*none/)
  assert.match(cohesion, /\.sample-spot:hover\s*\{\s*transform:\s*translate\(-50%,\s*-50%\)/)
})

test('fixed game notices share one notification host', () => {
  assert.match(shell, /id="notification-stack"/)
  assert.match(shell, /<Teleport to="body">/)
  assert.match(sample, /<Teleport to="#notification-stack">/)
  assert.match(map, /<Teleport to="#notification-stack">/)
})

test('removed global controls do not return to the app shell', () => {
  assert.doesNotMatch(shell, /sound-toggle/)
  assert.doesNotMatch(shell, /reset-button/)
  assert.doesNotMatch(shell, /music-dock/)
})

test('spotify player stays mounted in the app shell after navigation', () => {
  assert.match(shell, /class="persistent-player"/)
  assert.match(shell, /playlistStarted/)
  assert.match(shell, /currentScreen !== 'playlist'/)
  assert.match(shell, /class="player-offline"/)
  assert.match(shell, /navigator\.onLine/)
})
