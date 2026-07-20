# MISMATCH-LOG — аудит на соответствие MCP `oneentry`

Реестр несоответствий кода правилам (`get-rule`) и рецептам (`get-skill`) OneEntry SDK.
Аудит 2026-07-14, адверсариальная верификация 2026-07-15 (246/246 находок проверено скептиком).
Область: `app/`, `components/`, корневые конфиги. Исключено: `static-html/`, `.claude/`, `node_modules/`, `.next/`.

**Статус (2026-07-18): все серьёзные находки закрыты.** Осталось — только INFO/минорные нитпики без рантайм-эффекта, осознанные отклонения и непокрытые аудитом области. Развёрнутые адверсариальные проверки, сводная таблица и история промежуточных чисток убраны как отработавшие — полная версия в git-истории.

> Закрыто в сессии 2026-07-18: `rule:forms`, `skill:create-auth`, `skill:create-cart-manager`, `skill:create-checkout`, `skill:create-product-list` (правки), `rule:jsdoc` (JSDoc + стиль в CLAUDE.md), `rule:performance-rtk`/`rule:performance-streaming` (задокументированы). Ранее (2.x): галерея из CMS, UTC-интервал брони, `Promise.all` в layout/home/profile, флаги полей форм, каст createOrder, `<img>`→next/image в баннере/галерее и др.

Метки: ✅ открыто (info/minor, эффекта нет) · 🟡 суть верна, детали уточнены · 🔧 осознанное отклонение (оставлено, задокументировано) · ⛔ опровергнуто (правка неверна/вредна) · 🟨 отклонено по замеру (цена > выгоды).

## 2. 🔧 Осознанные отклонения (оставлены, задокументированы)

- `app/reviews/page.tsx` — тело `/reviews` из локального мока (`reviews_carousel` в CMS пуст). Переходное состояние до наполнения CMS.
- `app/contacts/page.tsx` — часть вторичных UI-текстов захардкожена (h1 — из CMS). Переход к `system_content` по мере наполнения.
- `components/shared/*` + лайтбоксы (`Gallery/Salon/Portfolio`) — сырой `<img>` там, где аспект неизвестен (баннер), хост произвольный (`Avatar` vs жёсткий `remotePatterns`) или нужны натуральные размеры (лайтбоксы). Обосновано в коде (2026-07-18).
- `app/store/providers/AuthContext.tsx:233` — `exhaustive-deps` подавлен осознанно (`isAuth` исключён, перепроверка токена только по явному refetch).
- `AuthContext.tsx` (user-state) — локальный `user` вместо чтения из хука: осознанный decoupling от 60с-поллинга `getMe` (иначе ре-рендер всех потребителей каждые 60с). 2026-07-18.
- `app/booking/page.tsx` — без локального `<Suspense>`: страница `force-static` (пререндер), fallback резолвится при прегенерации и до клиента не доходит. 2026-07-18.
- `app/store/reducers/CartSlice.ts` — корзина на Redux + redux-persist (клиентская), а не нативный серверный cart API из рецепта.
- JSDoc-стиль — тип в фигурных скобках у `@param` и `@returns` (отклонение от `jsdoc.md`, зафиксировано в CLAUDE.md 2026-07-18).
- `app/api/api/api.ts` — `LANG_CODE='en_US'`, locale не из params, `langCode` в SDK не передаётся (одноязычный сайт; касается create-page/profile/localization/form/search).
- `app/api/utils/dictionaries.ts` — словарь UI-строк на блоке `system_content` (`getBlockByMarker`) вместо `AttributeSet static_content`, без хелпера `t()`.
- `useBookingSubmit.ts` — оплата `cash` и маркеры заказа захардкожены: в верстке нет шага выбора оплаты (запись на приём, не e-commerce). `stripe` привязан технически — *пересмотреть,* если появится онлайн-оплата как продуктовое решение.

## 3. ⛔ Опровергнуто (правка неверна/вредна) · 🟨 отклонено по замеру

