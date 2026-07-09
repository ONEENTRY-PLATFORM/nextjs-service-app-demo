# План наполнения админки OneEntry контентом из верстки `static-html`

> **Источник контента:** верстка салона красоты «Thalia» (Dubai) в [static-html/](static-html/) — React-экспорт из Figma, запущен на <http://localhost:5173/>.
> **Потребитель контента:** Next.js-шаблон в корне проекта (`app/`, `components/`), который уже читает конкретные маркеры из OneEntry.
> Все маркеры ниже взяты из кода шаблона — их нужно воспроизводить в админке **точно** (включая опечатку `master_expirience`).

**🔎 Аудит по реальному API — 2026-07-09** (скрипты `.claude/temp/audit-content-plan.mjs`, `audit-content-plan2.mjs`).
Обозначения: ✅ выполнено · 🟡 частично / сделано иначе · ❌ не сделано. Пометки «**Статус:**» добавлены в каждую секцию.

---

## 0. Исходные данные (что переносим)

| Сущность | Источник в верстке | Объём |
|---|---|---|
| Услуги (прайс) | `static-html/src/app/data/priceList.ts` | ~77 SKU, 4 категории, 16 подкатегорий |
| Салоны | `ContactsPage.tsx` (SALONS, SALON_DETAILS) | 3: Downtown, Marina, JBR |
| Мастера | `App.tsx` (MASTERS) + `MastersPage.tsx` (DETAILS) | 32 специалиста |
| Акции | `static-html/src/app/data/offers.ts` | 4 оффера + условия |
| Отзывы | `static-html/src/app/data/reviews.ts` | 17 отзывов |
| Фото | `static-html/src/assets/Beauty content/` | портреты, работы (по салонам/мастерам), фото салонов + баннеры в `assets/Offer/` |
| Тексты, контакты, часы работы | `ContactsPage.tsx`, `App.tsx` (футер), `HomePage.tsx` | — |

Категорийное дерево услуг (из `static-html/Structure.md`):

- **HAIR**: Haircut, Coloring, Styling, Hair Care (20 услуг)
- **FACE**: Facials, Aesthetic Treatments, Brows & Lashes, Makeup (24)
- **BODY**: Massage, Hammam & Rituals, Body Wraps, Waxing & Sugaring, Henna Art (25)
- **NAILS**: Manicure, Pedicure (8)

---

## 1. Подготовка проекта

1. **Локаль**: только `en_US` — шаблон моноязычный (`app/api/api/api.ts`, `LANG_CODE = 'en_US'`). Другие локали не создавать.
2. **Медиабиблиотека**: загрузить и структурировать фото:
   - портреты мастеров (`Beauty content/Specialist/<Salon>/<Имя>.jpeg`);
   - работы (`Beauty content/Gallery/<Salon>/<Имя>_<дисциплины>/<Услуга>.jpeg`) — имена файлов кодируют мастера, салон и услугу, эти связи переносим в атрибуты;
   - фото салонов (`Beauty content/Contacts/`);
   - баннеры героя/акций (`assets/Offer/banner_*.jpeg`), логотип `thalia_logo.svg`.
