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
- Известные сущности (снимок 2026-07-09, ключевые статусы обновлены 2026-07-12; живой источник — `temp/ONEENTRY-CONTENT-PLAN.md`):
  - **Меню**: `main` (Home, Services & Prices, Offers, Gallery, Specialists, Contacts), `user_menu` (только profile), `services` (4 категории), `about_us` (masters, services, reviews). `bottom_web` в админке НЕТ.
  - **Страницы** (`pageUrl`): `home`, `services` (дети — 4 категории `hair`/`face`/`body`/`nails`, их дети — 15 подкатегорий с продуктами), `offers`, `masters`, `gallery` (детей нет), `contacts`, `booking`, `profile`, `404`, `reviews` (детей нет), `salons` (3 ребёнка `downtown`/`marina`/`jbr`, набор `salon`; код читает `salon_address` и `salon_phone`, телефон форматируется на фронте `formatUaePhone` из `components/utils.ts` — отдельного `salon_phone_formatted` в CMS больше нет; атрибут `salon_time` (timeInterval) заведён, но кодом пока не читается). Страниц `payment_success`/`payment_canceled` нет. `attributeValues` у всех страниц пустые.
  - **Блоки**: `home_hero`, `home_catalog`, `home_gallery`, `home_offers_feed`, `home_discounts`, `home_masters`, `reviews_carousel` — есть и привязаны к `home` (2026-07-12). `system_content` — **есть** (блок `common_block`, 34 UI-текста, читается публичным SDK через `getDictionary`; проверено 2026-07-13). `reviews_carousel` создан, но **пуст** (без атрибутов/слайдов) — отзывы фронта пока на моке. `opening_time` **НЕТ** (404) — код читает этот маркер и обязан деградировать на фолбэк.
  - **`home_hero` — slider_block**: слайды НЕ в атрибутах блока, а через `Blocks.getSlides(marker)` (обёртка `getBlockSlides`); сейчас 4 слайда. Атрибуты слайда — «сырые» массивы файлов: `image_id1` (десктоп), `image_id2` (мобайл). Интервал — `time`/`timeInterval` из ответа.
  - **Продукт = услуга**: в каталоге 77 услуг-продуктов (набор `service`: `title`, `description` (text), `sku` (string), `duration` (integer, минуты), `specialist_grade` (list), `currency` (string, «AED», флаг `isCurrency`)). **`price` — число** (`float`, напр. `370`; сверено 2026-07-17), доступно и как `product.price` верхнего уровня — код читает именно его (`services/catalog-data`), а строка «450 AED» — устаревшее описание v1. Атрибута `sale` у услуг **нет и не нужен**: распродажу читает только `offer_sale` у офферов, в верстке скидок на отдельные услуги нет. Спец-предложения — **4 продукта с набором `offer`** (id 310–313; поля `offer_price`/`offer_sale`/`offer_type`/`offer_sku`/`offer_services` — внутр. `real_id2`/`real_id3`/…/`entity_id4`; `offer_services` заполнен составом по плану §4). Код различает оффер по `attributeSetIdentifier === 'offer'` (5 мест: `services/catalog-data`, `offers/page`, `offers-table`, `offers-feed`, `products-table`) — совпадает с фактическим набором CMS `offer` (проверено 2026-07-12; `service_set` в коде нет).
  - **Мастера = админы OneEntry** (`getAdminsInfo` / `useGetAdminsQuery`), фильтр «мастер» = заполнен `master_name`; набор атрибутов `master` (для админов): `master_image` (image), `master_rating` (integer), `master_expirience` (string, опечатка — так в админке!), `master_short_description` (string), `master_description` (text), `master_services` (entity → **продукты-услуги**, `value.id` — строка `p-{pageId}-{productId}`, для категории брать `value.parentId`), `master_salon` (entity → страница салона), `master_schedule` (timeInterval), `master_portfolio` (entity → страницы-фото галереи). Роут мастера — `/masters/{admin.id}`. **Все 32 мастера заполнены** (2026-07-12, скрипты `fill-masters*.mjs`+`fill-gallery.mjs`), фронт мастеров/галереи/портфолио починен (маркер `services`→`master_services`, категория по `parentId`). Схема маркеров — префиксная (по таблице п.1.3 плана).
  - Заказы: storage `orders`, форма `order`, статусы `upcoming`/`canceled`/`completed`; формы `reg`, `contact_us`. Auth-провайдеры в админке не включены (`[]`); платёжные аккаунты `cash` и `stripe` заведены.
  - **`Forms.getFormByMarker`: `attributes` — массив ИЛИ объект** (`{}`, когда у формы нет полей — сейчас так у `reg`/`order`/`contact_us`). Не вызывать методы массива напрямую — нормализовать через `getFormAttributes` (`components/utils.ts`). Инспекция: `.claude/temp/inspect-forms.mjs`.