- ⛔ `useBookingSubmit.ts:130` — «`formIdentifier` из `getAllOrdersStorage()`»: у единственного storage он `null` → отправка `null` сломала бы `createOrder`. Хардкод `'order'` (маркеры в `orderMarkers.ts`) — единственный рабочий вариант.
- ⛔ `next.config.ts` — «PPR через `experimental.ppr`»: ключ удалён в next@16.2.10 (`HardDeprecatedConfigError`), правка сломала бы сборку.
- ⛔ `gallery-grid/GalleryGrid.tsx` — «photoswipe тянется в чанки»: модуль не импортируется (мёртвый код), в module graph не входит.
- ⛔ `updateUserState.ts` — «user-authorized обёртки в `app/api/server/`»: правило про способ вызова, не структуру папок; ни `'use server'`, ни `server-only` — требование выполнено.
- 🟨 SDK в клиентском бандле — **562 КБ raw / 121 КБ gzip (28% JS)**, на каждом роуте. Решение пользователя: **не чинить** («150кб фигня»); ленивый SDK превращает синхронный `login()` в fire-and-forget в самой хрупкой подсистеме. Рецепт (вынести `isError` в свой модуль, SDK через `await import()` в 2 путях) — в git-истории.
- 🟨 Картинки карточек мастеров не гейтятся по вьюпорту — закадровые ≈ **52 КБ**. **Не чинить**: 52 КБ шум, `sizes`/`loading="lazy"`/blur уже на месте. *Пересмотреть,* если карточек станет заметно больше.

## 4. Непокрытые аудитом области (гипотезы охвата) — ✅ разобрано 2026-07-19 (статусы в §5)

Разбиение 22 правила + 20 скиллов покрывает «внутренность» интеграции OneEntry, но упускает «обвязку» Next.js вокруг CMS и прод-поверхности:

1. **SEO-роуты** — `app/sitemap.xml/route.ts` и `robots.txt/route.ts` строят базовый URL сайта из `NEXT_PUBLIC_ONEENTRY_URL` (это домен CMS `beauty.oneentry.cloud`, не сайта) → sitemap/robots указывают на чужой домен.
2. **Метаданные из CMS** — `generateMetadata` на 16 страницах, нет `metadataBase` в `app/layout.tsx`; фолбэки, дубль `getPageByUrl`, OG-резолвинг не покрыты.
3. **Границы ошибок** — нет ни одного `error.tsx`/`global-error.tsx` (только `not-found.tsx` и один `gallery/[handle]/loading.tsx`): сбой SDK роняет страницу без границы.
4. **XSS/санитизация** — `dangerouslySetInnerHTML` для CMS-`htmlContent`/JSON-LD в 6 файлах (layout, page, gallery/masters/services `[handle]`, `CategoryTile`) — экранирование не проверяется.
5. **Валидность JSON-LD** structured data из CMS (`layout.tsx:168` + детальные страницы).
6. **Прод-диагностика** — `app/api/test-connection/route.ts` (force-dynamic, SDK по произвольным query) и публичный `app/api-test/*` — доступность/злоупотребление.
7. **`next.config.ts`** — битый rewrite `/fonts/:path*`→`/api/fonts/*` (роут не существует), нет CSP, `staleTimes` (30/180с — свежесть CMS-данных), `remotePatterns`.
8. **Полнота jest-моков** SDK-обёрток и слайсов (только правило `playwright-e2e` про тесты).
9. **Консистентность типов SDK↔CMS** — 205 импортов `oneentry/dist/*` в 127 файлах; фактическая форма ответов (price, attributes формы = массив ИЛИ объект) системно не сверяется.
10. **A11y CMS-контента** — alt у image-атрибутов, aria/клавиатура hero-карусели и модалок, семантика вставляемого `htmlContent` — нет ни в одном измерении.
11. **Сверка код↔живая CMS** — `PaymentSuccess`/`PaymentCanceled` роутятся через `app/[handle]`, но страниц `payment_success`/`payment_canceled` в CMS нет → пост-оплатный редирект Stripe уйдёт в `notFound()`; `reviews_carousel` пуст. Ловится только скриптами `.claude/temp/audit-content-plan.mjs`.
12. **Сетевая устойчивость** обёрток — таймауты, ретраи, `AbortSignal`, поведение при недоступности `beauty.oneentry.cloud`.
13. **Права NEXT_PUBLIC-токена** — `NEXT_PUBLIC_ONEENTRY_TOKEN` в клиентском бандле; какие операции (заказы/пользователи/формы) он разрешает произвольному посетителю — не аудировано.
14. **Мутабельный синглтон SDK на сервере** — `app/api/api/api.ts` держит module-level `apiInstance`, `reDefine()`/`clearSession()` его подменяют → риск протечки сессии между параллельными серверными запросами.
15. **Наполняющий контур admin API** — `.claude/temp/masters-common.mjs` + `fill-*.mjs` (Playwright-логин, `OE_ADMIN_LOGIN/PASSWORD`, перезапись `listTitles`) — часть интеграции, вне правил/скиллов.

