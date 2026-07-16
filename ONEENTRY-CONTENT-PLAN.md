# План наполнения админки OneEntry контентом из верстки `static-html`

> **Источник контента:** верстка салона красоты «Thalia» (Dubai) в [static-html/](static-html/) — React-экспорт из Figma, запущен на <http://localhost:5173/>.
> **Потребитель контента:** Next.js-шаблон в корне проекта (`app/`, `components/`), который уже читает конкретные маркеры из OneEntry.
> Все маркеры ниже взяты из кода шаблона — их нужно воспроизводить в админке.

**🔎 Аудит по реальному API — 2026-07-09, переаудит 2026-07-12** (скрипты `.claude/temp/audit-content-plan.mjs`, `audit-content-plan2.mjs`).
Обозначения: ✅ выполнено · 🟡 частично / сделано иначе · ❌ не сделано. Пометки «**Статус:**» добавлены в каждую секцию.

> **Дельта 2026-07-13:** ✅ **страница `/gallery` переключена на CMS** — новый `app/gallery/getCmsGalleryItems.ts` читает дерево `gallery` (4 категории → 32 фото-страницы → `gallery_photos` + `master_id`); локальный скан `getLocalGalleryItems` теперь только фолбэк. Проверено: `/gallery` отдаёт 100% фото из `beauty.oneentry.cloud` (Hair 100 / Nails 40), вкладка Specialist фильтрует, роль выводится из категории. ⚠️ **Модель CMS-галереи огрублена**: тег только на уровне главной категории + мастер, **нет** под-категории/названия услуги/салона на фото → под-фильтр по услугам (Coloring/Styling…) на CMS-данных неактивен (ряд под-категорий скрывается; выводится из реально присутствующих фото в `gallery-page/index.tsx`). Роль на фронте деривится из главной категории (`SUB_TO_MAIN` дополнен self-ключами главных категорий).
>
> **Инвентаризация моков (перепроверено инспекцией 2026-07-13, скрипты `inspect-gallery.mjs`/`inspect-reviews.mjs`/`inspect-salons.mjs`/`inspect-contacts.mjs`):**
>
> - ✅ **из CMS:** галерея, каталог (~77 услуг + офферы), мастера (32 админа), адрес/телефон салонов (заполнены у всех трёх).
> - ❌ **всё ещё мок:** отзывы главной + `/reviews` (в CMS `reviews` стр. и блок `reviews_carousel` **пустые, без атрибутов/детей/слайдов** — фронт на `components/data.js` `reviewsData` и `components/layout/reviews-page/data.ts`); карточки контактов + часы работы (`contactInfoData`/`openingHoursData` в `data.js` — структурных контактов/часов в CMS нет, блок `opening_time` отсутствует); описания салонов About/highlights/цвет (`components/layout/salon-page/salonContent.ts`); соцсети/копирайт/промо-тексты/условия и баннеры офферов/фото «любой мастер»/сетка времени букинга.
>
>
> **Дельта 2026-07-12:** ✅ **32 мастера залиты** скриптами `.claude/temp/fill-masters*.mjs` (не удалять); ✅ **галерея наполнена** (`fill-gallery.mjs`): 32 страницы-фото + 228 фото + `master_portfolio` у 32 мастеров; ✅ офферы `offer` — 4 шт.; ✅ блоки `home_discounts`/`home_masters`/`reviews_carousel` созданы и привязаны к `home` (hero → 4 слайда, offers_feed привязан); ✅ auth-провайдеры `google`+`email` включены; ✅ токен-кап снят (публичный API отдаёт все 32 мастера); каталог расширен (~196 продуктов). ✅ фронт мастеров/галереи починен (профиль `/masters/{id}`, портфолио, фильтр категорий). Открытые хвосты: формы без полей; `opening_time` нет (`system_content` — заполнен, см. 5.2); hero страниц услуг; reviews; тексты/фото салонов.

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
2. **Медиабиблиотека**: исходники лежат в **`public/images/`** (рабочие копии, не в `static-html/`). Структура нормализована — что откуда брать при наполнении см. **п. 12 «Медиа-карта»**. Корневая раскладка `public/images/Beauty content/`:
   - `Specialist/<Salon>/<Имя>.jpeg` — 32 портрета мастеров (→ `master_image`);
   - `Gallery/<Salon>/<Имя>_<дисциплины>/<Услуга>.jpeg` — 228 работ; **имя папки кодирует мастера + салон + дисциплины** (`hair`, `face`, `body`, `nails`, `face-makeup`, `face-body-henna`, `face-body`), эти связи переносим в атрибуты галереи/портфолио;
   - `Contacts/<Salon>/<Salon>_01..07.jpeg` — интерьеры салона + `<Salon>_group.jpg` — командное фото;
   - баннеры офферов/героя — в `public/images/Offer/banner_*.jpeg`; фоны категорий услуг — в `public/images/baners/*.png`; логотип `thalia_logo.svg` в `public/icons/`.
