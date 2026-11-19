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
  await expect(page.getByText('Вес', { exact: true })).toHaveCount(0);

  const frame = await phone.boundingBox();
  const panel = await controls.boundingBox();
  expect(frame.x + frame.width / 2).toBeCloseTo(640, 0);
  expect(frame.y + frame.height / 2).toBeCloseTo(450, 0);
  expect(panel.x).toBeGreaterThan(frame.x + frame.width);
  expect(panel.y).toBeLessThan(40);
});

test('variant, step jumps and interactions update the same phone preview', async ({ page }) => {
  await page.goto('/');
  const phone = page.getByRole('group', { name: 'Мокап iPhone 18 Pro' });
  await page.getByLabel('Гипотеза').selectOption('first-weight-entry');
  await expect(page).toHaveURL(/#experiment\/first-weight-entry$/);
  await expect(page.getByRole('radio', { name: 'A', exact: true })).toBeChecked();
  await expect(page.getByLabel('Переход')).toHaveValue('start');

  await phone.getByRole('button', { name: 'Добавить вес' }).click();
  await expect(page.getByLabel('Переход')).toHaveValue('entry');
  await phone.getByRole('spinbutton', { name: 'Вес, кг' }).fill('72');
  await phone.getByRole('button', { name: 'Сохранить' }).click();
  await expect(phone.getByRole('status')).toContainText('72 кг');
  await expect(page.getByLabel('Переход')).toHaveValue('saved');

  await page.locator('label[for="variant-b"]').click();
  await expect(page.getByRole('radio', { name: 'B', exact: true })).toBeChecked();
  await expect(page.getByLabel('Переход')).toHaveValue('entry');
  await expect(page.getByRole('option', { name: 'Стартовый экран' })).toHaveCount(0);
  await page.getByLabel('Переход').selectOption('saved');
  await expect(phone.getByRole('status')).toHaveText('Замер сохранён');

  await page.reload();
  await expect(page.getByLabel('Гипотеза')).toHaveValue('first-weight-entry');
  await expect(phone.getByRole('button', { name: 'Добавить вес' })).toBeVisible();
});

test('mobile preview shows only the parameters declared by the current hypothesis', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#experiment/measurement-history');

  const phone = page.getByRole('group', { name: 'Мокап iPhone 18 Pro' });
  const controls = page.getByRole('complementary', { name: 'Управление гипотезой' });
  await expect(page.getByRole('radio')).toHaveCount(0);
  await expect(page.getByLabel('Переход')).toHaveCount(0);
  await expect(phone.getByText('Сегодня')).toBeVisible();
  await page.getByLabel('Данные').selectOption('empty');
  await expect(phone.getByText('Замеров пока нет.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  const frame = await phone.boundingBox();
  const panel = await controls.boundingBox();
  expect(frame.x + frame.width / 2).toBeCloseTo(187.5, 0);
  expect(frame.y).toBeGreaterThan(panel.y + panel.height);
  expect(frame.y + frame.height).toBeLessThanOrEqual(812);

  await page.getByLabel('Гипотеза').selectOption('');
  await expect(page.getByLabel('Данные')).toHaveCount(0);
  await expect(phone.getByText('Замеров пока нет.')).toHaveCount(0);
  await page.goBack();
  await expect(page.getByLabel('Гипотеза')).toHaveValue('measurement-history');
  await expect(phone.getByText('Сегодня')).toBeVisible();
});
