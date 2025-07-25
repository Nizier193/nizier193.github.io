# 🚀 Решение проблемы с VPN

## Проблема
Сайт не работает без VPN из-за блокировки CDN библиотек:
- `d3js.org` - для D3.js 
- `cdn.jsdelivr.net` - для Marked.js

## 💡 Решения

### Вариант 1: Автоматическое скачивание (Рекомендуется)
```bash
# Скачиваем библиотеки локально
node download-libs.js
```

После этого используйте `index-offline.html` - он автоматически будет использовать локальные файлы.

### Вариант 2: Ручное скачивание
1. Создайте папку `libs/`
2. Скачайте файлы:
   - [D3.js v7](https://d3js.org/d3.v7.min.js) → `libs/d3.min.js`
   - [Marked.js](https://cdn.jsdelivr.net/npm/marked/marked.min.js) → `libs/marked.min.js`
3. Используйте `index-offline.html`

### Вариант 3: Обновление основного index.html
Замените CDN на российские зеркала:

```html
<!-- Вместо -->
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<!-- Используйте -->
<script src="https://unpkg.com/d3@7/dist/d3.min.js"></script>
<script src="https://unpkg.com/marked@4/marked.min.js"></script>
```

## 🎯 Версии файлов

### `index.html`
- Оригинальная версия с зарубежными CDN
- Может не работать без VPN

### `index-offline.html` 
- Версия с резервными CDN и fallback на локальные файлы
- **Рекомендуется для использования без VPN**
- Автоматически пробует разные источники

## ⚡ Быстрое решение

1. Скачайте библиотеки:
   ```bash
   node download-libs.js
   ```

2. Используйте `index-offline.html` вместо `index.html`

3. Готово! 🎉

## 🔧 Дополнительные источники

Если основные CDN не работают, попробуйте:
- `unpkg.com` 
- `cdn.skypack.dev`
- `esm.sh`

## 📱 Для GitHub Pages
Когда загрузите на GitHub Pages, используйте `index-offline.html` как главный файл - переименуйте его в `index.html`. 