3. **Наборы атрибутов** (attribute sets) — создать до контента:

   | Маркер сета | attribute_marker | Тип | Примечание |
   | --- | --- | --- | --- |
   | `page_simple` | `page_tag` | string | заголовок hero категории |
   | `page_simple` | `page_title` | string | заголовок hero категории |
   | `page_simple` | `page_hero_bg` | image | фон hero |
   | `page_simple` | `page_hero_description` | text | маркетинговое описание |

   | `salon` | `salon_address` | string | Адрес салона |
   | `salon` | `salon_phone` | string | Телефон салона |
   | `salon` | `salon_time` | timeIntgerval | Режим работы салона |

   | `gallery` | `gallery_cat_thumb` | groupOfImages | превью категории (только для страниц-категорий) |
   | `gallery` | `gallery_category` | **entity** | связь на страницу-категорию услуг (п. 2.2); код читает `value[0].value.id` |
   | `gallery_photo` | `gallery_photos` | groupOfImages | сами фото (только для страниц-фото) |
   | `gallery_photo` | `master_id` | list | мастер-админ, автор работы; опция: `title`=имя, `value`=числовой id админа |

   | `service` | `sku` | string | `hh01`, `hc02`… — участвует в поиске |
   | `service` | `price` | number | базовая цена |
   | `service` | `sale` | number | цена распродажи |
   | `service` | `specialist_grade` | list | бейдж-грейд (Top Stylist…) |
   | `service` | `description` | text | описание |

   | `offer` | `offer_type` | list | extended value = акцентный цвет |
   | `offer` | `offer_price` | number | базовая цена |
   | `offer` | `offer_sale` | number | цена распродажи |
   | `offer` | `offer_services` | list | состав оффера (ссылки на услуги) |

   | `master` | `master_name` | string | признак «это мастер» для кода |
   | `master` | `master_image` | image | портрет |
   | `master` | `master_rating` | real | 4–5 (дробный; код `Number(value)`) |
   | `master` | `master_expirience` | string | ⚠️ опечатка намеренная — так в коде |
   | `master` | `master_short_description` | string | роль (Top Stylist / Makeup Artist…) |
   | `master` | `master_description` | text | bio из `MastersPage.tsx` DETAILS |
   | `master` | `master_services` | **entity** | связь на страницы-категории услуг и/или продукты-услуги (код читает `.id`/`.title`, НЕ `list`) |
   | `master` | `master_salon` | **entity** | связь на страницы салонов (код читает `.id`) |
   | `master` | `master_schedule` | timeInterval | рабочие дни + тайм-слоты |
   | `master` | `master_portfolio` | **entity** | связь на страницы-фото галереи с работами |

   Сеты по сущностям:
   `page_simple` — страницы-категории услуг (п. 2.2),
   `salon` — страницы салонов (п. 2.3),
   `gallery` — галерея,
   `service` — услуги-продукты (п. 3),
   `offer` — офферы (п. 4),
   `master` — мастера-админы.

   Маркеры **`service_set`** и **`service_product`** зашиты в код шаблона (`attributeSetIdentifier === 'service_set'` отличает оффер от услуги в offers/booking, `=== 'service_product'` фильтрует услуги в поиске) — воспроизводить точно. Маркеры со звёздочкой (\*) в коде не проверяются — предложены планом, при заведении можно переименовать.

> **Статус (2, обновл. 2026-07-12):** 🟡 медиа — исходники в `public/images/` **структурированы 2026-07-10**; карта соответствий — п. 12. В OneEntry загружены: hero-баннеры (слайды `home_hero`), **все 32 портрета мастеров** (`master_image`, скриптом), баннеры офферов. ❌ работы галереи (`gallery_photos`) и фото салонов в CMS пока не залиты.
> **Статус (3, обновл. 2026-07-12):** ✅ наборы атрибутов заведены: `salon`, `gallery`/`gallery_category`, `offer`, `master` (10 атрибутов), продуктовые `catalog`/`service`. ❌ остаётся набор hero-страниц услуг `service_hero_*` / `page_simple` (у детей `services` `attributeValues` пустые).

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

