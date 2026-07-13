import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const publicScreens = [
  { path: './', heading: 'Atómáčik' },
  { path: './ako-to-funguje', heading: 'Ako prebieha vedecká výprava' },
  { path: './slovnik', heading: 'Malý vedecký slovník' },
  { path: './playlist', heading: 'Playlist na spríjemnenie misie' },
]

async function scanForViolations(page) {
  await page.waitForTimeout(350)
  const results = await new AxeBuilder({ page })
    .exclude('iframe')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  return results.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    nodes: nodes.map((node) => ({ target: node.target, html: node.html, failure: node.failureSummary })),
  }))
}

for (const screen of publicScreens) {
  test(`${screen.heading} has no WCAG A or AA violations`, async ({ page }) => {
    await page.goto(screen.path)
    await expect(page.getByRole('heading', { name: screen.heading })).toBeVisible()
    expect(await scanForViolations(page)).toEqual([])
  })
}

test('onboarding and gameplay screens have no WCAG A or AA violations', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(() => {
    localStorage.setItem('atomacik-save-v1', JSON.stringify({
      version: 3,
      currentScreen: 'results',
      resumeScreen: 'results',
      selectedWell: 1,
      selectedSample: 1,
      game: {
        locationId: 'mochovce',
        collected: Array(6).fill(true),
        analyzed: Array(6).fill(true),
        xp: 420,
        playerName: 'Testovací vedec',
        avatar: 'atom',
        employeeReady: true,
        interviewPassed: true,
        rewardedActivities: [],
      },
    }))
    sessionStorage.setItem('atomacik-lab-unlock-seen-v2', 'true')
  })

  const gameplayPaths = [
    './nastup',
    './uvodny-kviz',
    './lokalita',
    './instrukcie',
    './misia',
    './odber',
    './laboratorium',
    './spektrometer',
    './vysledky',
    './zaver',
    './profil',
  ]

  for (const path of gameplayPaths) {
    await page.goto(path)
    await expect(page.locator('#main-content h1').first()).toBeVisible()
    expect(await scanForViolations(page), `Accessibility violations on ${path}`).toEqual([])
  }
})

test('skip link and glossary tabs work from the keyboard', async ({ page }) => {
  await page.goto('./')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Preskočiť na hlavný obsah' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()

  await page.goto('./slovnik')
  const dictionaryTab = page.getByRole('tab', { name: 'Pojmy' })
  const flashcardsTab = page.getByRole('tab', { name: 'Kartičky' })
  await dictionaryTab.focus()
  await page.keyboard.press('ArrowRight')
  await expect(flashcardsTab).toBeFocused()
  await expect(flashcardsTab).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('button', { name: 'Slovník' })).toHaveAttribute('aria-current', 'page')
})
