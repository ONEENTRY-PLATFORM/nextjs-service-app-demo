# MISMATCH-LOG — аудит на соответствие MCP `oneentry`

Реестр несоответствий кода правилам (`get-rule`) и рецептам (`get-skill`) OneEntry SDK, а также оценок на рефакторинг (раздел 5).
Аудит 2026-07-14, адверсариальная верификация 2026-07-15; разбор обвязки Next.js — 2026-07-19; дизайн-паритет — 2026-07-20; e2e-покрытие — 2026-07-21; рефакторинг — 2026-07-22.

**Статус (2026-07-23): все выполненные пункты удалены из файла** (история — в git; аудит на рефакторинг, блоки A–I, выполнен). Ниже остались только осознанные отклонения, опровергнутые/отклонённые правки и незакрытые хвосты.

Метки: 🔧 осознанное отклонение (оставлено, задокументировано) · ⛔ опровергнуто (правка неверна/вредна) · 🟨 отклонено по замеру (цена > выгоды) · 📋 открыто / не автоматизируется.

## 1. 🔧 Осознанные отклонения от правил и скиллов SDK

- `app/reviews/page.tsx` — тело `/reviews` из локального мока (`reviews_carousel` в CMS пуст). Переходное состояние до наполнения CMS.
- `app/contacts/page.tsx` — часть вторичных UI-текстов захардкожена (h1 — из CMS). Переход к `system_content` по мере наполнения.
- `components/shared/*` + лайтбоксы (`Gallery/Salon/Portfolio`) — сырой `<img>` там, где аспект неизвестен (баннер), хост произвольный (`Avatar` vs жёсткий `remotePatterns`) или нужны натуральные размеры (лайтбоксы). Обосновано в коде.
- `app/store/providers/AuthContext.tsx:233` — `exhaustive-deps` подавлен осознанно (`isAuth` исключён, перепроверка токена только по явному refetch).
- `AuthContext.tsx` (user-state) — локальный `user` вместо чтения из хука: осознанный decoupling от 60с-поллинга `getMe` (иначе ре-рендер всех потребителей каждые 60с).
- `app/booking/page.tsx` — без локального `<Suspense>`: страница `force-static` (пререндер), fallback резолвится при прегенерации и до клиента не доходит.
- `app/store/reducers/CartSlice.ts` — корзина на Redux + redux-persist (клиентская), а не нативный серверный cart API из рецепта.
- JSDoc-стиль — тип в фигурных скобках у `@param` и `@returns` (отклонение от `jsdoc.md`, зафиксировано в CLAUDE.md).
- `app/api/api/api.ts` — `LANG_CODE='en_US'`, locale не из params, `langCode` в SDK не передаётся (одноязычный сайт; касается create-page/profile/localization/form/search).
- `app/api/utils/dictionaries.ts` — словарь UI-строк на блоке `system_content` (`getBlockByMarker`) вместо `AttributeSet static_content`, без хелпера `t()`.
- `useBookingSubmit.ts` — оплата `cash` и маркеры заказа захардкожены: в верстке нет шага выбора оплаты (запись на приём, не e-commerce). `stripe` привязан технически — *пересмотреть,* если появится онлайн-оплата как продуктовое решение.
- CSP — **решение: пропустить** (HSTS/XFO/nosniff/Referrer/Permissions на месте; nonce-CSP для Next + OAuth — отдельный проект).
- `.claude/temp/*` (наполняющий контур admin API: Playwright-логин, `OE_ADMIN_*`, перезапись `listTitles`) — вне правил/скиллов сознательно: внутренний REST админки, не публичный SDK. Документирован в CLAUDE.md и памяти (`admin-api-fill-mechanics`).

## 2. ⛔ Опровергнуто (правка неверна/вредна) · 🟨 отклонено по замеру