3. **Наборы атрибутов** (attribute sets) — создать до контента:

   | Маркер сета | attribute_marker | Тип | Примечание |
   | --- | --- | --- | --- |
   | `page_simple` | `page_tag` | string | заголовок hero категории |
   | `page_simple` | `page_title` | string | заголовок hero категории |
   | `page_simple` | `page_hero_bg` | image | фон hero |
   | `page_simple` | `page_hero_description` | text | маркетинговое описание |
   | `salon` | `salon_address` | string | |
   | `salon` | `salon_phone` | string | |
   | `salon` | `salon_phone_formatted` | string | |
   | `salon` | `products` | list | услуги, доступные в салоне |
   | `salon` | `services` | list | категории услуг салона |
   | `gallery` | `gallery_cat_thumb` | image | превью категории работ |
   | `gallery` | `gallery_category` | list | ссылка на категорию услуг (п. 2.2) |
   | `gallery` | `master_id` | list | мастер-админ, автор работы |
   | `gallery` | `gallery_photos` | image (multiple) | сами фото |
   | `service` | `title` | string | заголоввок |
   | `service` | `description` | text | описание |
   | `service` | `price` | number | базовая цена |
   | `service` | `sale` | number | цена распродажи |
   | `service` | `type` | list | бейдж-грейд (Top Stylist…) |
   | `service` | `sku` | string | `hh01`, `hc02`… — участвует в поиске |
   | `service` | `stickers` | list | |
   | `service` | `color` | list | |
   | `offer` | `offer_type` | list | extended value = акцентный цвет |
   | `offer` | `price` | number | базовая цена |
   | `offer` | `sale` | number | цена распродажи |
   | `offer` | `services` | list | состав оффера (ссылки на услуги) |
   | `master` | `master_name` | string | признак «это мастер» для кода |
   | `master` | `master_image` | image | портрет |
   | `master` | `master_rating` | number | 4–5 |
   | `master` | `master_expirience` | string | ⚠️ опечатка намеренная — так в коде |
   | `master` | `master_short_description` | string | роль (Top Stylist / Makeup Artist…) |
   | `master` | `master_description` | text | bio из `MastersPage.tsx` DETAILS |
   | `master` | `services` | list | категории услуг мастера (п. 2.2) |
   | `master` | `master_salon` | list | ссылки на страницы салонов |
   | `master` | `master_schedule` | interval | рабочие дни + тайм-слоты |
   | `master` | `master_portfolio` | list | страницы-фото галереи с работами |

   Сеты по сущностям:
   `service_page` — страницы-категории услуг (п. 2.2),
   `salon` — страницы салонов (п. 2.3),
   `gallery` — галерея (п. 2.4),
   `service` — услуги-продукты (п. 3),
   `offer` — офферы (п. 4),
   `master` — мастера-админы (п. 7).

   Маркеры **`service_set`** и **`service_product`** зашиты в код шаблона (`attributeSetIdentifier === 'service_set'` отличает оффер от услуги в offers/booking, `=== 'service_product'` фильтрует услуги в поиске) — воспроизводить точно. Маркеры со звёздочкой (\*) в коде не проверяются — предложены планом, при заведении можно переименовать.

> **Статус (2):** 🟡 медиа — баннеры hero загружены (слайды `home_hero` с `image_id1`/`image_id2`); портреты мастеров, работы и фото салонов через API нигде не фигурируют — судя по всему, не загружены/не привязаны.
> **Статус (3):** 🟡 наборы атрибутов — для продуктов заведён свой набор (`title`, `description`, `sku`, `duration`, `specialist_grade`, `price`), он **отличается** от планового (нет `sale`/`type`/`stickers`/`color`, зато есть `duration` и `specialist_grade`). Наборы для страниц услуг (`service_hero_*`), салонов (`salon_*`), галереи, офферов (`service_set`) и мастеров (`master_*`) — ❌ не обнаружены (у всех страниц и админов `attributeValues` пустые).

---

## 2. Страницы (Pages)

### 2.1 Системные страницы (getPageByUrl)

| pageUrl | Заголовок | Контент из верстки |
|---|---|---|
| `home` | Home | метаданные; секции — блоками (п. 5) |
| `services` | Services & Prices | hero «SERVICES & PRICES», подзаголовок «77 services · 3 locations across Dubai» |
| `masters` | Specialists | заголовок страницы мастеров |
| `gallery` | Gallery | заголовок галереи |
| `contacts` | Contacts | hero «CONTACTS», «3 locations · Always happy to see you», общий телефон `+971 4 784 0098`, e-mail `hello@beautystudio.com`, head office |
| `booking` | Book Online | заголовок визарда бронирования |
| `profile` | Account | личный кабинет |
| `404` | Not found | + атрибут `error_description` |
| `payment_success`, `payment_canceled` | — | служебные страницы оплаты |

> **Статус:** 🟡 страницы `home`, `services`, `offers`, `masters`, `gallery`, `contacts`, `booking`, `profile`, `404` — ✅ созданы, заголовки совпадают с планом; сверх плана есть `salons` (id 10) и `reviews` (id 38). ❌ `payment_success` и `payment_canceled` отсутствуют. ⚠️ у всех страниц `attributeValues` пустые — hero-тексты/`error_description` не заведены (шаблон живёт на фолбэках).

