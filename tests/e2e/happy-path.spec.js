import { expect, test } from '@playwright/test'

test('fresh onboarding resumes and reaches the final mission badge', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()

  await page.getByRole('button', { name: 'Začať výpravu' }).click()
  await expect(page.getByRole('heading', { name: 'Vitaj vo výskumnom tíme. Ako sa voláš?' })).toBeVisible()
  await page.getByLabel('Tvoje meno').fill('Testovací vedec')
  await page.getByRole('button', { name: 'Pokračovať na úvodný kvíz' }).click()

  await expect(page.getByRole('heading', { name: 'Krátky vstupný kvíz' })).toBeVisible()
  await page.getByRole('button', { name: 'Preskočiť minihru' }).click()
  await page.getByRole('button', { name: 'Potvrdiť preskočenie' }).click()

  await expect(page.getByRole('heading', { name: 'Vyber si pracovnú lokalitu' })).toBeVisible()
  const mochovceCard = page.locator('.location-card').filter({ has: page.getByRole('heading', { name: 'Mochovce' }) })
  await mochovceCard.getByRole('button', { name: 'Začať tu' }).click()
  await page.getByRole('button', { name: 'Začať obchádzku' }).click()

  await expect(page.getByRole('heading', { name: 'Nájdi všetkých 6 studní' })).toBeVisible()
  await page.getByRole('button', { name: /Studňa 1/ }).click({ force: true })
  await expect(page.getByText('Studňa 1 /', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Späť na mapu' }).click()

  await page.getByRole('button', { name: 'Domov' }).click()
  await expect(page.getByText('Uložený postup:')).toBeVisible()
  await page.getByRole('button', { name: 'Pokračovať vo výprave' }).click()
  await expect(page.getByRole('heading', { name: 'Nájdi všetkých 6 studní' })).toBeVisible()

  await page.evaluate(() => {
    const key = 'atomacik-save-v1'
    const save = JSON.parse(localStorage.getItem(key))
    save.currentScreen = 'lab'
    save.resumeScreen = 'lab'
    save.game.collected = Array(6).fill(true)
    save.game.analyzed = Array(6).fill(false)
    localStorage.setItem(key, JSON.stringify(save))
  })
  await page.goto('./laboratorium')

  await expect(page.getByRole('heading', { name: 'Laboratórne meranie' })).toBeVisible()
  await page.getByRole('button', { name: 'Spustiť meranie' }).click()
  for (let batch = 0; batch < 3; batch += 1) {
    await page.getByRole('button', { name: 'Preskočiť minihru' }).click()
    await page.getByRole('button', { name: 'Potvrdiť preskočenie' }).click()
    await page.getByRole('button', { name: 'Pokračovať', exact: true }).click()
  }

  const conclusionButton = page.getByRole('button', { name: 'Urobiť záver' })
  await expect(conclusionButton).toBeEnabled({ timeout: 8_000 })
  await conclusionButton.click()
  await page.getByLabel('Nie, Cs-137 nebol zachytený').check()
  await page.getByRole('button', { name: 'Skontrolovať' }).click()
  await expect(page.getByRole('heading', { name: 'Ochranca vody' })).toBeVisible({ timeout: 5_000 })
})

test('playlist explains when Spotify is offline', async ({ context, page }) => {
  await page.goto('./')
  await context.setOffline(true)
  await page.getByRole('button', { name: 'Playlist' }).click()

  await expect(page.getByText('Playlist potrebuje internet')).toBeVisible()
  await expect(page.getByTitle('Spotify playlist do práce')).toHaveCount(0)

  await context.setOffline(false)
  await expect(page.getByTitle('Spotify playlist do práce')).toBeVisible()
})