> **Статус:** 🟡 страницы `home`, `services`, `offers`, `masters`, `gallery`, `contacts`, `booking`, `profile`, `404` — ✅ созданы, заголовки совпадают с планом; сверх плана есть `salons` (id 10) и `reviews` (id 38). ✅ `payment_success` (id 120) и `payment_canceled` (id 121) созданы (2026-07-12). ⚠️ у всех страниц `attributeValues` пустые — hero-тексты/`error_description` не заведены (шаблон живёт на фолбэках; платёжные страницы читают только `localizeInfos.title`).

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

Списки `products`/`services` (какие услуги доступны в салоне — из матрицы цен `priceList.ts`: например, Balayage недоступен в JBR), фото салона из `Beauty content/Contacts/`. Тексты about/tagline/highlights — из `SALON_DETAILS` в `ContactsPage.tsx`. **Форматированный телефон в CMS не хранится** — `salon_phone_formatted` убран, фронт форматирует `salon_phone` через `formatUaePhone` (`components/utils.ts`).

> **Статус (обновл. 2026-07-14):** ✅ страницы и контакты готовы: 3 ребёнка `downtown`/`marina`/`jbr` (набор `salon`), `salon_address` и `salon_phone` заполнены и отдаются API у всех трёх (`downtown` +97147012200, `marina` +97147023300, `jbr` +97147034400 — перепроверено `inspect-salons.mjs`; баг распространения значений на стороне OneEntry устранён). `salon_time` (timeInterval) заведён, кодом пока не читается (пригодится для §11.8). Форматтер `formatUaePhone` проверен на contacts. Списки `products`/`services`, фото и тексты салонов — отдельной задачей (код их пока не читает).

---

## 3. Каталог услуг (Products)

**Продукт = услуга.** Завести ~77 продуктов из `priceList.ts`, каждый привязать к своей странице-категории (п. 2.2).

Поля продукта:

- название, описание (маркетинговое из `priceList.ts`);
- `price` — базовая цена. ⚠️ **Решение по ценам**: в верстке цена = f(салон × тариф premium/mid/budget), у шаблона — одно поле `price` (+`sale`). Этап 1: заносим цену уровня Downtown/Premium. Этап 2 (опционально): расширить набор атрибутов ценами по салонам и доработать фронт;
- `sku` из прайса (`hh01`, `hc02`…) — участвует в фильтре поиска (`exs`);
- `specialist_grade` (list) — бейдж-грейд (напр. Top Stylist / Senior Stylist…);
- длительность (мин) — есть в прайсе; шаблон её пока не выводит, но атрибут заложить стоит;
- статус `in_stock` (участвует в фильтре по цене).

> **Статус:** 🟡 в основном сделано: **77 продуктов** заведены (набор `a_sets_tpl_catalog_1_ImportProcessingType.catalog`), у всех есть `title`, `description` (маркетинговые тексты из прайса), `sku` (`hh01`…`np04`), `duration` (мин) и `specialist_grade` (грейд списком — плановый бейдж-грейд, читает `ProductBadge`), статус `in_stock`, привязка к своим подкатегориям. ⚠️ Отличия: поля `sale` нет.
>
> **Обновлено 2026-07-17:** атрибут **`currency` заполнен значением `AED` у всех 81 продукта** (77 услуг + 4 оффера) — до этого он был пуст, из-за чего заказ не мог нести валюту. Заливка: `.claude/temp/fill-product-currency.mjs` (идемпотентна, `DRY_RUN=1`). Внутренний id поля **не хардкодится** — ищется по флагу `isCurrency` в схеме набора: у услуг это `string_id8`, а у офферов `string_id10`, так что фиксированный id записал бы четыре оффера в чужое поле. Фронт протянул валюту в заказ: `catalog-data` → `ServiceItem.currency` → `BookingService.currency` → поле `currency` формы `order`.

---

## 4. Спец-предложения (Offers)

4 продукта с набором атрибутов **`offer`** (именно так их различает `offers-table`/`offers-feed`):