### 2.2 Категории услуг — дети страницы `services`

Код (`CatalogGrid`, `masters/page.tsx`, booking) строит каталог из **детей `services`**; мастера и галерея привязываются к этим страницам по id. Рекомендация: **дети = подкатегории прайса** (16 страниц), т.к. специализации мастеров в верстке (Manicure, Pedicure, Makeup) и иконки шаблона (`hair-cut`, `hair-color`, `styling`, `make-up`, `manicure`, `pedicure`) работают на этом уровне.

Для каждой: `pageUrl` (напр. `haircut`, `coloring`, `styling`, `hair-care`, `facials`, `aesthetic-treatments`, `brows-lashes`, `makeup`, `massage`, `hammam-rituals`, `body-wraps`, `waxing-sugaring`, `henna-art`, `manicure`, `pedicure`), атрибуты `service_hero_title`, `service_hero_bg`, `service_hero_description` (маркетинговые описания есть в `priceList.ts`).

> **Статус:** 🟡 сделано **иначе, двухуровнево**: дети `services` = 4 главные категории (`hair`, `face`, `body`, `nails`), а 15 подкатегорий из списка выше — их дети (все `pageUrl` совпадают с планом; `hammam-rituals` и т.д. на месте). Продукты привязаны к подкатегориям (haircut 3, coloring 7, styling 5, hair-care 5; brows-lashes 7, makeup 4, facials 5, aesthetic-treatments 8; massage 5, hammam-rituals 3, waxing-sugaring 9, body-wraps 4, henna-art 4; manicure 4, pedicure 4 = 77). ❌ атрибуты `service_hero_*` не заведены ни у одной страницы.

### 2.3 Салоны — родитель `salons` + 3 ребёнка

| pageUrl | Название | salon_address | salon_phone |
|---|---|---|---|
| `salons` | (родитель, невидимый) | — | — |
| `downtown` | Thalia Downtown | Sheikh Mohammed bin Rashid Blvd, Downtown Dubai | +971 4 701 2200 |
| `marina` | Thalia Marina | Marina Walk, Dubai Marina | +971 4 702 3300 |
| `jbr` | Thalia JBR | The Walk, Jumeirah Beach Residence | +971 4 703 4400 |

Плюс `salon_phone_formatted`, списки `products`/`services` (какие услуги доступны в салоне — из матрицы цен `priceList.ts`: например, Balayage недоступен в JBR), фото салона из `Beauty content/Contacts/`. Тексты about/tagline/highlights — из `SALON_DETAILS` в `ContactsPage.tsx`.

> **Статус:** ❌ практически не сделано: родитель `salons` есть, но ребёнок один — `beauty_one` («Beauty One», не из верстки) и **без единого атрибута** (`salon_address`/`salon_phone` пустые). Трёх салонов Downtown/Marina/JBR нет — страница contacts шаблона живёт на демо-фолбэке.

### 2.4 Галерея — родитель `gallery` → категории → страницы-фото

- Дети `gallery` = категории работ (по подкатегориям услуг: Haircut, Coloring, Styling, Makeup, Manicure, Pedicure, Massage…): атрибуты `gallery_cat_thumb` (превью), `gallery_category` (ссылка на категорию услуг из п. 2.2).
- Внутри каждой категории — страницы-фото: `gallery_photos` (сами изображения), `master_id` (id мастера-админа). Связи «фото → мастер/салон/услуга» берём из структуры папок `Beauty content/Gallery/`.
- Для главной достаточно 6 категорий с превью (как в секции GALLERY на HomePage).

> **Статус:** ❌ не сделано: у страницы `gallery` нет детей вообще.

---

## 3. Каталог услуг (Products)

**Продукт = услуга.** Завести ~77 продуктов из `priceList.ts`, каждый привязать к своей странице-категории (п. 2.2).

Поля продукта:

