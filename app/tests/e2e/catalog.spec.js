import { expect, test } from './fixtures.js';

test.use({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });

test('прямая ссылка, перезагрузка, возврат и фокус работают в каталоге', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Каталог сценариев' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Каталог', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await page.goto('/#experiment/ci-unknown-scenario');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Сценарий не найден' })).toBeVisible();
  await page.getByRole('link', { name: 'К каталогу' }).click();
  await expect(page.getByRole('heading', { name: 'Каталог сценариев' })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Каталог', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
