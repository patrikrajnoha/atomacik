export const SAVE_VERSION = 3
export const SAMPLE_COUNT = 6
export const GAMEPLAY_SCREENS = [
  'employee',
  'interview',
  'location',
  'briefing',
  'map',
  'sample',
  'lab',
  'spectrometer',
  'results',
  'conclusion',
]

export function normalizeBooleanArray(value, length = SAMPLE_COUNT) {
  if (!Array.isArray(value)) return Array.from({ length }, () => false)
  return Array.from({ length }, (_, index) => Boolean(value[index]))
}

export function normalizeRewardedActivities(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item) => typeof item === 'string' && item.length <= 100))]
}

export function normalizeXp(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0
}

export function resolveSavedScreen(screen, game, validScreens) {
  const requested = validScreens.includes(screen) ? screen : 'home'
  const onboardingScreens = ['location', 'briefing', 'map', 'sample', 'lab', 'spectrometer', 'results', 'conclusion']

  if (onboardingScreens.includes(requested) && !game.employeeReady) return 'employee'
  if (onboardingScreens.includes(requested) && !game.interviewPassed) return 'interview'
  if (['briefing', 'map', 'sample', 'lab', 'spectrometer', 'results', 'conclusion'].includes(requested) && !game.locationId) return 'location'

  const collectedCount = normalizeBooleanArray(game.collected).filter(Boolean).length
  const analyzedCount = normalizeBooleanArray(game.analyzed).filter(Boolean).length
  if (['lab', 'spectrometer', 'results', 'conclusion'].includes(requested) && collectedCount < SAMPLE_COUNT) return 'map'
  if (['results', 'conclusion'].includes(requested) && analyzedCount < SAMPLE_COUNT) return 'lab'

  return requested
}

export function resolveResumeScreen(game, savedScreen, validScreens) {
  const availableScreens = Array.isArray(validScreens) ? validScreens : GAMEPLAY_SCREENS

  if (GAMEPLAY_SCREENS.includes(savedScreen)) {
    return resolveSavedScreen(savedScreen, game, availableScreens)
  }

  const collectedCount = normalizeBooleanArray(game.collected).filter(Boolean).length
  const analyzedCount = normalizeBooleanArray(game.analyzed).filter(Boolean).length

  if (analyzedCount === SAMPLE_COUNT) return 'results'
  if (collectedCount === SAMPLE_COUNT) return 'lab'
  if (game.locationId) return 'map'
  if (game.interviewPassed) return 'location'
  if (game.employeeReady) return 'interview'
  return 'employee'
}

export function canAwardActivity(rewardedActivities, activityId) {
  return typeof activityId === 'string' && activityId.length > 0 && !rewardedActivities.includes(activityId)
}