- API меню возвращает `children: []` у каждого пункта — `flatMenuToNested` (`components/utils.ts`) удаляет пустые; не полагаться на «есть поле children = есть подменю» без проверки длины.
- Данных в CMS пока мало: компоненты обязаны **деградировать без ошибок** (пустая секция/фолбэк), а не `notFound()` из-за отсутствующего блока/списка. Странице хватает `getPageByUrl` — блоки и списки опциональны.
- `system_content` заполнен, но словарь опционален — у UI-текстов всё равно держать английские фолбэки в коде (`|| 'Book Online'`) на случай недоступности блока.

## Пошаговое наполнение админки (по запросу пользователя)

- План и порядок этапов — `temp/ONEENTRY-CONTENT-PLAN.md` (чеклист — п. 10, «Статус:» в каждой секции). Пользователь выполняет действия в админке **руками**, Claude выдаёт инструкции.
- Когда пользователь просит продолжить наполнение («идём по плану», «следующий шаг»): идти по этапам плана по порядку и **остановиться на первом незавершённом** (❌/🟡) шаге — выдать инструкцию только для него, не вываливать весь этап.
- Перед выдачей шага **сверить реальное состояние админки** инспекционным скриптом (`node .claude/temp/audit-content-plan.mjs` или профильный `inspect-*.mjs`) — статусы в файле плана могли устареть.
- При подготовке шага опираться на MCP `oneentry` (`get-skill`/`get-rule`) — как правильно устроены сущности (страницы, наборы атрибутов, формы, меню) там уже описано.
- **Всегда указывать тип каждого атрибута** — и при создании набора атрибутов, и при заполнении значений (в скобках после маркера). Тип брать из набора OneEntry: `string`, `text`, `textWithHeader`, `integer`, `real`, `float`, `date`, `dateTime`, `time`, `file`, `image`, `groupOfImages`, `list`, `radioButton`, `entity`, `button`, `spam`, `timeInterval` (типа `json` нет — это `string`/`text` с ручным парсингом). Тип сверять с планом (`temp/ONEENTRY-CONTENT-PLAN.md`, п. 1.3) и кодом шаблона (как читается `?.value`), не угадывать.
- Формат инструкции — сухой, строгий, императивный нумерованный список конкретных действий в админке, без рассуждений. Образец:

  ```text
  1. Создай набор атрибутов с маркером 'set_marker' (название — Set marker) и атрибутами:
     - 'attribute_name' (string)
     - 'attribute_name_2' (image)
     - 'attribute_name_3' (list)
  2. Создай страницу с маркером 'page_marker', выбери набор атрибутов 'set_marker'.
  3. Заполни атрибуты:
     - 'attribute_name' (string) — Какой-то текст
     - 'attribute_name_2' (image) — изображение 'images/page_image.png'
     - 'attribute_name_3' (list) — …
  4. Выполни ещё какое-то действие.
  ```

- Все конкретные значения (маркеры, тексты, цены, пути к файлам) брать из плана и верстки `static-html/` — ничего не выдумывать; опечатки из кода (`master_expirience`) не воспроизводить.
- После того как пользователь сообщит «сделано»: проверить результат через API тем же скриптом, обновить пометку «Статус:» и чеклист в `temp/ONEENTRY-CONTENT-PLAN.md`, затем выдать следующий шаг.

