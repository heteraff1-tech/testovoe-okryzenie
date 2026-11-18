import { expect, test } from './fixtures';

test.use({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });

test('каталог открывается по умолчанию и восстанавливается с неизвестного адреса', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Тестовое окружение' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Все сценарии' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await page.goto('/#experiment/missing');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Сценарий не найден' })).toBeVisible();
  await page.getByRole('link', { name: 'Вернуться ко всем сценариям' }).click();
  await expect(page.getByRole('link', { name: 'Все сценарии' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