| Название | Категория | Цена / старая | Состав (`services` list) |
|---|---|---|---|
| Divine Hands Ritual | Nails | 250 / 300 | Classic Manicure, Henna Hand Design |
| Silk & Shine (featured) | Hair | 590 / 770 | Women's Haircut, Hair Spa Ritual, Blowout |
| Enchanting Gaze | Face | 420 / 500 | Lash Lift & Tint, Brow Shaping, Brow Tint |
| Sands of Serenity | Body | 700 / 830 | Moroccan Bath, Relax Massage (60 min) |

Атрибуты:
`offer_sale` = акционная цена,
`offer_price` = старая цена,
`offer_type` (list; extended value = акцентный цвет из верстки: `#109AA9`, `#ed21f1`, `#9B4FB2`),
`offer_title` = заголовок,
`offer_description` = описание,
`offer_time` = время оказания услуг,
`offer_services` — ссылки на услуги-продукты,
изображение — баннеры из `assets/Offer/`.
Тексты tagline/description и условия (`OFFER_TERMS`) — из `offers.ts`.

> **Статус (2026-07-12):** 🟡 заведены **4 продукта с набором `offer`** (310–313), заполнены `offer_sale`, `offer_price`, `offer_type`, `offer_sku` и **`offer_services` — состав по плану §4** (по-офферно, скрипт `.claude/temp/fill-offers-services.mjs`; правится `PUT /api/admin/products/{id}`, поле `entity_id4`). Список опций пикера `offer_services` расширен до **всех 77 услуг** (`fill-offer-picker.mjs` пересобирает `schema.attribute4.listTitles` набора 13; бэкап оригинала в `.claude/temp/`). ✅ **Проверено 2026-07-12:** код различает оффер по `attributeSetIdentifier === 'offer'` во ВСЕХ местах (`app/services/catalog-data.ts`, `app/offers/page.tsx`, `offers-table`, `offers-feed`, `products-table` — 5 сайтов); `'service_set'` в коде нет нигде (grep = 0). Фактический набор CMS = `offer` → совпадает, офферы рендерятся. Устаревшая пометка про `service_set` (унаследована от старого маркера) снята.

---

## 5. Блоки (Blocks)

### 5.1 Блоки главной страницы (привязать к странице `home`, порядок = порядок секций)

| identifier | Контент из верстки |
|---|---|
| `home_hero` | слайдер героя. ✅ **Проверено 2026-07-12:** фронт рендерит **все слайды блока каруселью** (стрелки/точки/автопрокрутка, интервал из `time`/`timeInterval`) через `getBlockSlides` — сейчас **4 слайда**. Слайд: `image_id1` (десктоп), `image_id2` (мобайл), `string_id3` (title), `string_id4` (text), `string_id5` (sale-бейдж), `string_id6/7` (текст/ссылка кнопки, фолбэк «Discover More» → `/offers`). Текст-оверлей (sale/title/text) **отображается** поверх слайда слева. ⚠️ баннеры должны быть **без впечённого текста** — иначе он задублируется с оверлеем (у дизайна `static-html` текст «впечён» в картинки; для CMS-слайдов нужны чистые изображения) |
| `home_catalog` | заголовок «SERVICE» (сетка строится из детей `services`) |
| `home_gallery` | заголовок «GALLERY» |
| `home_offers_feed` | заголовок «BEST OFFERS» |
| `home_discounts` | баннер «Get 10% off for booking online» / «Lash Lift Monday — Special Price»: `title` (string), `description` (string), `phone` (string) `+971 4 784 0098`, `button_text` (string) = «Book Now», `bg_image` (image, десктоп), `bg_image_mobile` (image, мобильный портретный кроп — добавлен 2026-07-15 по аналогии с `image_id1`/`image_id2` слайдов hero). ⚠️ баннеры — **чистые фото без впечённого текста**, текст рисуется CMS-оверлеем. **Атрибутов у блока пока нет → фронт секцию не рендерит** (картинки строго из CMS, локальных фолбэков нет) |
| `home_masters` | заголовок «OUR SPECIALISTS» |
| `reviews_carousel` | заголовок «REVIEWS» (сами отзывы пока захардкожены — см. п. 9) |

