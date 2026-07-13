import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canAwardActivity,
  normalizeBooleanArray,
  normalizeRewardedActivities,
  normalizeXp,
  resolveResumeScreen,
  resolveSavedScreen,
} from '../src/game/rules.js'

const screens = ['home', 'employee', 'interview', 'location', 'map', 'sample', 'lab', 'spectrometer', 'results', 'conclusion', 'glossary']
const readyGame = {
  employeeReady: true,
  interviewPassed: true,
  locationId: 'mochovce',
  collected: Array(6).fill(true),
  analyzed: Array(6).fill(true),
}

test('normalizes progress arrays to six booleans', () => {
  assert.deepEqual(normalizeBooleanArray([1, 0, true]), [true, false, true, false, false, false])
})

test('rejects invalid XP values', () => {
  assert.equal(normalizeXp(-10), 0)
  assert.equal(normalizeXp(20.5), 0)
  assert.equal(normalizeXp(120), 120)
})

test('deduplicates valid rewarded activity IDs', () => {
  assert.deepEqual(normalizeRewardedActivities(['card:1', 'card:1', null, 'card:2']), ['card:1', 'card:2'])
  assert.equal(canAwardActivity(['card:1'], 'card:1'), false)
  assert.equal(canAwardActivity(['card:1'], 'card:2'), true)
})

test('repairs an inaccessible saved screen', () => {
  assert.equal(resolveSavedScreen('results', { ...readyGame, analyzed: Array(6).fill(false) }, screens), 'lab')
  assert.equal(resolveSavedScreen('lab', { ...readyGame, collected: Array(6).fill(false) }, screens), 'map')
  assert.equal(resolveSavedScreen('map', { ...readyGame, locationId: '' }, screens), 'location')
  assert.equal(resolveSavedScreen('results', readyGame, screens), 'results')
})

test('resumes the last meaningful game step', () => {
  assert.equal(resolveResumeScreen(readyGame, 'spectrometer', screens), 'spectrometer')
  assert.equal(resolveResumeScreen(readyGame, 'home', screens), 'results')
  assert.equal(resolveResumeScreen({ ...readyGame, analyzed: Array(6).fill(false) }, 'home', screens), 'lab')
  assert.equal(resolveResumeScreen({ ...readyGame, collected: Array(6).fill(false), analyzed: Array(6).fill(false) }, 'home', screens), 'map')
  assert.equal(resolveResumeScreen({ employeeReady: true, interviewPassed: false, collected: [], analyzed: [] }, 'home', screens), 'interview')
})