- название, описание (маркетинговое из `priceList.ts`);
- `price` — базовая цена. ⚠️ **Решение по ценам**: в верстке цена = f(салон × тариф premium/mid/budget), у шаблона — одно поле `price` (+`sale`). Этап 1: заносим цену уровня Downtown/Premium. Этап 2 (опционально): расширить набор атрибутов ценами по салонам и доработать фронт;
- `sku` из прайса (`hh01`, `hc02`…) — участвует в фильтре поиска (`exs`);
- `type` (list) — бейдж (напр. грейд: Top Stylist / Senior Stylist…);
- длительность (мин) — есть в прайсе; шаблон её пока не выводит, но атрибут заложить стоит;
- статус `in_stock` (участвует в фильтре по цене).

> **Статус:** 🟡 в основном сделано: **77 продуктов** заведены (набор `a_sets_tpl_catalog_1_ImportProcessingType.catalog`), у всех есть `title`, `description` (маркетинговые тексты из прайса), `sku` (`hh01`…`np04`), `duration` (мин) и `specialist_grade` (грейд списком — закрывает плановый `type`), статус `in_stock`, привязка к своим подкатегориям. ⚠️ Отличия: `price` — **строковый** атрибут («450 AED»), корневое числовое поле `price` продукта пустое (сортировка/фильтр по цене и `ProductPrice` шаблона могут не работать); полей `sale`, `stickers`, `color` нет.

---

## 4. Спец-предложения (Offers)

4 продукта с набором атрибутов **`service_set`** (именно так их различает `offers-table`/`offers-feed`):

| Название | Категория | Цена / старая | Состав (`services` list) |
|---|---|---|---|
| Divine Hands Ritual | Nails | 250 / 300 | Classic Manicure, Henna Hand Design |
| Silk & Shine (featured) | Hair | 590 / 770 | Women's Haircut, Hair Spa Ritual, Blowout |
| Enchanting Gaze | Face | 420 / 500 | Lash Lift & Tint, Brow Shaping, Brow Tint |
| Sands of Serenity | Body | 700 / 830 | Moroccan Bath, Relax Massage (60 min) |

Атрибуты: `sale` = акционная цена, `offer_type` (list; extended value = акцентный цвет из верстки: `#109AA9`, `#ed21f1`, `#9B4FB2`), `services` — ссылки на услуги-продукты, изображение — баннеры из `assets/Offer/`. Тексты tagline/description и условия (`OFFER_TERMS`) — из `offers.ts`.

> **Статус:** ❌ не сделано: продуктов с набором `service_set` в каталоге **0** (страницы offers шаблона работают на фолбэках). Есть 1 продукт вне каталожного набора (`attributeSetIdentifier: null`) — не оффер.

---

## 5. Блоки (Blocks)

### 5.1 Блоки главной страницы (привязать к странице `home`, порядок = порядок секций)

| identifier | Контент из верстки |
|---|---|
| `home_hero` | слайд героя: `title`, `text`, `bg_image` (из `assets/Offer/banner_main.jpeg` или Hero-слайдов), `button_text` = «DISCOVER MORE», `button_link` → offers. ⚠️ В верстке карусель из 4 слайдов, шаблон рендерит один блок — либо один слайд, либо доработка фронта |
| `home_catalog` | заголовок «SERVICE» (сетка строится из детей `services`) |
| `home_gallery` | заголовок «GALLERY» |
| `home_offers_feed` | заголовок «BEST OFFERS» |
| `home_discounts` | баннер «Get 10% off for booking online» / «Lash Lift Monday — Special Price»: `title`, `description`, `phone` `+971 4 784 0098`, `button_text` = «Book Now», `bg_image` |
| `home_masters` | заголовок «OUR SPECIALISTS» |
| `reviews_carousel` | заголовок «REVIEWS» (сами отзывы пока захардкожены — см. п. 9) |

> **Статус:** 🟡 наполовину: ✅ `home_hero` (slider_block, **3 слайда** с `image_id1`/`image_id2` — в верстке 4), ✅ `home_catalog`, ✅ `home_gallery` (common_block; собственных атрибутов-заголовков нет), ✅ `home_offers_feed` (similar_products_block — существует, но к странице `home` **не привязан**: на home висят только hero/catalog/gallery). ❌ `home_discounts`, `home_masters`, `reviews_carousel` — блоков нет (404).