## 5. Разбор обвязки Next.js вокруг CMS (сессия 2026-07-19)

Все 15 гипотез §4 разобраны: 9 исправлено кодом, 4 проверены (уже в порядке), 2 — отчёт/инструкция. Проверено: `npm run typecheck` = 0, jest 138/138, Playwright (dialog-слой, hero, метаданные) на dev:3700.

Метки: ✅ исправлено · ☑️ проверено, правки не нужны · 📋 отчёт/инструкция · 🔧 решение пользователя.

1. ☑️ **SEO-роуты** — `sitemap.xml`/`robots.txt` уже строят базу через `getSiteUrl()` (`NEXT_PUBLIC_SITE_URL || NEXT_PUBLIC_VERCEL_URL`, не CMS-хост). Запись §4 устарела.
2. ✅ **metadataBase** — `new URL(siteUrl)` в корневом `generateMetadata` (`app/layout.tsx`); наследуется всеми страницами, относительные OG/canonical резолвятся на домен сайта.
3. ✅ **Границы ошибок** — добавлены `app/error.tsx` (сегмент) и `app/global-error.tsx` (автономный, inline-стили).
4. ✅ **XSS** — сырой CMS-`htmlContent` через `dangerouslySetInnerHTML` **нигде не рендерится** (только stripped `plainContent`). Из 6 usages: 5 = JSON-LD (см. п.5), 1 = статичный локальный SVG (`CategoryTile`, безопасен).
5. ✅ **JSON-LD** — общий `serializeJsonLd()` (экранирует `<`/`>`/`&`) во всех 5 эмиттерах (layout + home + 3×`[handle]`); `</script>`-breakout закрыт (проверено). Починён битый `logo` (`/logo.png`→`/icons/thalia_logo.svg`).
6. ☑️ **Прод-диагностика** — `api/test-connection` и `api-test` уже отдают 404/`notFound()` при `NODE_ENV==='production'`.
7. ✅/🔧 **next.config** — убраны битый rewrite `/fonts/*→/api/fonts/*` и мёртвый header `/fonts` (шрифты через `next/font`). CSP — **решение: пропустить** (HSTS/XFO/nosniff/Referrer/Permissions на месте; nonce-CSP для Next+OAuth — отдельный проект). `staleTimes` и `remotePatterns` (`**.oneentry.cloud/cloud-static/**`) адекватны.
8. 📋 **jest-моки** — нормализаторы квирков (`getFormAttributes`, `flatMenuToNested`, `parseOfferDetail`, `normalizeMenuPages`, `productCurrency`) покрыты хорошо и достоверно; добавлен тест `parseOffer` (был непокрытый близнец). Не покрыты: 18 server-обёрток, ~23 RTK-эндпоинта, 4 хука — envelope/shape-допущения без юнит-сети (крупная отдельная работа).
9. ✅/📋 **Типы SDK↔CMS** — HIGH исправлен: единственный негардированный `.attributeValues` (`portfolio-grid/index.tsx`) → `?.`. ~15 `.value as Array<>`-кастов гардятся в рантайме (`?? []`/`?.[0]`/`Array.isArray`); TS их не проверяет, но деградируют, не падают.
10. ✅/🔧 **A11y** — контейнерные: реальный alt портфолио, клавиатура ячейки галереи, aria-label кнопок салона, hero (`prefers-reduced-motion` + пауза по фокусу + `aria-hidden` неактивных слайдов). Общий dialog-слой `components/shared/useDialogA11y.ts` (`role=dialog`+`aria-modal`, focus-trap, возврат фокуса, scroll-lock, Escape) — подключён к auth-модалке, mobile-menu и 3 лайтбоксам (проверено Playwright).
11. ☑️/📋 **payment_success/canceled** — ПОПРАВКА к §4 п.11: страницы **уже существуют** в CMS (`payment_success` id 120, `payment_canceled` id 121, оба visible; проверено `inspect-payment-pages.mjs` 2026-07-19) → `app/[handle]` их рендерит, `notFound()` НЕ происходит. Посылка «страниц нет» устарела. Реальная (латентная) проблема — Stripe `successUrl`/`cancelUrl` аккаунта = CMS-хост `beauty.oneentry.cloud`; код их в `createSession(id,'session')` не передаёт (берутся из настроек аккаунта) → после онлайн-оплаты возврат на CMS-хост, не на страницы сайта. Чинить в настройках Stripe-аккаунта (админка), когда включат онлайн-оплату (сейчас бронь = cash).
12. ✅ **Сетевая устойчивость** — `withTimeout` (`app/api/utils/withTimeout.ts`, 10с; 20с для `getAdminsInfo`) обёрнут вокруг всех 18 server-обёрток; медленный/полуоткрытый CMS → быстрый фолбэк через существующий try/catch-конверт. Недоступность CMS уже деградировала штатно.
13. ☑️ **Права NEXT_PUBLIC-токена** — публичный delivery-токен (дизайн OneEntry): аноним читает только уже-публичный контент; данные юзера/заказы — user-токен с привязкой к device-fingerprint; спам форм/регистраций — reCAPTCHA Enterprise. Не переповышен.
14. ☑️ **Синглтон SDK** — мутаторы (`reDefine/clearSession/syncTokens`) все `'use client'`; сервер только читает через `getApi()` → протечки сессии между серверными запросами нет. Инвариант задокументирован в `api.ts` (серверная сессия при нужде — per-request инстанс).
15. 📋 **Наполняющий контур admin API** — `.claude/temp/*` (Playwright-логин, `OE_ADMIN_*`, перезапись `listTitles`) документирован в CLAUDE.md + памяти (`admin-api-fill-mechanics`), идемпотентен, `DRY_RUN`-совместим. Вне правил/скиллов сознательно (внутренний REST админки, не публичный SDK) — фиксируется как есть.