> **Статус (2026-07-12):** ✅ почти всё: `home_hero` (slider_block, **4 слайда** с `image_id1`/`image_id2`), `home_catalog`, `home_gallery`, `home_offers_feed` (similar_products_block — теперь **привязан к home**), `home_discounts`, `home_masters`, `reviews_carousel` — все созданы и **привязаны к `home`** (7 блоков в порядке секций). ⚠️ у `common_block`-блоков собственных атрибутов-заголовков нет (заголовки на фолбэках кода).
>
> **Обновление (2026-07-15):** 🟡 `home_discounts` — блок есть, но `attributeValues` **пуст**. Фронт (`components/layout/home/home-cta-banner/`) переписан на CMS: картинки берутся только из `bg_image`/`bg_image_mobile`, тексты — из `title`/`description`/`phone`/`button_text`, пустые поля не рендерятся, без картинки секция скрыта. Прежние локальные баннеры `public/images/baners/Off_10.png`/`Off_10_mobile.png` удалены в коммите 0.1.31 (замена без впечённого текста — `lash-lift.png`/`Mobile/lash-lift-m.png`), из-за чего секция давала 2×404 — **исправлено**. Осталось: завести набор атрибутов и залить значения (шаг ниже).

#### Тексты слайдов hero (впечены в баннеры `static-html`, снято с картинок 2026-07-13)

Фронт рисует эти тексты CMS-оверлеем поверх слайда (маркеры `string_id5`=sale, `string_id3`=title, `string_id4`=text). Соответственно **баннеры в CMS должны быть без впечённого текста** (чистые фото), а текст заполняется атрибутами слайда:

| # | баннер (`static-html/src/assets/`) | `string_id5` (sale) | `string_id3` (title) | `string_id4` (text) |
|---|---|---|---|---|
| 1 | `Hair.png` | -15 % | Silk & Shine | Haircut + Hair Spa Ritual + Blowout |
| 2 | `Hand.png` | -15 % | Divine Hands Ritual | Classic Manicure + Henna Hand Design |
| 3 | `Lash&Brow.png` | -15 % | Enchanting Gaze | Lash Lift & Tint + Brow Shaping + Brow Tint |
| 4 | `Massage.png` | -15 % | Sands of Serenity | Moroccan Bath + Relax Massage |

> Все `string_id5/3/4` — тип **string**. Кнопка: `string_id6` (text, фолбэк «Discover More») / `string_id7` (link, фолбэк `/offers`).

### 5.2 Служебные блоки

- **`system_content`** — словарь UI-текстов: `site_name` = «Thalia Beauty Studio», `company_name`, `book_text`, `select_master_text`, `opening_time_text`, `follow_us_text` и остальные строки интерфейса (полный список маркеров — в `app/api/utils/dictionaries.ts`).
- **`opening_time`** — список `opening_time`: Monday–Sunday, `10:00–22:00` (в верстке все дни одинаковые).

> **Статус (обновл. 2026-07-12):** ✅ **`system_content` заполнен** скриптом `.claude/temp/fill-system-content.mjs` (набор 2 `system_content` → 34 строковых атрибута под все маркеры `dict.<marker>` из кода; блок id=9 `attributeSetId=2`, значения в `attributesSets.en_US.string_id{N}`; проверено публичным SDK — 34/34). ⚠️ публичный API отдавал значения с задержкой ~30 сек (кэш/распространение OneEntry). ❌ `opening_time` ещё нет — часы работы на фолбэке кода.

---

## 6. Меню (Menus)

| маркер | Пункты (страницы из п. 2) |
|---|---|
| `main` | Home, Services & Prices, Offers, Gallery, Specialists, Contacts |
| `user_menu` | Book Online, Profile |
| `bottom_web` | home, services, booking, masters, profile (мобильное меню — код сверяет именно эти pageUrl) |
| `services` | колонка футера: категории услуг (дети `services`) |
| `about_us` | колонка футера: Specialists, Prices, Reviews |

> **Статус (обновл. 2026-07-14):** ✅ `main` — 6 пунктов ровно по плану (home, services, offers, gallery, masters, contacts); ✅ `services` — 4 главные категории (hair, face, body, nails); ✅ `about_us` — masters, services, reviews. ✅ `user_menu` — только profile, и этого достаточно: кнопка Book Online в шапке захардкожена в `NavGroup` (`/booking/` + `book_text` из словаря), пункт меню ей не нужен. ❌ `bottom_web` — меню в админке нет; в дизайне Figma (`static-html/`) нижнего мобильного меню тоже нет — рекомендация: не заводить (смонтированный `BottomMenu` корректно рендерит null), пункт из плана снять после подтверждения пользователем.

---

## 8. Формы, авторизация, заказы