### 5.2 Служебные блоки

- **`system_content`** — словарь UI-текстов: `site_name` = «Thalia Beauty Studio», `company_name`, `book_text`, `select_master_text`, `opening_time_text`, `follow_us_text` и остальные строки интерфейса (полный список маркеров — в `app/api/utils/dictionaries.ts`).
- **`opening_time`** — список `opening_time`: Monday–Sunday, `10:00–22:00` (в верстке все дни одинаковые).

> **Статус:** ❌ ни `system_content`, ни `opening_time` в админке нет (404) — все UI-тексты и часы работы шаблон берёт из английских фолбэков в коде.

---

## 6. Меню (Menus)

| маркер | Пункты (страницы из п. 2) |
|---|---|
| `main` | Home, Services & Prices, Offers, Gallery, Specialists, Contacts |
| `user_menu` | Book Online, Profile |
| `bottom_web` | home, services, booking, masters, profile (мобильное меню — код сверяет именно эти pageUrl) |
| `services` | колонка футера: категории услуг (дети `services`) |
| `about_us` | колонка футера: Specialists, Prices, Reviews |

> **Статус:** 🟡 ✅ `main` — 6 пунктов ровно по плану (home, services, offers, gallery, masters, contacts); ✅ `services` — 4 главные категории (hair, face, body, nails — соответствует двухуровневой структуре); ✅ `about_us` — masters, services, reviews. 🟡 `user_menu` — только profile (без Book Online). ❌ `bottom_web` — меню нет (мобильное нижнее меню шаблона останется пустым).

---

## 7. Мастера (Admins)

32 специалиста заводятся как **пользователи-админы OneEntry** (не страницы!). Код берёт всех админов с заполненным `master_name` (`getAdminsInfo`).

Для каждого мастера заполнить:

- `master_name` — имя (Sofia Marchetti, Noah Jhonson, …);
- `master_image` — портрет из `Beauty content/Specialist/`;
- `master_rating` — рейтинг (4–5 из верстки);
- `master_expirience` — опыт («12 years»);
- `master_short_description` — роль (Top Stylist / Color Specialist / Makeup Artist / Nail Specialist / Master Therapist);
- `master_description` — bio из `MastersPage.tsx` DETAILS (дипломы, награды);
- `services` — list со ссылками на страницы-категории услуг (п. 2.2), по специализации мастера;
- `master_salon` — list со ссылками на страницы салонов;
- `master_schedule` — интервальный атрибут: рабочие дни + тайм-слоты 09:00–20:00 (в верстке слоты `TIMES`/`BUSY_TIMES` захардкожены — здесь становятся реальным расписанием);
- `master_portfolio` — list ссылок на страницы-фото галереи с работами этого мастера.

Приоритет: сначала 6 мастеров с главной (Sofia Marchetti, Noah Jhonson, Samir Haddad, Camille Dubois, Bianca Schneider, Adriana Iliescu), затем остальные 26.

> **Статус:** ❌ не сделано: админов в проекте 2, ни у одного не заполнен `master_name` (все `master_*`-атрибуты пустые) — страницы specialists/booking шаблона работают на демо-ростере.

---

## 8. Формы, авторизация, заказы

1. **Форма `reg`** — единая для регистрации/входа/профиля. Поля: `email_reg`, `password_reg` (type=password), `phone_reg`, `email_notification_reg`; флаги isLogin/isSignUp на полях. Auth-провайдеры: **email** (используется при signUp) и **phone** (таб входа). ⚠️ В верстке авторизация телефон-центричная (OTP) — минимум включить оба провайдера.
2. **Форма `contact_us`** — поля из верстки: Your name (text), Phone (text), E-mail (text), Message (textarea) + `spam` (reCAPTCHA, ключ в `settings.captchaKey`) + `button`.
3. **Форма `order`** с полями: `master` (list), `order_salon` (entity), `interval` (timeInterval).
4. **Хранилище заказов** с маркером **`orders`**; статусы: `upcoming`, `completed`, `canceled` (identifiers — точно такие, их сверяет `ProfileHistory`).
5. **Платёжные аккаунты**: `cash` (обязателен — редирект в профиль) и Stripe (опционально).

