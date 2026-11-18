# Тестовое окружение

Исходный Vue-код взят из [SberZdorovie](https://github.com/heteraff1-tech/SberZdorovie/tree/d2e56ebac717e16b2d8807127fe129858fd443b5/app). В корне сайта открывается каталог экспериментов. Исходный демонстрационный сценарий доступен в `baseline.html` для сверки и регрессионных проверок.

Для нового эксперимента создай ветку `experiment/<slug>`. Реализуй сценарий в отдельном компоненте и добавь его в `app/src/lab/experiments.js` с названием и уникальным slug. Вкладка будет доступна по адресу `/#experiment/<slug>`.

Запуск и проверка выполняются из `app/` с Node.js 22.12 или новее.

```sh
npm ci
npm run dev
npx playwright install chromium
npm run qa
```

Cloudflare Pages собирает `app/` с помощью `npm test && npm run build` и публикует `app/dist/`. Изменения в `main` автоматически обновляют [стабильный каталог](https://testovoe-okryzenie.pages.dev). Ветки `experiment/*` автоматически публикуются на отдельных адресах превью. Адрес превью и SHA сборки указаны в Cloudflare Pages → Deployments.