- ⛔ `useBookingSubmit.ts:130` — «`formIdentifier` из `getAllOrdersStorage()`»: у единственного storage он `null` → отправка `null` сломала бы `createOrder`. Хардкод `'order'` (маркеры в `orderMarkers.ts`) — единственный рабочий вариант.
- ⛔ `next.config.ts` — «PPR через `experimental.ppr`»: ключ удалён в next@16.2.10 (`HardDeprecatedConfigError`), правка сломала бы сборку.
- ⛔ `gallery-grid/GalleryGrid.tsx` — «photoswipe тянется в чанки»: модуль не импортируется (мёртвый код), в module graph не входит.
- ⛔ `updateUserState.ts` — «user-authorized обёртки в `app/api/server/`»: правило про способ вызова, не структуру папок; ни `'use server'`, ни `server-only` — требование выполнено.
- 🟨 SDK в клиентском бандле — **562 КБ raw / 121 КБ gzip (28% JS)**, на каждом роуте. Решение пользователя: **не чинить** («150кб фигня»); ленивый SDK превращает синхронный `login()` в fire-and-forget в самой хрупкой подсистеме. Рецепт (вынести `isError` в свой модуль, SDK через `await import()` в 2 путях) — в git-истории.
- ⛔ `app/api/api/api.ts` — «включить `errors: { isShell: false }` в `defineOneEntry`, чтобы сетевые сбои бросали, а не возвращались данными». Правка выглядит как правильное лечение первопричины (см. §3, «конверт SDK»), но **ломает классификацию ошибок**: при `isShell:false` SDK начнёт бросать и на 404/400/401, эти статусы уйдут в `catch` [fetchCmsData.ts](app/api/utils/fetchCmsData.ts) (строки 81–101), получат лишний ретрай с бэкоффом и вылетят throw'ом. Ветка `isError(data) && isTransientStatus(...)` станет мёртвым кодом, а стабильные 404 перестанут кэшироваться — это прямое нарушение задокументированной политики «404 стабилен и кэшируется, 5xx/429/408 транзиентны и бросаются». Проверено двумя независимыми разборами 2026-07-23. Лечить надо в обёртках (`expectCmsArray`), а не в конфиге SDK.
- 🟨 Картинки карточек мастеров не гейтятся по вьюпорту — закадровые ≈ **52 КБ**. **Не чинить**: 52 КБ шум, `sizes`/`loading="lazy"`/blur уже на месте. *Пересмотреть,* если карточек станет заметно больше.

## 3. 📋 Незакрытые хвосты