> **Статус:** 🟡 формы `reg`, `contact_us`, `order` — созданы, но **все без полей** (`attributes = {}`); auth-провайдеров нет вообще (`[]` — регистрация/вход работать не будут); ✅ платёжные аккаунты `cash` и `stripe` заведены оба. Хранилище `orders` app-токеном не проверяется (401 Unauthorized) — судя по пустой форме `order`, бронирование не настроено.

---

## 9. Отзывы — требует решения

В шаблоне отзывы захардкожены (`components/data.js`), а в верстке — полноценный раздел: 17 отзывов с автором, мастером, рейтингом, датой, фильтрами по салону/категории/мастеру + модалка «Leave a review».

Варианты:

- **A (минимум)**: оставить как есть, перенести 3–5 текстов отзывов в `data.js` фронта — без работы в админке;
- **B (рекомендуется)**: завести в админке структуру «отзыв» (страницы-дети `reviews` или отдельный каталог) с атрибутами `author`, `master_id`, `rating`, `date`, `text` и доработать фронт (`reviews-carousel` + новая страница Reviews).

> **Статус:** 🟡 сделан первый шаг к варианту B: страница `reviews` (id 38) создана и добавлена в меню `about_us`, но детей-отзывов у неё нет, блока `reviews_carousel` тоже нет.

---

## 10. Порядок работ (чеклист)

- [x] **Этап 1 — фундамент** 🟡: локаль `en_US` ✅; наборы атрибутов — только продуктовый (и другой, чем в плане) ❌; медиа — только hero-баннеры 🟡.
- [x] **Этап 2 — структура** 🟡: системные страницы ✅ (кроме `payment_success`/`payment_canceled`); категории услуг ✅ (двухуровнево: 4 категории + 15 подкатегорий, без hero-атрибутов); салоны ❌ (1 «Beauty One» без атрибутов вместо 3); меню ✅ (кроме `bottom_web`, `user_menu` без Book Online).
- [x] **Этап 3 — каталог** 🟡: 77 услуг-продуктов ✅ (sku/duration/грейд, но `price` строкой и без `sale`); офферы `service_set` ❌ (0 шт.).
- [ ] **Этап 4 — мастера** ❌: админов 2, ни одного с `master_name`.
- [ ] **Этап 5 — галерея** ❌: у `gallery` нет детей.
- [ ] **Этап 6 — блоки** 🟡: `home_hero` (3 слайда) / `home_catalog` / `home_gallery` ✅; `home_offers_feed` есть, но не привязан к home; `home_discounts`, `home_masters`, `reviews_carousel`, `system_content`, `opening_time` ❌.
- [ ] **Этап 7 — формы и заказы** 🟡: формы `reg`/`contact_us`/`order` созданы, но без полей ❌; auth-провайдеров нет ❌; оплата `cash`+`stripe` ✅; storage `orders` не проверен (401).
- [ ] **Этап 8 — проверка**: не проводилась (блокируется этапами 4 и 7).

---

## 11. Открытые вопросы / несоответствия верстки и шаблона

1. **Цены по салонам и тарифам** (premium/mid/budget × 3 салона) — шаблон поддерживает одну цену + `sale`. Этап 1: цена Downtown/Premium; расширение — отдельной задачей.
2. **Hero-карусель** (4 слайда в верстке) vs один блок `home_hero` — нужен либо один слайд, либо доработка фронта под несколько блоков.
3. **Отзывы** — см. п. 9.
4. **Тарифный переключатель Hair (Top/Senior/Stylist)** на странице цен — на фронте шаблона отсутствует; в админке можно отразить грейд бейджем `type`.
5. **Домен e-mail**: в верстке `@beautystudio.com` при бренде «Thalia» — уточнить перед заведением контактов.
6. **Промо «First Visit 15%» / «10% off online»** — в шаблоне только контентный блок `home_discounts`, логика скидки на фронте не реализована.
7. **Соцсети** (Instagram/Facebook/Twitter) — в верстке ссылки-заглушки; реальные URL завести в `system_content`.
