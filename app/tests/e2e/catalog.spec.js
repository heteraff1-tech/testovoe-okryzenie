import { expect, test } from '@playwright/test';
import snapshot from '../../design-system/bootstrap-catalog.json' with { type: 'json' };

test('the live catalog finds components by published key and flags missing Vue wrappers', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bootstrap 5.3', exact: true })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ has: page.getByRole('link') })).toHaveCount(
    snapshot.components.length,
  );

  const search = page.getByRole('searchbox');
  await search.fill('3aad87adb4de2ef06be25cffb9cc28a7864c7268');
  await expect(page.getByRole('link', { name: 'button', exact: true })).toHaveAttribute(
    'href',
    /bootstrap-controls\.md#L\d+/,
  );
  await expect(page.getByRole('listitem').filter({ hasText: '.btn' })).toHaveCount(1);

  await search.fill('date-picker');
  await expect(page.getByText('Нужна Vue-обёртка', { exact: true })).toBeVisible();
  await search.fill('unmapped-key');
  await expect(page.getByText('Нет совпадений.', { exact: false })).toBeVisible();
});

test('mobile layout has no horizontal overflow and Bootstrap dialog restores keyboard focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bootstrap 5.3', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);

  const open = page.getByRole('button', { name: 'Как перенести макет' });
  await open.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Перенос из Figma' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(open).toBeFocused();
});

test('switching themes changes the resolved Bootstrap body color', async ({ page }) => {
  await page.goto('/');
  const theme = page.getByRole('button', { name: 'Тёмная тема' });
  const main = page.getByRole('main');
  const readColor = () => main.evaluate((element) => getComputedStyle(element).color);
  await expect(theme).toHaveAttribute('aria-pressed', 'false');
  const lightColor = await readColor();
  await theme.click();
  await expect(theme).toHaveAttribute('aria-pressed', 'true');
  expect(await readColor()).not.toBe(lightColor);
});
