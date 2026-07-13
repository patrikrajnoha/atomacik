import { expect, test } from '@playwright/test'

const publicScreens = [
  { path: './', heading: 'Atómáčik' },
  { path: './ako-to-funguje', heading: 'Ako prebieha vedecká výprava' },
  { path: './slovnik', heading: 'Malý vedecký slovník' },
  { path: './playlist', heading: 'Playlist na spríjemnenie misie' },
]

test('public screens stay within the viewport and remain scrollable', async ({ page }) => {
  for (const screen of publicScreens) {
    await page.goto(screen.path)
    await expect(page.getByRole('heading', { name: screen.heading })).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      pageWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewportHeight: window.innerHeight,
      pageHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    }))

    expect(dimensions.pageWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1)

    if (dimensions.pageHeight > dimensions.viewportHeight + 2) {
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    }
  }
})

test('mobile navigation and playlist do not trap the interface', async ({ page }) => {
  await page.goto('./')
  const menu = page.getByRole('button', { name: 'Otvoriť menu' })

  if (await menu.isVisible()) {
    await menu.click()
    await expect(page.getByRole('navigation', { name: 'Herné kroky' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Otvoriť menu' })).toBeFocused()
  }

  await page.goto('./playlist')
  const player = page.locator('.persistent-player.playlist-mode')
  await expect(player).toBeVisible()
  await expect(player).toHaveCSS('position', 'relative')

  const canonical = page.locator('link[rel="canonical"]')
  await expect(page).toHaveTitle('Playlist do práce | Atómáčik')
  await expect(canonical).toHaveAttribute('href', 'https://patrikrajnoha.github.io/atomacik/playlist')
})
