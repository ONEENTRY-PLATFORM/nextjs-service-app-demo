# MISMATCH-LOG — аудит на соответствие MCP `oneentry`

Реестр несоответствий кода правилам (`get-rule`) и рецептам (`get-skill`) OneEntry SDK.
Аудит 2026-07-14, адверсариальная верификация 2026-07-15 (246/246 находок проверено скептиком).
Область: `app/`, `components/`, корневые конфиги. Исключено: `static-html/`, `.claude/`, `node_modules/`, `.next/`.

**Статус (2026-07-18): все серьёзные находки закрыты.** Осталось — только INFO/минорные нитпики без рантайм-эффекта, осознанные отклонения и непокрытые аудитом области. Развёрнутые адверсариальные проверки, сводная таблица и история промежуточных чисток убраны как отработавшие — полная версия в git-истории.

> Закрыто в сессии 2026-07-18: `rule:forms`, `skill:create-auth`, `skill:create-cart-manager`, `skill:create-checkout`, `skill:create-product-list` (правки), `rule:jsdoc` (JSDoc + стиль в CLAUDE.md), `rule:performance-rtk`/`rule:performance-streaming` (задокументированы). Ранее (2.x): галерея из CMS, UTC-интервал брони, `Promise.all` в layout/home/profile, флаги полей форм, каст createOrder, `<img>`→next/image в баннере/галерее и др.

Метки: ✅ открыто (info/minor, эффекта нет) · 🟡 суть верна, детали уточнены · 🔧 осознанное отклонение (оставлено, задокументировано) · ⛔ опровергнуто (правка неверна/вредна) · 🟨 отклонено по замеру (цена > выгоды).

## 1. Открытые нитпики (INFO / minor, без видимого эффекта)

**Все ✅/🟡 из этого раздела закрыты 2026-07-19** (см. пометки ниже). Осталось только два 🔧/info «следить при обновлении SDK».

- ✔ `app/api/server/users/logOutUser.ts` (wrappers-contract) — *закрыто 2026-07-19:* в JSDoc явно зафиксирован контракт «NEVER THROWS, деградирует в finally, try/catch не нужен»; продублировано в CLAUDE.md (исключения из конверта). Код не менялся, try/catch у потребителей оставлен как безвредная защита.
- ✔ `app/api/api/api.ts` (env-config) — *закрыто 2026-07-19:* добавлен fail-fast `throw` при пустых `NEXT_PUBLIC_ONEENTRY_URL/TOKEN` до `defineOneEntry`.
- ✔ `app/store/providers/AuthContext.tsx` (tokens / auth-provider) — *закрыто 2026-07-19 (документированием, не удалением):* `syncTokens` НЕ убран — он нужен против гонки 401-on-first-request; `localStorage.setItem('refresh-token')` оставлен как явная страховка поверх `saveFunction`. Перекрытие помечено комментарием в `login()`. Осознанное отклонение (в фрагильной auth-подсистеме правку-удаление не делаем).
- ✔ `app/api/api/RTKApi.ts` (wrappers) — *закрыто 2026-07-19:* удалены мёртвые guard'ы `return { error: null }` в `getProductById`/`getPageById` (все вызовы уже гейтят falsy-id через `{ skip: !id }`); error-ветка теперь только для настоящих `IError`. Помечено в JSDoc `getPageById`.
- ✔ `app/api/server/users/updateUserState.ts` (wrappers-contract) — *закрыто 2026-07-19:* оставлено как задокументированное исключение (`boolean` для мутаций `user.state`); зафиксировано в CLAUDE.md.
- ✔ `app/api/server/pages/getPageByUrl.ts` (wrappers-contract) — *закрыто 2026-07-19:* формулировка контракта в CLAUDE.md уточнена до `{ isError, error?, <доменный-payload>?, [total] }` (payload под доменным ключом `page`/`block`/…); код не менялся.
- ✔ `app/types/global.d.ts` (typescript) — *закрыто 2026-07-19:* неиспользуемый тип `LocalizeInfo` удалён (с согласия пользователя).
- ✔ `app/types/env.d.ts` (env-config) — *закрыто 2026-07-19:* мёртвый файл с ambient `'@env'` (имена v1) удалён (`git rm`).
- ✔ `app/profile/page.tsx` (revalidation) — *закрыто 2026-07-19:* клиент-центричность приватного `/profile` зафиксирована в CLAUDE.md (серверный гейт требует cookie-сессии, которой нет — токены в `localStorage`). Серверной утечки нет.
- ✔ `components/layout/portfolio-grid/index.tsx` + `master-single/components/MasterDescription.tsx` (attribute-values) — *закрыто 2026-07-19:* доступ к `attributeValues` защищён `|| {}` (в portfolio-grid введена `masterAttrs`, переиспользована для caption'а лайтбокса).
- 🔧/info `app/api/api/api.ts:58` (typescript) — `hasActiveSession` читает `AuthProvider.state` через `as unknown as` (публичного геттера в SDK нет). Задокументировано; *следить* при обновлении SDK за появлением `isAuth`/`getAccessToken`.
- 🔧/info `components/layout/home/home-hero/index.tsx:41` (typescript) — каст `slide.attributeValues` (API слайдов отдаёт сырые значения без обёртки `{value}` — расхождение SDK-типа и поведения). Задокументировано; *перепроверять* форму ответа `getSlides` при обновлении `oneentry`.

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

## 4. Непокрытые аудитом области (гипотезы охвата — проверять отдельно)

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
11. **Сверка код↔живая CMS** — `PaymentSuccess`/`PaymentCanceled` роутятся через `app/[handle]`, но страниц `payment_success`/`payment_canceled` в CMS нет → пост-оплатный редирект Stripe уйдёт в `notFound()`; `opening_time` 404; `reviews_carousel` пуст. Ловится только скриптами `.claude/temp/audit-content-plan.mjs`.
12. **Сетевая устойчивость** обёрток — таймауты, ретраи, `AbortSignal`, поведение при недоступности `beauty.oneentry.cloud`.
13. **Права NEXT_PUBLIC-токена** — `NEXT_PUBLIC_ONEENTRY_TOKEN` в клиентском бандле; какие операции (заказы/пользователи/формы) он разрешает произвольному посетителю — не аудировано.
14. **Мутабельный синглтон SDK на сервере** — `app/api/api/api.ts` держит module-level `apiInstance`, `reDefine()`/`clearSession()` его подменяют → риск протечки сессии между параллельными серверными запросами.
15. **Наполняющий контур admin API** — `.claude/temp/masters-common.mjs` + `fill-*.mjs` (Playwright-логин, `OE_ADMIN_LOGIN/PASSWORD`, перезапись `listTitles`) — часть интеграции, вне правил/скиллов.

*Прочее (закрыто):* события CMS заведены и проверены живым прогоном (`reset_password`/`otp` — маркеры отличаются от дефолтов правила `auth-provider`, приведены в `components/forms/authEventMarkers.ts`). `Events.getAllEvents()` = 401 по токену проекта — маркеры пробником не проверить (список — через admin API `.claude/temp/list-events.mjs`).
