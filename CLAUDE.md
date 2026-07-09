# Проект: Thalia Beauty Studio (Next.js + OneEntry CMS)

Салон красоты в Дубае. Корень репозитория — рабочий Next.js-шаблон, полностью питающийся из OneEntry Headless CMS. Идёт поэтапное приведение шаблона к дизайну из `static-html/` и параллельное наполнение админки.

## Верстка `static-html/` — источник истины по дизайну

- `static-html/` — React-экспорт из Figma (Vite SPA), **референс дизайна, а не рабочий код**. Его не собираем, не правим и не импортируем из него код в шаблон — только портируем разметку/классы/значения.
- Ключевые файлы: `static-html/src/app/App.tsx` (шапка ~строка 927, футер ~725, роутинг), `components/HomePage.tsx` (секции главной: hero-карусель, SERVICE, GALLERY, BEST OFFERS с `OfferCard` ~строка 200), `components/*Page.tsx` (внутренние страницы, модалки), `data/priceList.ts` (77 услуг), `data/offers.ts`, `data/reviews.ts`, `Structure.md` (дерево категорий услуг).
- Верстка может быть запущена на `http://localhost:5173/` — сверяйся визуально.
- При портировании: динамические цвета оставляй в `style={}`, статичное — Tailwind-классами; брендовые константы верстки: PINK `#ed21f1` (= токен `fuchsia-500`), PINK2 `#f60efb` (= `fuchsia-450`), DARK `#4c4d56` (= `slate-400`), MUTED `#a8a9b5` (= `neutral-300`), CYAN `#109AA9`, PURPLE `#9B4FB2`.
- `static-html/` исключён из корневого `tsconfig.json` — не включать обратно (ломает `tsc`).
- Медиа верстки уже скопированы в `public/images/` («Beauty content», `baners/`, `Offer/`, `Any_specialist/`) и `public/icons/` (`thalia_logo.svg`, `ICONS_CATEGORY.svg`, `UAE_Dirham_Symbol.svg`).

## Дизайн-токены и иконки

- Токены — в `app/globals.css` `@theme`: акценты `--color-accent-pink/-pink-bright/-cyan/-cyan-light/-purple/-purple-soft`, `--color-logo-dot`; утилиты `bg-gradient-brand` (кнопки, 135deg) и `bg-gradient-footer` (футер, 120deg). Новые цвета из верстки — сначала в токены, потом в классы.
- Иконки — **lucide-react@0.487.0** (тот же набор и версия, что в верстке). Обёртки в `components/icons/*.tsx` сохраняют старый API (`active`, `size`) — при замене иконки менять содержимое обёртки, не её сигнатуру (иконки импортируются `import * as icons`).
- Символ дирхама — `components/shared/Dirham.tsx` (`<Dirham big />` в крупных ценах).
- Логотип — `components/shared/LogoIcon.tsx`: классы путей `beauty` (wordmark) и `salon` (мелкий текст) обязательны — их анимируют GSAP (`Loader`, `IntroAnimations`). Розовые точки `#FB0EE3`.
- Шрифт Lato уже совпадает с версткой. Фавиконка — `app/icon.svg` (T + розовая точка).

## OneEntry CMS

- Проект: `https://beauty.oneentry.cloud/`, env-переменные в `.env`: `NEXT_PUBLIC_ONEENTRY_URL`, `NEXT_PUBLIC_ONEENTRY_TOKEN` (старые имена `NEXT_PUBLIC_PROJECT_URL`/`APP_TOKEN` — легаси из v1, не использовать).
- Локаль одна — `en_US` (`LANG_CODE` в `app/api/api/api.ts`), `langCode` в SDK-вызовы не передавать.
- **MCP `oneentry` — использовать в первую очередь**: там уже есть готовые решения для большинства задач по SDK/CMS. Перед реализацией фичи или написанием SDK-кода проверять:
  - `get-skill` — готовые рецепты (`inspect-api`, `create-page`, `create-product-list`, `create-form`, `create-menu`, `create-reviews`, `create-auth`, `create-checkout`, `create-orders-list`, `create-profile`, `create-search` и др.) — не изобретать своё, если есть скилл;
  - `get-rule` — правила SDK (`attribute-values`, `attribute-sets`, `nextjs-pages`, `forms`, `orders`, `auth-provider`, `product-statuses`, `performance-*` и др.) — сверяться при работе с соответствующей областью;
  - `load-context` — полная документация SDK, если нужен свежий обзор.