## 6. Дизайн-паритет со static-html (аудит и правки 2026-07-20)

Полный дифф-аудит 6 зон (шапка/футер/меню, главная, прайс/офферы, галерея/мастера/портфолио, контакты/салон/бронь, профиль/auth/отзывы) против `static-html/`; все содержательные расхождения либо исправлены, либо зафиксированы ниже как осознанные. Проверено: `npm run typecheck` = 0, ESLint по затронутым файлам чистый, визуально на dev:3700 (1280/390).

**Исправлено под верстку:** мобильная Book Online по центру шапки + `py-3.5` на десктопе (`BookOnlineLink`); гамбургер = lucide `Menu`/`X` 22; мобильное меню = инлайн-панель под шапкой (`MobileNavPanel`, вместо offcanvas-drawer; старые файлы `components/layout/mobile-menu` оставлены на диске неиспользуемыми, `PopupRoot` больше не роутит `MobileMenu`); логотип чёрный h58; иконка профиля MUTED + hover-scale (вместо hover-рамки); убран `hover:text-fuchsia-500` с десктоп-навигации; watermark BEAUTY/STUDIO `font-black`/`font-thin`; hero-кнопка `#292a2c` (токен `charcoal`); плитки GALLERY ведут на `/gallery?category=…` (были на `/services/*`); стиль CTA-кнопки «Book Now» (bg white/22, border-2, font-black); двухтоновые градиенты офферов на главной (общая мапа `offerAccentGradientsData`); отступы секций главной и стрелки/gap отзывов; hover featured-оффера −6px; поиск прайса по названию+подкатегории (вместо описания); `mb-3` у CategoryTabs; звёзды рейтинга = lucide 14px, пустые — полые cyan (`star.tsx`/`star-o.tsx`); кластер рейтинга мастера: счётчик «N Reviews» (мок-датасет отзывов) + «Leave a review» открывает портированную `ReviewModal` (`components/shared/review-modal`, client-only как в верстке); салон-чипы мастера кликабельны (`/salons/{url}`); «Back to Specialist» (ед. число, как в моке); портфолио ≤10 фото, подпись лайтбокса «имя · роль» + кнопка Share; «Check a profile» в галерее ведёт на профиль мастера (`masterId` из `master_id`); sign-up: чекбокс Terms & Privacy (гейтит сабмит), имя+фамилия в 2 колонки, переключатель «Already have an account? Sign In» внизу; отмена записи: лейбл «Cancel booking» + модалки подтверждения/успеха (вместо мгновенной отмены с тостом); «Leave a review» у завершённых визитов; Opening Hours одной строкой (`whitespace-nowrap`).