- **Stripe redirect URLs** — `successUrl`/`cancelUrl` берутся из настроек Stripe-аккаунта в админке и указывают на CMS-хост `beauty.oneentry.cloud`; код их в `createSession(id,'session')` не передаёт. Страницы `payment_success` (id 120) / `payment_canceled` (id 121) в CMS есть и рендерятся через `app/[handle]`. Чинить в настройках Stripe-аккаунта, когда включат онлайн-оплату (сейчас бронь = cash).
- **Юнит-покрытие SDK-слоя** — не покрыты 18 server-обёрток, ~23 RTK-эндпоинта, 4 хука: envelope/shape-допущения без юнит-сети. Крупная отдельная работа.
- **Типы SDK↔CMS** — ~15 `.value as Array<>`-кастов гардятся только в рантайме (`?? []`/`?.[0]`/`Array.isArray`), TS их не проверяет (деградируют, не падают). Ранее падавшие места (`offer_services`, `gallery_photos` = `''`) закрыты; остаются касты среза `master`.
- 📋 **Конверт SDK может отдать не-массив под видом успеха.** При `isShell: true` (дефолт) сбой/таймаут/пустое тело `200` не бросают, а возвращаются как голый `{}`; `isError({})` = `false` (нет `statusCode`) → `{}` проходит `fetchCmsData` как успех и ложится под ключ, объявленный массивом (ни `?? []`, ни `|| []` не спасают — только `Array.isArray`). Закрыто [expectCmsArray](app/api/utils/expectCmsArray.ts) в трёх обёртках, где массивом объявлен сам ответ. **Помнить:** обёртки, отдающие `data.items`, безопасны лишь случайно (`{}.items` = `undefined`); начнёт такая отдавать `data` напрямую — дыра откроется. Правка `errors: { isShell: false }` отклонена (см. §2).
- 📋 **Вторичные данные не должны решать судьбу 404** — в `salons/[handle]` и `gallery/[handle]` вылечено (`getCmsGalleryItems().catch(() => [])`, галерея резолвилась в одном `Promise.all` с чтением страницы и роняла роут до `notFound()`); проверить тот же паттерн в остальных роутах при случае.
- **Мобильная нав-панель** — focus-trap/scroll-lock (`useDialogA11y`) не подключены: панель — не диалог, отдельная работа.
- 📋 **Два хронически flaky e2e-спека** (проверено 2026-07-22 на прод-билде: падают **и на текущей версии, и на версии до рефакторинга**, значит хрупкость давняя): [reviews.spec.ts:11](tests/e2e/reviews.spec.ts#L11) — `getByTestId('reviews-page')` в момент раскрытия Suspense резолвится в **два** узла (старый ещё скрыт, новый уже вставлен) → strict mode violation; [gallery.spec.ts:17](tests/e2e/gallery.spec.ts#L17) — `scrollIntoViewIfNeeded` на элементе, который в этот момент открепляется от DOM. Оба проходят с ретраем (`retries: 1`), поэтому суммарный прогон зелёный. Чинить в тестах (ждать стабилизации/сужать локатор), а не в коде.
- 📋 **Третий flaky-спек** (2026-07-23): [network-degradation.spec.ts:76](tests/e2e/network-degradation.spec.ts#L76) — `getByTestId('booking-page')` резолвится в два скрытых узла → strict mode violation. В разметке этот testid **ровно один** (проверено grep'ом), то есть дублируется не он, а всё поддерево — в момент раскрытия Suspense старое ещё в DOM, новое уже вставлено. Та же природа, что у `reviews.spec.ts`; чинить в тесте (ждать стабилизации / `.first()`), а не в коде.
- **Home `OfferCard` → booking deep-link** — код общий с `/offers` (покрыт `offer-booking.spec.ts`), отдельным тестом не покрыт.
- **Inline Edit/Save заказа** — не тестируется осознанно: `OrderButtonsGroup` их не рендерит (`EditOrderButton`/`SaveOrderButton` лежат на диске неиспользуемыми).
- 📋 **Error boundary** — автоматизировать в текущем сетапе нечем: e2e гоняет прод-билд, серверные чтения CMS пререндерены, `route.abort` до них не дотягивается. `data-testid="error-boundary"` на `app/error.tsx` есть, все тесты деградации проверяют его **отсутствие**.
- ⛔ **Contact-form submit** — reCAPTCHA Enterprise v3, Playwright → 400 (память `oneentry-spam-captcha-mechanics`). Покрыт только рендер формы; сабмит не автоматизировать.
- ⛔ **Password-reset / signup completion** — OTP приходит out-of-band (email) → полный проход не автоматизировать (только до шага кода). Завершение signup — за `E2E_ALLOW_SIGNUP=1` (пишет реального юзера, delete-эндпоинта нет).

## 4. 🔧 Осознанные отклонения от верстки `static-html/`

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

## 5. Аудит на рефакторинг (2026-07-22)

Многоагентный аудит (101 агент): 4 recon-прохода → 12 профильных поисковиков → **82 находки** → состязательная верификация каждой (агент обязан её опровергнуть) → 2 критика полноты/архитектуры. **52 находки подтверждены, 30 опровергнуто.** Код не менялся — это оценка. Метки объёма: **S** — до получаса, **M** — до половины дня, **L** — день и больше.

### 5.1 Вердикт

Зрелая, дисциплинированная кодовая база: строгий TS без единого `any`/`@ts-ignore` в исходниках, отдельные модули под каждую чистую функцию, JSDoc почти везде, документированные инварианты кэширования и деградации. Архитектурных катастроф нет.

**План рефакторинга (блоки A–I) выполнен 2026-07-22/23** — доменный слой CMS, фабрика кэширующих ридеров, редьюсер визарда брони, плоская корзина, токены, чистка мёртвой поверхности, снятие persist с паролей. История — в git. Ниже (5.3 «По случаю», 5.5) осталось только не сделанное и осознанно отклонённое.

### 5.2 Что уже хорошо — не трогать

- **[fetchCmsData.ts](app/api/utils/fetchCmsData.ts)** — таймаут, ретрай с бэкоффом и разделение transient/stable ошибок централизованы в одном покрытом тестами файле.
- **Мелкие чистые хелперы букинга**: [slotFits.ts](components/layout/booking-page/slotFits.ts), [daySlots.ts](components/layout/booking-page/daySlots.ts), [dayCloseMinutes.ts](components/layout/booking-page/dayCloseMinutes.ts), [toBookingInterval.ts](components/layout/booking-page/toBookingInterval.ts) — один экспорт на файл, юнит-покрытие. Это эталон, к которому надо приводить остальное.
- **Тонкие ридеры атрибутов**: [fileDisplayUrl.ts](components/utils/fileDisplayUrl.ts), [fileBlurDataUrl.ts](components/utils/fileBlurDataUrl.ts), [plainTextFromTextAttr.ts](components/utils/plainTextFromTextAttr.ts), [formatUaePhone.ts](components/utils/formatUaePhone.ts), [isOfferProduct.ts](app/utils/isOfferProduct.ts) — правильный паттерн, просто применён не везде.
- **Дедупликация запросов**: [getChildPagesByParentUrl.ts](app/api/server/pages/getChildPagesByParentUrl.ts) и [getMastersList.ts](app/api/utils/getMastersList.ts) уже обёрнуты в React `cache()`. «Салоны фетчатся 6 раз» и «мастера ищутся 4 раза» — это уже решено, повторно оптимизировать нечего.
- **Клиентский гейт `/profile`** ([AuthContext](app/store/providers/AuthProvider.tsx)) — осознанное решение при отсутствии cookie-сессии. Не переводить на middleware.
- **Разделение mobile/desktop сиблингами** и e2e-хуки `data-testid` — рабочая конвенция; e2e-селекторы уже используют `:visible`, дубли testid безопасны.
- **[BookingAnimations.tsx](components/layout/booking-page/animations/BookingAnimations.tsx)** — его «расширенное» условие входа задокументировано как фикс реального бага, а не дрейф. Не унифицировать со stage-обёртками профиля.
- **[app/global-error.tsx](app/global-error.tsx)** — хардкод градиента там намеренный (заменяет root layout, токены недоступны).
- **[components/data/](components/data)** — временные захардкоженные наборы до переезда в CMS, по файлу на набор. Не абстрагировать.

### 5.3 Остаток плана

Блоки A–I выполнены (git). Ниже — стоячие решения и ловушки, всплывшие при выполнении, плюс не начатое «по случаю».

**A (доменный слой `master`) — не доведён до полного слияния, сознательно.** Имя салона унифицировано ([salonLabel](app/utils/salonLabel.ts)). Два `toMasterItem` **не сливались**: их различия (`categories`, `href`) — честная разница поверхностей (у ленты главной нет фильтров и deep-link), не копипаста, выгода слияния меньше, чем оценил аудит.
**🟨 Рейтинг по умолчанию — НЕ унифицируется** (решение пользователя 2026-07-23): появится форма отзывов, рейтинг переедет на расчёт из них. Учесть при переходе: `Number(x) || 5` превращает **настоящую** оценку 0 в 5, а `master.rating.toFixed(1)` в [MobileSpecialistList.tsx:92](components/layout/masters-page/components/MobileSpecialistList.tsx#L92) печатает «0.0» (гость читает как плохую оценку) — честный вариант «рейтинга нет → не показывать».

**G (токены) — ловушки на будущее.**

- **Шкалы `--shadow-*` строить не надо** — замер ([shadow-inventory.mjs](.claude/temp/shadow-inventory.mjs)): 58 различных значений теней, 41 встречается ровно один раз, 20 несут рантайм-цвет и не токенизируются. Заведён один реально дублирующийся токен `--shadow-modal`; остальное свести в шкалу = редизайн, меняющий пиксели.
- **Три «brand»-градиента таковыми не являются** — ловушка массовой замены на `bg-gradient-brand`: два `#9B4FB2→#ed21f1` (purple→pink), один с альфой (`#f60efbdd,#ed21f1cc`), один — **те же цвета в обратном порядке** (`#ed21f1, #f60efb`). Плюс [ServiceCard.tsx:147](components/layout/services-page/ServiceCard.tsx#L147) — ветка тройного условия по рантайм-`hovered`, в класс не выносится.
- **⛔ Императивные `e.currentTarget.style.*` в [CategoryTabs.tsx](components/layout/services-page/CategoryTabs.tsx#L73) — угроза «рассинхрона под курсором» опровергнута замером:** React диффит объект инлайн-стилей и полностью перетирает управляемые им свойства при перерисовке (проверено вживую). Остаётся лишь косметика (активная вкладка, ставшая неактивной под курсором, до увода мыши без hover-подсветки).

#### По случаю — когда уже открыл файл

Сделано 2026-07-23 (история — в git): разбит `DateTimeStep` (→ `MonthCalendar`+`CalendarDayCell`, `TimeSlotGrid`+`TimeSlotButton`, `daysInMonth`/`firstDayOfMonth`), слиты `FromAnimations`+`HistoryAnimations` → [StageFadeAnimations](components/layout/profile-page/animations/StageFadeAnimations.tsx), заведён `@utility page-shell` (27 сайтов; несводимы [header/index.tsx:46](components/layout/header/index.tsx#L46) без `mx-auto` и два `p-3`-сайта портфолио — оставлены), вычищен мёртвый CSS (`#footer` и три осиротевших `@utility` из globals.css; файлы `image-gallery.css`/`payment.css`/`nav-menu.scss` и зависимость `sass` уже были удалены ранее). Остаётся один пункт:

- **🟨 `.fade-in` наружу из [IntroAnimations.tsx:133](app/animations/IntroAnimations.tsx#L133) — отложено (2026-07-23).** Единственный document-wide селектор в проекте (нарушает конвенцию «анимации ref-обёртками, не по классам»): loader гасит `.set('.fade-in', autoAlpha:0)` пять узлов в **серверных** Header/Footer и потом их же проявляет со stagger 0.1. Убрать глобальный селектор = завести кросс-компонентный реестр рефов через server/client-границу, а он вносит **гонку**: реестр наполняется на mount узлов, `useGSAP` loader'а стартует тоже на mount — не успеют зарегистрироваться до `.set(autoAlpha:0)` → вспышка контента на **каждой** загрузке. Выгода — только конвенция (нулевое изменение поведения), риск — регресс самого заметного loader'а без надёжного пути верификации (играет раз за сессию). Аудит сам пометил «не срочно». Делать отдельной задачей с проверкой intro-последовательности.

### 5.4 Не трогать / отклонено

- **Создавать `app/api/index.ts`.** CLAUDE.md его требует, но 40+ потребителей годами живут на глубоких импортах, и это рекомендованный для Next паттерн. Баррель, реэкспортирующий серверные обёртки (`unstable_cache`, `next/cache`) вместе с клиентскими хуками — ровно тот риск, который предвосхищает JSDoc в [useSearchProducts.ts:17](app/api/hooks/useSearchProducts.ts#L17). **Править надо документацию, а не код.**
- **Дробить [RTKApi.ts](app/api/api/RTKApi.ts) на `endpoints/*` и выносить мёртвые эндпоинты в `legacy.ts` через `injectEndpoints`.** Чистая релокация 519 строк; выигрыш по бандлу околонулевой (вес даёт сам SDK, ~126 КБ gzip). Хуже: `injectEndpoints` в модуле, который никто не импортирует, означает, что эндпоинты не регистрируются — это удаление под видом сохранения. Правило «одна функция — один файл» тут не аргумент: это один вызов `createApi`.
- **Переводить `useCmsForm` на локальный `useState` и убирать `FormFieldsSlice`.** Плоский мешок — **намеренный** межшаговый handoff между размонтированными компонентами: [ForgotPasswordForm.tsx:51](components/forms/ForgotPasswordForm.tsx#L51) пишет `email_reg`, [VerificationForm.tsx:81](components/forms/VerificationForm.tsx#L81) — `otp_code`, [ResetPasswordForm.tsx:77](components/forms/ResetPasswordForm.tsx#L77) читает оба. Локальное состояние сломает три потока. Из этой находки берётся **только** снятие persist. Побочно: утверждение «каждое нажатие клавиши перерисовывает всех потребителей `useCmsForm`» неверно — [modal/index.tsx:122](components/layout/modal/index.tsx#L122) монтирует ровно одну форму за раз.
- **Сужать `OpenDrawerContext` до `{popup}`.** `'MobileMenu'` — **живое** значение ([MenuButton.tsx:29](components/layout/header/nav/MenuButton.tsx#L29), [MobileNavPanel.tsx:31](components/layout/header/nav/MobileNavPanel.tsx#L31)), а guard в [PopupRoot.tsx:33](components/layout/PopupRoot.tsx#L33) нужен, чтобы не тянуть чанк форм при открытии мобильного меню. `action`/`transition`/`direction` тоже потребляются. Полезная часть этой находки — типизировать строки на месте (`component: PopupKey`, `action: '' | 'activateUser' | 'checkCode'`) и снять каст `as unknown as Record<string, ...>` в `formsMap`, чтобы опечатка в любом из 13 `setComponent` стала ошибкой компиляции.
- **Полноценный `authFlowReducer` в `components/forms/auth-flow/`.** ~15 файлов в самой рискованной подсистеме ради замены 8 строковых литералов, которые чинит union-тип бесплатно. Внутри этих форм задокументированы выстраданные фиксы (реальный browser fingerprint в `auth()`, конверты `boolean | IError`, `EVENT_PASSWORD_RESET` vs `EVENT_REGISTRATION`, ловушка `useTransitionRouter` вне провайдера).
- **`useFormSubmit()` как владелец SDK-конвертов.** Каждая форма проверяет `isError` против **своего** типа возврата с формоспецифичным сообщением; общего там только тернарник. Оставить `toErrorMessage(e, fallback)`.
- **Бампать persist-версию `cart-slice` до 3 с миграцией `() => undefined` при удалении `tabsState`.** Это сотрёт корзину в процессе брони у вернувшихся пользователей. Устаревший ключ безвреден.
- **Убирать `version`/`setCartVersion` и эффект в [AuthProvider.tsx:203](app/store/providers/AuthProvider.tsx#L203).** Аннотированная преднамеренная заглушка («Kept, not deleted, per project convention — revisit when the native cart API is wired up»), с тестовым покрытием.
- **Общий `SelectableCard`/`SpecialistCardShell` с `children`.** Восемь «потребителей» — не один примитив: радиус 2xl/xl/lg/full, бордер 2px/1.5px/1px, ring 3px/2px/нет, тинт есть/нет, у `PaymentMethodPicker` тени нет вообще, `CategoryTabs` — градиентная пилюля. Компонент «с `active` как единственным входом» потребовал бы ещё шести пропов. Плюс бейдж вложен в портретный контейнер и шеллом не владеется.
- **`CardChipsFooter`** — конфиг (padding, height, spacer, minHeight) превышает экономию в 4-5 строк.
- **Считать `chipsMinH`/`DESC_MIN_H` следствием копипасты.** [SpecialistStep.tsx:110](components/layout/booking-page/components/SpecialistStep.tsx#L110) выводит его из `maxChipsAcross` по всей сетке — он переживёт любую унификацию.
- **`PaymentMethodPicker.tsx:42` как сайт `FromPrice`.** Это лейбл секции «Payment», а не кикер цены.
- **Сворачивать [BgAnimations.tsx:80](components/layout/home/catalog-grid/animations/BgAnimations.tsx#L80) в `useScrollTriggerRefresh` или удалять его «после guard'ов».** Синхронный refresh внутри `useGSAP` лечит другую причину (устаревшие start/end после смены высоты страницы) и не заменяется isActive-guard'ом; пять сиблинг-сайтов делают то же намеренно.
- **Единая `useScrollReveal` со схемой `{start, from, to, exit}`.** Три из семи таймлайнов не выражаются: SVG stroke-drawing с `getTotalLength`/`timeScale`/`onComplete` в catalog-grid, обратный stagger выхода в `MasterAnimations`, условный `.arrow` в `ReviewsAnimations`. Если делать — только через `build(tl, root)`-колбэк и только для трёх обёрток в `app/animations/`.
- **`sameAs` из [socialData.ts](components/data/socialData.ts).** Ссылки там — литералы `'#1'`/`'#2'`/`'#3'`; «фикс» отправит поисковикам невалидные фрагменты, то есть строго хуже текущего. Правильно — **удалить** массив до появления реальных аккаунтов.
- **Строить sitemap из `PAGES` ([constants.ts:7](app/utils/constants.ts#L7)) или из `generateStaticParams`.** `PAGES` — таблица маркеров CMS, а не роутов Next: в ней **нет** `offers` и `reviews` (тех самых пропавших), зато есть `profile` и `404`. Импорт page-модулей в route handler затянет клиентский граф. Sitemap уже вызывает те же функции слоя данных.
- **`app/utils/structuredData/<type>.ts` — билдер на схему.** Пять объектов, у каждого один потребитель и своя форма; приватные хелперы в файле-потребителе конвенции не нарушают. Из находки берётся только `JsonLd.tsx` (экранирование в одном месте).
- **Схема `BeautySalon` для contacts/salons.** Это новая SEO-функциональность, а не рефакторинг; и она была поставлена в зависимость от непроверенных пунктов.
- **Переносить `sharp` в `dependencies`.** next@16.2.10 везёт `sharp ^0.34.5` в собственных `optionalDependencies` (`--omit=dev` их не отбрасывает); корневой `sharp@0.33.5` — устаревший дубль.
- **`@types/react-redux` как «опасность типизации по v7».** С `moduleResolution: "bundler"` собственные типы `react-redux@9` выигрывают безусловно, а сам пакет — модуль, не ambient-скрипт. Это мусор, а не угроза.
- **Упрощать работающие `md:max-xl:` сайты обратно в `xl:`** после конвертации брейкпойнтов — три рабочих места, риск регрессии, нулевой выигрыш.
- **Пятиступенчатый сплит `app/types/global.ts` на файлы.** Правило «одна функция — один файл» про функции и компоненты, не про type alias'ы.
- **`findOrderField(order, marker): {marker, value: unknown}`** — `formData.find(...)` уже однострочник, `unknown` оставляет каст на call-site.
- **`masterServiceParentIds` как общий хелпер** — единственный настоящий потребитель; в `master-single` берётся `[0]`, а `parseServiceLinks` читает вообще `value.id` и разбирает `p-{pageId}-{productId}`.
- **`stepDone` и слияние 8 `useState` в один объект ради тестируемости** — первое односайтовое (6 строк), второе форсирует переписывание `useBookingPreselect` в самом горячем файле.
- **Серверный gate `/profile` через middleware** — токены в localStorage, cookie-сессии нет; гость видит только каркас, данные защищены user-токеном на уровне SDK.
- **Считать `SearchBar.tsx`, `BottomMenu`, `OfferCircle`/`OfferInfo`, `components/layout/mobile-menu/` кандидатами на удаление** — они удерживаются намеренно. Любое удаление в этом отчёте (мёртвый CSS, `nav-menu.scss`, пакеты) — **предложение, требующее явного согласия**, а не самостоятельное действие.

### 5.5 Сверка с разделами 1–4 реестра

Агенты аудита работали, не зная про этот файл, — сверка сделана отдельно. Стоячее:

- **Не противоречит §1.** Корзина на Redux остаётся осознанным отклонением: плоская форма — внутри слайса, а не смена слоя. Клиентский гейт `/profile`, JSDoc-стиль, `LANG_CODE`, словарь на `system_content` аудит подтвердил как «не трогать».
- **Совпало с §2.** «Разорвать цепочку root-layout → OneEntry SDK» и «`import 'server-only'` во все обёртки `app/api/server/**`» верификация отклонила по тем же причинам, что зафиксированы в §2 (последнее ломает сборку — [logOutUser.ts](app/api/server/users/logOutUser.ts) помечен `'use client'`).
- **📋 Хвост §3 «Юнит-покрытие SDK-слоя» открыт.** Фабрика ридеров сократила 16 копий до одной, но контрактных тестов конверта не добавила (находку «контрактный тест» верификация сочла преувеличенной, но покрытие всё равно отсутствует).
- **📋 Заголовки на `/gallery` и `/masters`.** Ни одного `h1`–`h6` (факт подтверждён); общий `PageHeader` отклонён — ставить заголовки по месту.