- **Маркеры не угадывать.** Проверять реальное состояние админки инспекционным скриптом: `.claude/temp/inspect-*.mjs` (паттерн: `defineOneEntry` + env из `.env`, **резать строку по первому `=`** — токен содержит `=`; запуск `node .claude/temp/<имя>.mjs`). Есть готовые: `inspect-menus.mjs`, `inspect-masters.mjs`, `audit-content-plan.mjs` (полный аудит по плану наполнения).
- Известные сущности (сверено с API 2026-07-09, полный отчёт — `temp/ONEENTRY-CONTENT-PLAN.md`):
  - **Меню**: `main` (Home, Services & Prices, Offers, Gallery, Specialists, Contacts), `user_menu` (только profile), `services` (4 категории), `about_us` (masters, services, reviews). `bottom_web` в админке НЕТ.
  - **Страницы** (`pageUrl`): `home`, `services` (дети — 4 категории `hair`/`face`/`body`/`nails`, их дети — 15 подкатегорий с продуктами), `offers`, `masters`, `gallery` (детей нет), `contacts`, `booking`, `profile`, `404`, `reviews` (детей нет), `salons` (один ребёнок `beauty_one` **без атрибутов**; маркеры `salon_address`, `salon_phone`, `salon_phone_formatted` читает код, в админке они не заполнены). Страниц `payment_success`/`payment_canceled` нет. `attributeValues` у всех страниц пустые.
  - **Блоки**: в админке есть `home_hero`, `home_catalog`, `home_gallery`, `home_offers_feed` (к `home` привязаны только первые три); блоков `home_discounts`, `home_masters`, `reviews_carousel`, `system_content`, `opening_time` **НЕТ** (404) — код читает эти маркеры и обязан деградировать на фолбэки.
  - **`home_hero` — slider_block**: слайды НЕ в атрибутах блока, а через `Blocks.getSlides(marker)` (обёртка `getBlockSlides`); сейчас 3 слайда. Атрибуты слайда — «сырые» массивы файлов: `image_id1` (десктоп), `image_id2` (мобайл). Интервал — `time`/`timeInterval` из ответа.
  - **Продукт = услуга**: в каталоге 77 услуг (набор `a_sets_tpl_catalog_1_…`: `title`, `description`, `sku`, `duration`, `specialist_grade`; `price` — **строка** вида «450 AED», корневое числовое `price` пустое). Спец-предложения — продукты с `attributeSetIdentifier === 'service_set'` (атрибуты: `sale` — старая цена, `price` поле — акционная, `offer_type` — list, extended value = hex-цвет акцента, значение `party_star` = featured-карточка; `services` — состав); сейчас таких продуктов **0** — страницы offers работают на фолбэках.
  - **Мастера = админы OneEntry** (`getAdminsInfo` / `useGetAdminsQuery`), фильтр «мастер» = заполнен `master_name`; атрибуты `master_image`, `master_rating`, `master_expirience` (опечатка — так в админке!), `master_short_description`, `master_description`, `services`, `master_salon`, `master_schedule`, `master_portfolio`. Роут мастера — `/masters/{admin.id}`. Сейчас админов с `master_name` **нет** (0 из 2) — страницы specialists/booking работают на демо-ростере.
  - Заказы: storage `orders`, форма `order`, статусы `upcoming`/`canceled`/`completed`; формы `reg`, `contact_us`. Auth-провайдеры в админке не включены (`[]`); платёжные аккаунты `cash` и `stripe` заведены.
  - **`Forms.getFormByMarker`: `attributes` — массив ИЛИ объект** (`{}`, когда у формы нет полей — сейчас так у `reg`/`order`/`contact_us`). Не вызывать методы массива напрямую — нормализовать через `getFormAttributes` (`components/utils.ts`). Инспекция: `.claude/temp/inspect-forms.mjs`.
- API меню возвращает `children: []` у каждого пункта — `flatMenuToNested` (`components/utils.ts`) удаляет пустые; не полагаться на «есть поле children = есть подменю» без проверки длины.
- Данных в CMS пока мало: компоненты обязаны **деградировать без ошибок** (пустая секция/фолбэк), а не `notFound()` из-за отсутствующего блока/списка. Странице хватает `getPageByUrl` — блоки и списки опциональны.
- Пока `system_content` не заведён, у UI-текстов должны быть английские фолбэки в коде (`|| 'Book Online'`).

