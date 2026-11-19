import { expect, test } from '@playwright/test';

test('the empty phone is centered and the hypothesis selector sits in the upper right', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  const stage = page.getByRole('main');
  const phone = page.getByRole('group', { name: 'Мокап iPhone 18 Pro' });
  const controls = page.getByRole('complementary', { name: 'Управление гипотезой' });
  await expect(stage).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(page.getByLabel('Гипотеза')).toHaveValue('');
  await expect(page.getByLabel('Переход')).toHaveCount(0);
  await expect(page.getByLabel('Гипотеза')).toBeDisabled();
  await expect(page.getByRole('option')).toHaveText('Нет гипотез');

  const frame = await phone.boundingBox();
  const panel = await controls.boundingBox();
  expect(frame.x + frame.width / 2).toBeCloseTo(640, 0);
  expect(frame.y + frame.height / 2).toBeCloseTo(450, 0);
  expect(panel.x).toBeGreaterThan(frame.x + frame.width);
  expect(panel.y).toBeLessThan(40);
});

test('the empty preview fits on mobile even at a removed hypothesis URL', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#experiment/measurement-history');
  const phone = page.getByRole('group', { name: 'Мокап iPhone 18 Pro' });
  const controls = page.getByRole('complementary', { name: 'Управление гипотезой' });
  await expect(phone).toBeVisible();
  await expect(page.getByRole('option')).toHaveText('Нет гипотез');
  await expect(page.getByRole('radio')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  const frame = await phone.boundingBox();
  const panel = await controls.boundingBox();
  expect(frame.x + frame.width / 2).toBeCloseTo(187.5, 0);
  expect(frame.y).toBeGreaterThan(panel.y + panel.height);
  expect(frame.y + frame.height).toBeLessThanOrEqual(812);
});
