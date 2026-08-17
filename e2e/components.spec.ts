import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// One test per src/ui component (matches Playground.tsx's one-Section-per-
// component layout) instead of one giant full-page screenshot — a change
// to, say, Checkbox only re-approves checkbox.png, not every component on
// the page. Static components are scoped to their own <section> (tighter
// diff); components whose open content visually escapes the card
// (Tooltip/Popover overflow above/below it, Dialog portals to
// document.body, Toast is fixed-positioned) fall back to a full-page shot.
interface ComponentSpec {
  name: string
  fullPage?: boolean
  setup?: (page: Page) => Promise<void>
}

const components: ComponentSpec[] = [
  { name: 'Box' },
  { name: 'Text' },
  { name: 'Badge' },
  { name: 'Button' },
  { name: 'Stack' },
  { name: 'Grid' },
  { name: 'Container' },
  { name: 'Divider' },
  { name: 'Field' },
  { name: 'Input' },
  { name: 'Textarea' },
  { name: 'Select' },
  { name: 'Checkbox' },
  { name: 'Switch' },
  {
    name: 'Tooltip',
    fullPage: true,
    setup: async (page) => {
      await page.hover('[data-component="Tooltip"] button')
      await page.waitForSelector('[role="tooltip"]')
    },
  },
  {
    name: 'Popover',
    fullPage: true,
    setup: async (page) => {
      await page.click('[data-component="Popover"] button')
      await page.waitForSelector('text=Popover content')
    },
  },
  { name: 'Tabs' },
  {
    name: 'Dialog',
    fullPage: true,
    setup: async (page) => {
      await page.click('[data-component="Dialog"] button:has-text("Open dialog")')
      await page.waitForSelector('[role="dialog"]')
    },
  },
  {
    name: 'Menu',
    fullPage: true,
    setup: async (page) => {
      await page.click('[data-component="Menu"] button')
      await page.waitForSelector('[role="menu"]')
    },
  },
  {
    name: 'Combobox',
    fullPage: true,
    setup: async (page) => {
      await page.fill('[data-component="Combobox"] input', 'a')
      await page.waitForSelector('[role="listbox"]')
    },
  },
  {
    name: 'Toast',
    fullPage: true,
    setup: async (page) => {
      await page.click('[data-component="Toast"] button')
      await page.waitForSelector('text=Saved')
    },
  },
]

test.describe('component gallery — per component', () => {
  for (const component of components) {
    test(component.name, async ({ page }) => {
      await page.goto('/playground.html')
      await page.waitForSelector('text=Component gallery')
      await component.setup?.(page)

      const fileName = `${component.name.toLowerCase()}.png`
      if (component.fullPage) {
        await expect(page).toHaveScreenshot(fileName, { fullPage: true })
      } else {
        await expect(page.locator(`[data-component="${component.name}"]`)).toHaveScreenshot(fileName)
      }
    })
  }
})