**Осознанные отклонения от верстки (не чинить):**

- Тарифы Top/Senior Stylist, цены-диапазоны «min–max» и салон-зависимые цены — CMS-модель: одна цена у услуги. Салон-селектор прайса оставлен визуально (как в верстке), на выдачу не влияет.
- `OfferBookingModal` (2-шаговая модалка оффера) — замещена единым визардом `/booking` (корзина + CMS-заказы); тексты визарда свои.
- Бронь: мультивыбор услуг (в верстке одиночный) + следствия в чипе/сводке — нужен для офферов из нескольких услуг.
- Зачёркнутые busy-слоты (`BUSY_TIMES` мока) — слоты идут из реального CMS-расписания мастера, фиктивной занятости нет.
- Промо-блок в сводке брони (скидка «первого визита») — промо-движка в CMS нет; баннер «First Visit 15%» чисто декоративный.
- Auth: вход по email (не телефон с country-picker), OTP-коды вместо «reset link», без тумблера Phone/Email; Google-кнопка + разделитель «or continue with» — добавка шаблона (OAuth включён в CMS), в верстке соц-входа нет.
- Профиль: «Edit/Save» инлайн-редактирование заказа вместо «Reschedule»; группировка визитов `VisitGroups` с крупной карточкой мастера (w-40) вместо строки w-20×h-24; `UserForm` всегда редактируем (нет режима просмотра), загрузки аватара нет (нет бэкенда).
- Заголовки секций унифицированы общим `SectionHeading` (в верстке 2–3 разнокалиберных варианта) — задокументировано в самом компоненте; заголовок «Portfolio» мастера тоже общий.
- CTA-баннер: раскладка оверлея своя (CMS-заголовок поверх чистого арта — задокументировано в `CtaBannerOverlay`), стиль кнопки приведён к моку.
- Лайтбокс портфолио: первая строка подписи = роль (fallback-ветка мока) — per-photo названия услуги в CMS нет.
- `ReviewModal` textarea-плейсхолдер — осмысленный текст вместо lorem-заглушки Figma; сабмит client-only (тост), как в верстке — CMS-хранилище отзывов пусто.
- «Call us» на мобильной карточке салона звонит (`tel:`), а не открывает карту — в верстке это баг макета.
- `cancel_text` в `system_content` может отдавать «Cancel» — фолбэк кода теперь «Cancel booking» (по верстке); при желании поменять значение в админке.
