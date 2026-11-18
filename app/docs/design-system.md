# Дизайн-система стенда

Используй цвета Light/Dark из `src/assets/styles/tokens/color.scss`, размеры и
отступы из `markup.scss`, текстовые стили из `text-style.scss` и эффекты из
`effects.scss`. Тему задавай на контейнере через `data-theme="light"` или
`data-theme="dark"`.

Для экспериментов переиспользуй примитивы из `src/shared/ui/`. SCSS компонентов
должен ссылаться на общие токены цветов и отступов. Для нового UI проверь
видимый фокус, reduced motion и ширину 375 px. Изменения проверяй через
`npm run qa` из `app/`.