1. **Форма `reg`** — единая для регистрации/входа/профиля. Поля: `email_reg`, `password_reg` (type=password), `phone_reg`, `email_notification_reg`; флаги isLogin/isSignUp на полях. Auth-провайдеры: **email** (используется при signUp) и **phone** (таб входа). ⚠️ В верстке авторизация телефон-центричная (OTP) — минимум включить оба провайдера.
2. **Форма `contact_us`** — поля из верстки: Your name (text), Phone (text), E-mail (text), Message (textarea) + `spam` (reCAPTCHA, ключ в `settings.captchaKey`) + `button`.
3. **Форма `order`** с полями: `master` (list), `salon` (entity), `interval` (timeInterval), `price` (float), `currency` (string).
   > ⚠️ В плане до 2026-07-17 значилось `order_salon` — в админке поле завели как **`salon`**. Код угадывал маркер по этому плану и отправлял `order_salon`, которого в форме нет: салон молча не попадал в заказ. Исправлено в `useBookingSubmit.ts`; маркеры сверены с живой формой (`.claude/temp/inspect-order-form.mjs`).
4. **Хранилище заказов** с маркером **`orders`**; статусы: `upcoming`, `completed`, `canceled` (identifiers — точно такие, их сверяет `ProfileHistory`).
5. **Платёжные аккаунты**: `cash` (обязателен — редирект в профиль) и Stripe (опционально).

> **Статус (обновл. 2026-07-14):** 🟡 ✅ **auth-провайдеры `google` + `email` включены** (active=true). ✅ **форма `reg` полностью заполнена** (6 полей, проверено `inspect-reg-form.mjs` 2026-07-14: `email_reg` — isLogin + isSignUpRequired, required + email-валидатор; `name_reg` — isSignUpRequired; `phone_reg`; `password_reg` — isPassword + isSignUpRequired, required; `repeat_password`; `email_notification_reg` — isNotificationEmail). Фронт `SignUpForm` починен под флаговую маршрутизацию (2026-07-14): пароль определяется по `isPassword` (устаревшая проверка `additionalFields.type` удалена), `repeat_password` не отправляется — только клиентская проверка совпадения. ❌ форма `contact_us` — **без полей** (`attributes = {}`), отложена по решению пользователя (2026-07-14): нужен site key reCAPTCHA для поля `spam`. Мёртвый дубль-компонент `ContactUsForm` + заглушка `FormCaptcha` удалены 2026-07-17; живая форма — `ContactFormCard` на `/contacts`, она деградирует без полей. ✅ платёжные аккаунты `cash` и `stripe` заведены оба.
>
> **Форма `order` — ЗАПОЛНЕНА (сверено 2026-07-17):** 5 полей — `master` (list), `salon` (entity), `interval` (timeInterval), `price` (float), `currency` (string). Фронт приведён к ним: маркер `salon` вместо выдуманного `order_salon`, id страницы салона числом (не строкой), добавлены `price` и `currency`.
>
> **⛔ Оформление заказа НЕ РАБОТАЕТ — два блокера, оба в админке** (диагностировано живым прогоном букинга 2026-07-16, `POST /orders-storage/marker/orders/orders` → 400):
>
> 1. **`400 "there aren't list values for type list"`** — у поля **`master`** (тип `list`) **пустой список значений** (`listTitles: []`), поэтому API отвергает любое значение. Нужно либо заполнить опции списка мастерами, либо сменить тип поля на `entity` (как у `salon`). Требует решения: чем именно идентифицировать мастера — id админа (сейчас код шлёт `adminId`) или именем.
> 2. **`400 "Payment account identifier is wrong or payment accounts are not defined"`** — вылезает следом, когда `master` убран из payload. У аккаунтов `cash` и `stripe` **`isUsed: false`**, и к хранилищу `orders` не привязан ни один (`paymentAccountIdentifiers: []`). Нужно активировать `cash` и привязать его к хранилищу.
>
> Хранилище `orders`: `formIdentifier = null` (поэтому код обязан слать `'order'` литералом — брать из хранилища нельзя, ушёл бы `null`), `paymentAccountIdentifiers = []`. Проверка — `.claude/temp/probe-create-order.mjs`.

---

## 9. Отзывы — требует решения

В шаблоне отзывы захардкожены (`components/data.js`), а в верстке — полноценный раздел: 17 отзывов с автором, мастером, рейтингом, датой, фильтрами по салону/категории/мастеру + модалка «Leave a review».

Варианты:

- **A (минимум)**: оставить как есть, перенести 3–5 текстов отзывов в `data.js` фронта — без работы в админке;
- **B (рекомендуется)**: завести в админке структуру «отзыв» (страницы-дети `reviews` или отдельный каталог) с атрибутами `author`, `master_id`, `rating`, `date`, `text` и доработать фронт (`reviews-carousel` + новая страница Reviews).

> **Статус (обновл. 2026-07-13):** 🟡 сделан первый шаг к варианту B: страница `reviews` (id 38) создана и добавлена в меню `about_us`, блок `reviews_carousel` создан и привязан к `home`. ❌ Но контента нет: у страницы `reviews` **нет детей-отзывов** (`getChildPagesByParentUrl('reviews')` = 0), у блока `reviews_carousel` **нет ни атрибутов, ни слайдов** (проверено `inspect-reviews.mjs`). Поэтому фронт всё ещё полностью на моке: карусель главной — `components/data.js` `reviewsData`, страница `/reviews` — `components/layout/reviews-page/data.ts` (17 отзывов + маппинги мастер→салон/категория). Для реального переноса нужно: (1) завести атрибуты `author`/`master_id`/`rating`/`date`/`text` для отзыва, (2) наполнить детей `reviews`, (3) переключить `ReviewsCarousel` и `reviews-page` на чтение CMS (по образцу `getCmsGalleryItems`).

---

## 10. Порядок работ (чеклист)

- [x] **Этап 1 — фундамент** 🟡:
локаль `en_US` ✅;
наборы атрибутов — только продуктовый (и другой, чем в плане) ❌;
медиа — только hero-баннеры 🟡.

- [x] **Этап 2 — структура** 🟡:
системные страницы ✅ (включая `payment_success`/`payment_canceled`, созданы 2026-07-12);
категории услуг ✅ (двухуровнево: 4 категории + 15 подкатегорий, без hero-атрибутов);
салоны ✅ (адреса и телефоны у всех трёх; форматирование телефона на фронте `formatUaePhone`);
меню ✅ (кроме `bottom_web`, `user_menu` без Book Online).

- [x] **Этап 3 — каталог** 🟡:
услуги-продукты ✅ (sku/duration/грейд, но `price` строкой и без `sale`; по аудиту 2026-07-14 каталог консолидирован: 81 продукт = 77 услуг в наборе `service` (все со sku) + 4 оффера `offer` — прежние ~196 с набором `catalog` удалены/слиты);
офферы `offer` ✅ (4 шт., атрибуты заполнены — сверить маркер набора с кодом, п. 4).

- [x] **Этап 6 — блоки** 🟡:
`home_hero` (4 слайда) / `home_catalog` / `home_gallery` / `home_offers_feed` / `home_discounts` / `home_masters` / `reviews_carousel` — ✅ созданы и привязаны к `home`;
`system_content` ✅ (34 UI-текста, `fill-system-content.mjs`); `opening_time` ❌ — отложен пользователем (2026-07-14; часы на фолбэке кода, контакты на моке `data.js`).

- [ ] **Этап 7 — формы и заказы** 🟡:
форма `reg` заполнена (6 полей, флаги isLogin/isPassword/isNotificationEmail/isSignUpRequired) ✅;
форма `order` — без полей, отложена: источник слотов `interval` зависит от flow (§11.8) ❌;
форма `contact_us` — без полей, отложена (2026-07-14) ❌;
auth-провайдеры `google`+`email` включены ✅;
оплата `cash`+`stripe` ✅;
storage `orders` не проверен (401).

- [x] **Этап 8 — проверка** 🟡 (2026-07-14, Playwright на dev :3700, desktop 1280):
auth-флоу целиком ✅ — регистрация по CMS-форме `reg` через UI (несовпадение паролей блокируется на клиенте) → signUp → автологин → профиль (name/phone из formData; password/repeat_password в formData НЕ попадают) → выход → повторный вход; тестовый юзер `claude.test1@example.com`;
страницы home / services/hair / masters/13 / contacts / gallery / offers / booking / reviews — рендер из CMS, 0 ошибок консоли ✅; телефоны всех салонов форматируются ✅;
❌ не проверено: отправка `contact_us` и создание заказа из бронирования — блокировано отложенными формами (§8).
Замечания: (1) ✅ ИСПРАВЛЕНО 2026-07-14 — шумные 400/401 при logout: `logOutUser` теперь чистит `refresh-token`/`authProviderMarker` и сбрасывает SDK-инстанс (`clearSession`), а `SignOutButton`/`LogoutMenuItem` гасят состояние синхронно через новый `AuthContext.logout()` вместо `authenticate()` (по `rules/tokens.md`: мёртвый токен чистит приложение; перепроверено — консоль чистая за весь цикл вход/выход); (2) ✅ ИСПРАВЛЕНО 2026-07-14 — metadata: `generateMetadata` в `app/layout.tsx` берёт title/og:siteName из `site_name` `system_content` (сейчас «Thalia Beauty Studio», фолбэк захардкожен), туда же — имя Organization в JSON-LD; (3) в профиле поле E-mail пустое (login-credential не хранится в formData — поведение шаблона); (4) hero-слайд 4 — заглушки Sale/Title/Text в CMS.