## Пошаговое наполнение админки (по запросу пользователя)

- План и порядок этапов — `temp/ONEENTRY-CONTENT-PLAN.md` (чеклист — п. 10, «Статус:» в каждой секции). Пользователь выполняет действия в админке **руками**, Claude выдаёт инструкции.
- Когда пользователь просит продолжить наполнение («идём по плану», «следующий шаг»): идти по этапам плана по порядку и **остановиться на первом незавершённом** (❌/🟡) шаге — выдать инструкцию только для него, не вываливать весь этап.
- Перед выдачей шага **сверить реальное состояние админки** инспекционным скриптом (`node .claude/temp/audit-content-plan.mjs` или профильный `inspect-*.mjs`) — статусы в файле плана могли устареть.
- При подготовке шага опираться на MCP `oneentry` (`get-skill`/`get-rule`) — как правильно устроены сущности (страницы, наборы атрибутов, формы, меню) там уже описано.
- Формат инструкции — сухой, строгий, императивный нумерованный список конкретных действий в админке, без рассуждений. Образец:

  ```text
  1. Создай страницу с маркером 'page_marker'.
  2. Выбери набор атрибутов с именем 'Page marker'.
  3. Заполни атрибуты:
     - 'attribute_name' — Какой-то текст
     - 'attribute_name_2' — изображение 'images/page_image.png'
     - 'attribute_name_3' — …
  4. Выполни ещё какое-то действие.
  ```

- Все конкретные значения (маркеры, тексты, цены, пути к файлам) брать из плана и верстки `static-html/` — ничего не выдумывать; опечатки из кода (`master_expirience`) не воспроизводить.
- После того как пользователь сообщит «сделано»: проверить результат через API тем же скриптом, обновить пометку «Статус:» и чеклист в `temp/ONEENTRY-CONTENT-PLAN.md`, затем выдать следующий шаг.

## Конвенции кода

- Строгий TS: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` — опциональный проп с `undefined` объявлять как `prop?: T | undefined`; индексный доступ сначала в переменную, потом проверка.
- Каждый компонент/функция — с JSDoc (стиль существующих файлов).
- Серверные обёртки SDK — `app/api/server/<домен>/<имя>.ts` (возврат `{ isError, error?, data? }`), экспорт добавлять в `app/api/index.ts`. Клиентские данные — RTK Query (`app/api/api/RTKApi.ts`) или хуки `app/api/hooks/`.
- GSAP-обёртки (`CardAnimations`, `TitleAnimations`, `HeroAnimations`, `OffersAnimations`) сохранять при переверстке; `HeroAnimations` ищет опциональные классы `.hero-bg`, `.hero-title`, `.hero-description`, `.hero-button`.
- Tailwind v4: линтер требует канонические классы (`aspect-390/535`, а не `aspect-[390/535]`). Фикс-шапка = `h-20`, спейсер под ней в `app/layout.tsx` — тоже `h-20`.
- `components/data.js` — временные захардкоженные данные (отзывы, соцсети, градиенты) до переноса в CMS.

## Рабочий процесс

- **Ничего не удалять без явной просьбы** — неиспользуемые компоненты оставлять на диске (например, `SearchBar.tsx`, `BottomMenu`, `OfferCircle`/`OfferInfo`).
- После правок: `npx tsc --noEmit` (должен быть exit 0) + визуальная проверка через Playwright MCP на `http://localhost:3000` (dev-сервер обычно запущен; если нет — `npm run dev` в фоне). Проверять десктоп (1280) и мобайл (390).
- Временные скриншоты Playwright сохраняются в корень проекта — удалять после проверки.
- Проверка подключения к CMS: `app/api/test-connection` и дашборд `app/api-test`.
- **Если dev-сервер ест CPU в холостую** (Turbopack ~800% без запросов, память растёт): это повреждённый persistent-кэш Turbopack — он на диске и переживает перезагрузку. Лечение: остановить dev, удалить `.next` и `node_modules/.cache`, запустить заново. Возникает после массовых правок / изменения `tsconfig.json` / установки пакетов (известная категория багов Next 16 Turbopack).
