import { expect, test } from '@playwright/test'

const missionTitles = [
  'Jazero pri lúke',
  'Lesná studnička',
  'Prameň pri skalách',
  'Dedinská studňa',
  'Rybničná vzorka',
  'Poľná studňa',
]

async function openMission(page, well) {
  await page.goto('./')
  await page.evaluate((selectedWell) => {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem('atomacik-save-v1', JSON.stringify({
      version: 3,
      currentScreen: 'sample',
      resumeScreen: 'sample',
      selectedWell,
      selectedSample: 1,
      game: {
        locationId: 'mochovce',
        collected: Array(6).fill(false),
        analyzed: Array(6).fill(false),
        xp: 0,
        playerName: 'Testovací vedec',
        avatar: 'atom',
        employeeReady: true,
        interviewPassed: true,
        rewardedActivities: [],
      },
    }))
  }, well)
  await page.goto('./odber')
  await expect(page.getByRole('heading', { name: missionTitles[well - 1] })).toBeVisible()
}

async function expectSampleReady(page) {
  await expect(page.getByText('Vzorka pripravená', { exact: true })).toBeVisible()
}

test('fills the first bottle to the safe target and labels it', async ({ page }) => {
  await openMission(page, 1)
  await page.clock.install()
  const holdButton = page.getByRole('button', { name: 'Klikni alebo podrž' })
  await holdButton.focus()
  await page.keyboard.down('Space')
  await page.clock.runFor(1900)
  await expect.poll(async () => {
    const level = Number.parseInt(await page.locator('.game-meter').innerText(), 10)
    if (level < 66 || level > 82) return false
    await page.keyboard.up('Space')
    return true
  }).toBe(true)

  await expect(page.getByText('Terénna výzva splnená')).toBeVisible()
  for (const part of ['VZ', '01', 'LUKA']) {
    await page.getByRole('button', { name: part, exact: true }).click()
  }
  await page.getByRole('button', { name: 'Mochovce', exact: true }).click()
  await page.getByRole('button', { name: 'Nalepiť štítok' }).click()
  await expectSampleReady(page)
})

test('selects the clean sampling spot', async ({ page }) => {
  await openMission(page, 2)
  await page.locator('.sample-spot.clean').click()
  await expectSampleReady(page)
})

test('configures the pipe system safely', async ({ page }) => {
  await openMission(page, 3)
  const filter = page.locator('.valve-card').filter({ hasText: 'Filter' })
  const outlet = page.locator('.valve-card').filter({ hasText: 'Výstup' })
  const inlet = page.locator('.valve-card').filter({ hasText: 'Prívod' })
  await filter.click()
  await filter.click()
  await outlet.click()
  await inlet.click()
  await expectSampleReady(page)
})

test('finds a stable sampling depth', async ({ page }) => {
  await openMission(page, 4)
  await page.getByRole('slider').fill('52')
  await page.getByRole('button', { name: 'Odobrať pri tejto hĺbke' }).click()
  await expectSampleReady(page)
})

test('removes bubbles without disturbing sediment', async ({ page }) => {
  await openMission(page, 5)
  await page.getByRole('slider').fill('35')
  const tap = page.getByRole('button', { name: 'Jemne poklepať' })
  await tap.click()
  await tap.click()
  await tap.click()
  await expectSampleReady(page)
})

test('plans the safe route to the final well', async ({ page }) => {
  await openMission(page, 6)
  await page.getByRole('button', { name: 'hore', exact: true }).click()
  const right = page.getByRole('button', { name: 'vpravo', exact: true })
  await right.click()
  await right.click()
  await right.click()
  await expectSampleReady(page)
})