---

## 11. Открытые вопросы / несоответствия верстки и шаблона

1. **Цены по салонам и тарифам** (premium/mid/budget × 3 салона) — шаблон поддерживает одну цену + `sale`. Этап 1: цена Downtown/Premium; расширение — отдельной задачей.
2. **Hero-карусель** (4 слайда в верстке) vs один блок `home_hero` — нужен либо один слайд, либо доработка фронта под несколько блоков.
3. **Отзывы** — см. п. 9.
4. **Тарифный переключатель Hair (Top/Senior/Stylist)** на странице цен — на фронте шаблона отсутствует; в админке можно отразить грейд бейджем `specialist_grade`.
5. **Домен e-mail**: в верстке `@beautystudio.com` при бренде «Thalia» — уточнить перед заведением контактов.
6. **Промо «First Visit 15%» / «10% off online»** — в шаблоне только контентный блок `home_discounts`, логика скидки на фронте не реализована.
7. **Соцсети** (Instagram/Facebook/Twitter) — в верстке ссылки-заглушки; реальные URL завести в `system_content`.
8. **Поле `interval` формы `order`** — слоты должны зависеть от выбранного flow бронирования: при выборе мастера — из `master_schedule` (timeInterval админа), при выборе «любой специалист»/от салона — из режима работы салона (`salon_time`). В форму значение попадает из атрибутов сущностей на фронте; статичные опции timeInterval в самой форме не подходят. Требуется спроектировать до заведения поля (отложено 2026-07-14).

---

## 12. Медиа-карта наполнения (что откуда брать)

Все исходники — в **`public/images/`**. База для контентных фото — `public/images/Beauty content/` (ниже `BC/`). Структура нормализована 2026-07-10 (см. Статус 2). Соответствие салонов страницам (п. 2.3): `Downtown → downtown`, `Marina → marina`, `JBR → jbr`.

### 12.3 Салоны (п. 2.3)

| Страница | Название | Интерьеры | Командное фото |
| --- | --- | --- | --- |
| `downtown` | Thalia Downtown | `BC/Contacts/Downtown/Downtown_01..07.jpeg` | `BC/Contacts/Downtown/Downtown_group.jpg` |
| `marina` | Thalia Marina | `BC/Contacts/Marina/Marina_01..07.jpeg` | `BC/Contacts/Marina/Marina_group.jpg` |
| `jbr` | Thalia JBR | `BC/Contacts/JBR/JBR_01..07.jpeg` | `BC/Contacts/JBR/JBR_group.jpg` |

Фолбэк «любой специалист» в бронировании — `public/images/Any_specialist/<Salon>_group.jpg`.

### 12.4 Офферы (п. 4) и баннеры

Баннеры офферов — в `public/images/Offer/`:

| Оффер | Категория | Баннер (image) |
| --- | --- | --- |
| Divine Hands Ritual | Nails | `Offer/banner_01.jpeg` |
| Silk & Shine (featured) | Hair | `Offer/banner_main.jpeg` |
| Enchanting Gaze | Face | `Offer/banner_02.jpeg` |
| Sands of Serenity | Body | `Offer/banner_04.jpeg` |

- **Hero главной** (`home_hero`, п. 5.1): баннеры `Offer/banner_main.jpeg` + `Offer/banner_03.jpeg` (сейчас в CMS 3 слайда).
- **Фон hero страниц-категорий** (`service_hero_bg`, п. 2.2): арт-баннеры `public/images/baners/*.png` (`Hair.png`, `Lash&Brow.png`, `Massage.png`, `Hand.png`; мобильные варианты — `baners/Mobile/`).
