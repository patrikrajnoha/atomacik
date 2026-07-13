import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const cohesion = fs.readFileSync('src/styles/cohesion.css', 'utf8')
const responsive = fs.readFileSync('src/styles/responsive.css', 'utf8')
const shell = fs.readFileSync('src/components/AppShell.vue', 'utf8')
const sample = fs.readFileSync('src/views/SampleView.vue', 'utf8')
const map = fs.readFileSync('src/views/MapView.vue', 'utf8')
const main = fs.readFileSync('src/main.js', 'utf8')
const polish = fs.readFileSync('src/styles/ux-polish.css', 'utf8')
const playlist = fs.readFileSync('src/views/PlaylistView.vue', 'utf8')
const router = fs.readFileSync('src/router.js', 'utf8')
const baseStyles = fs.readFileSync('src/styles.css', 'utf8')
const pwaUpdate = fs.readFileSync('src/composables/usePwaUpdate.js', 'utf8')
const viteConfig = fs.readFileSync('vite.config.js', 'utf8')
const deployWorkflow = fs.readFileSync('.github/workflows/deploy.yml', 'utf8')

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

test('final UX layer preserves vertical scrolling and document-flow playlist', () => {
  assert.match(main, /ux-polish\.css/)
  assert.match(polish, /\.app-shell\s*\{[^}]*overflow-y:\s*visible/s)
  assert.match(polish, /\.persistent-player\.playlist-mode\s*\{[^}]*position:\s*relative/s)
  assert.doesNotMatch(playlist, /100dvh/)
})

test('every public route has page metadata', () => {
  assert.match(router, /screenMetadata/)
  for (const screen of ['home', 'employee', 'interview', 'location', 'briefing', 'how', 'map', 'sample', 'lab', 'spectrometer', 'results', 'conclusion', 'glossary', 'profile', 'playlist']) {
    assert.match(router, new RegExp(`\\b${screen}:`))
  }
})

test('obsolete global controls and playlist layers are removed from CSS', () => {
  assert.doesNotMatch(baseStyles, /\.music-dock\b/)
  assert.doesNotMatch(baseStyles, /\.music-peek-button\b/)
  assert.doesNotMatch(baseStyles, /\.loading-overlay\b/)
  assert.doesNotMatch(baseStyles, /(^|[^-])\.reset-button\b/m)
  assert.doesNotMatch(baseStyles, /\.playlist-player-card\b/)
})

test('PWA updates wait for the player and expose a visible prompt', () => {
  assert.match(viteConfig, /registerType:\s*'prompt'/)
  assert.match(pwaUpdate, /onNeedRefresh/)
  assert.match(pwaUpdate, /updateServiceWorker\?\.\(true\)/)
  assert.match(shell, /class="pwa-update-toast"/)
})

test('Pages workflow uses Node 24 action runtimes', () => {
  assert.match(deployWorkflow, /actions\/checkout@v7/)
  assert.match(deployWorkflow, /pnpm\/action-setup@v6/)
  assert.match(deployWorkflow, /actions\/setup-node@v6/)
  assert.match(deployWorkflow, /actions\/configure-pages@v6/)
  assert.match(deployWorkflow, /actions\/upload-pages-artifact@v5/)
  assert.match(deployWorkflow, /actions\/deploy-pages@v5/)
})