## Наполнение через внутренний admin API (скрипты — быстрый путь)

Кроме ручного пути выше, сущности можно **заполнять автоматически скриптами** через внутренний REST API админки (`/api/admin/*`) — им пользуется сама панель. Публичный SDK (`defineOneEntry`) для записи **не годится**: он read-only и отдаёт данные по токену проекта. Скрипты и общий модуль — в `.claude/temp/` (`masters-common.mjs` = логин+хелперы+датасет мастеров; `fill-masters*.mjs`, `fill-gallery.mjs`, `fill-offers-services.mjs`, `fill-offer-picker.mjs`). **Не удалять.** Все идемпотентны, поддерживают `DRY_RUN=1`, `ONLY="Имя"`, `HEADLESS=0`.

- **Аутентификация:** логин через UI-форму Playwright (`chromium` из `@playwright/test`) → взять cookie `accessToken` (не httpOnly) → слать заголовок `Authorization: Bearer`. Креды — env `OE_ADMIN_LOGIN`/`OE_ADMIN_PASSWORD`. Сессия живёт ~15 мин (перелогиниваться); `page.goto` логина иногда флакает (ретрай). **НЕ** ставить глобальный `content-type: application/json` в request-context — ломает multipart-загрузку файлов (Playwright сам выставит тип per-request).
- **Механика сохранения — «автосейв целым объектом»** (кнопки Save в UI нет): GET сущность → мутировать → PUT весь объект обратно.
  - Мастер = админ: `GET/PUT /api/admin/admins/{id}`. Выбор набора для «пустого» админа (`attributeSetId` null→10) проходит **одним** PUT вместе со значениями.
  - Продукт (услуга/оффер): `GET/PUT /api/admin/products/{id}`.
  - Страница: создать `POST /api/admin/pages` (`{parentId, attributeSetId, pageUrl, isVisible, generalTypeId:17, localizeInfos:{en_US:{title, htmlContent:'', plainContent:'', menuTitle}}, attributesSets:{en_US:{}}}`) → затем `PUT /api/admin/pages/{id}`; удалить — `DELETE`.
  - Набор атрибутов: `GET/PUT /api/admin/attributes-sets/{id}` (поля в `.schema.attribute{N}`).
  - Файл (image/groupOfImages): multipart `POST /api/admin/files?type=admin|page&entity=images&id={id}&edit=false&compress=true&template=1`, поле `file` → `[{filename,downloadLink,previewLink,defaultPreview,size,contentType}]`; в PUT положить `[{...fileObj, params:{isImageCompressed:true}}]`. Сущность должна существовать **до** загрузки (файл кладётся под её id).
    - **`&template=1` обязателен** — именно он включает генерацию превью (`previewLink.default[0]` = готовый base64-LQIP для `blurDataURL`, `[1]` = URL уменьшенной версии). Без него ответ приходит без `previewLink`, превью не создаётся **никогда** (ни асинхронно, ни при PUT), и фронт вынужден качать оригинал и гонять его через sharp. Проверено экспериментально 2026-07-16 и снято с реального запроса UI админки (`/content/edit-page/{id}?tab=3` → зона Drag&drop).
    - `entity` — **множественное число** (`images`), как шлёт UI; путь файла тогда `…/page/{id}/images/…`. Одного `entity=images` без `template=1` недостаточно.
    - Грабли: `fill-gallery.mjs`/`fill-masters-photos.mjs` исторически слали `entity=image` без `template` — 196 из 216 фото галереи остались без превью; вылечено перезаливкой (`.claude/temp/refill-gallery-previews.mjs`, аудит — `check-previewlink.mjs`). Старые файлы остаются на CDN сиротами: эндпоинта удаления файла в admin API не найдено.
  - Поиск продукта: `GET /api/admin/products/quick/search?name=X&langCode=en_US` → `[{id,title,pageId}]`.
- **Внутренние id полей позиционные** (`string_id1`, `image_id2`, `integer_id3`, `text_id6`, `entity_id7`, `timeInterval_id9`…) — **читать из GET-объекта, не угадывать**. Значения лежат в `attributesSets.{locale}` (у продукта/страницы — там же), НЕ в `attributeValues` (последнее — read-формат публичного SDK).
- **Форматы значений (write — отличаются от read-формата SDK):**
  - `entity` → `[{title, value:{id, depth, isPinned:false, parentId, position, selected:true}}]`. Ссылка на **страницу** — `id` числовой (салон 39/40/41, parentId 10; страница-фото галереи — её id, parentId=категория). Ссылка на **продукт** — `id` строка `"p-{pageId}-{productId}"` (детерминируется из quick-search: `id`=productId, `pageId`), `parentId=pageId`, `depth:3`.
  - `text` → `[{htmlValue:'<p>…</p>', mdValue:'', plainValue:'', params:{editorMode:'html', isImageCompressed:true}}]`.
  - `timeInterval` → массив групп (по одной на день недели), `inEveryWeek/inEveryMonth:true`, `times` — почасовые пары `{hours,minutes}` (эталон — Пн–Вс 10:00–22:00). UUID — `crypto.randomUUID()`.
  - `list` (напр. `master_id` у страницы-фото) → `[{title, value:"<id>", extended:{type:null,value:null}, position}]`.
- **Опции пикера entity-атрибута** («List options» в UI) — это **курируемый** список в `schema.attribute{N}.listTitles.{locale}` набора (НЕ автоматом из каталога). Формат — то же дерево `{title, value:{id, depth, parentId, position, selected}}` (страницы-контейнеры `selected:false`, листья-продукты `selected:true`). Чтобы в пикере были все услуги — пересобрать `listTitles` по всему дереву каталога и `PUT` набор (`fill-offer-picker.mjs`; перед записью **бэкапить** оригинал). Значения атрибута можно ставить и **в обход** пикера (прямым PUT реальным `p-…`-id) — сохранятся и отрендерятся независимо от `listTitles`.
- **После записи — всегда верифицировать** (повторный GET / публичный SDK / визуально на dev через Playwright MCP) и обновлять статусы в `temp/ONEENTRY-CONTENT-PLAN.md`.
- Соответствие маркер→внутренний id и полный разбор — в памяти проекта (`admin-api-fill-mechanics`, `masters-category-filter-mismatch`).

## Конвенции кода

- Строгий TS: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` — опциональный проп с `undefined` объявлять как `prop?: T | undefined`; индексный доступ сначала в переменную, потом проверка.
- **Одна функция — один файл. Крупные компоненты дробить на мелкие сразу**, не откладывая на «потом». Каждый компонент/хук/утилита живёт в отдельном файле, названном по этой функции; несколько экспортируемых функций в одном файле — недопустимо (исключение — приватные хелперы, используемые только внутри этого же файла). Структура — как в шаблоне: `components/layout/<name>/index.tsx` (композиция) + `components/layout/<name>/components/<Sub>.tsx` (по одному подкомпоненту на файл), анимации — `.../animations/<Name>.tsx`. Если в компоненте появляется вложенная разметка секции/карточки/строки — выносить её в подкомпонент до того, как файл разрастётся, а не после.
- Каждый компонент/функция — с JSDoc (стиль существующих файлов), включая внутренние именованные хелперы и хендлеры (исключение — безымянные коллбэки в `.map`/`useEffect`/`onClick`).
- **Стиль JSDoc — осознанное отклонение от внешнего правила `jsdoc`:** и `@param`, и `@returns` в проекте несут **тип в фигурных скобках** (`@returns {JSX.Element} …`), вопреки формулировке `jsdoc.md` («@returns без типа»). Отклонение единообразно (≈422/443 тегов `@returns`) и закреплено как «стиль существующих файлов»: в новом/редактируемом коде держать тип у обоих тегов, существующие блоки массово не переписывать под «без типа». Нюансы «первая строка `Name — что делает` (em-dash)», «пустая строка перед первым `@param`» и редкие файлы с бестиповыми/псевдо-`@param` (эндпоинты `RTKApi`, `OpenDrawerContext`) применяются по базе непоследовательно — это документационные мелочи без рантайм-эффекта, править по месту при редактировании файла, без масс-кодмода.
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
