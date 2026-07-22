# MISMATCH-LOG — аудит на соответствие MCP `oneentry`

Реестр несоответствий кода правилам (`get-rule`) и рецептам (`get-skill`) OneEntry SDK, а также оценок на рефакторинг (раздел 5).
Аудит 2026-07-14, адверсариальная верификация 2026-07-15; разбор обвязки Next.js — 2026-07-19; дизайн-паритет — 2026-07-20; e2e-покрытие — 2026-07-21; рефакторинг — 2026-07-22.

**Статус (2026-07-23): все выполненные пункты удалены из файла** (история — в git; рефакторинг волн 0–2 закоммичен в `0.1.84`). Ниже остались только осознанные отклонения, опровергнутые/отклонённые правки и незакрытые хвосты.

Метки: ✅ выполнено · 🔧 осознанное отклонение (оставлено, задокументировано) · ⛔ опровергнуто (правка неверна/вредна) · 🟨 отклонено по замеру (цена > выгоды) · 📋 открыто / не автоматизируется.

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
- 🟨 Картинки карточек мастеров не гейтятся по вьюпорту — закадровые ≈ **52 КБ**. **Не чинить**: 52 КБ шум, `sizes`/`loading="lazy"`/blur уже на месте. *Пересмотреть,* если карточек станет заметно больше.

## 3. 📋 Незакрытые хвосты

- **Stripe redirect URLs** — `successUrl`/`cancelUrl` берутся из настроек Stripe-аккаунта в админке и указывают на CMS-хост `beauty.oneentry.cloud`; код их в `createSession(id,'session')` не передаёт. Страницы `payment_success` (id 120) / `payment_canceled` (id 121) в CMS есть и рендерятся через `app/[handle]`. Чинить в настройках Stripe-аккаунта, когда включат онлайн-оплату (сейчас бронь = cash).
- **Юнит-покрытие SDK-слоя** — не покрыты 18 server-обёрток, ~23 RTK-эндпоинта, 4 хука: envelope/shape-допущения без юнит-сети. Крупная отдельная работа.
- **Типы SDK↔CMS** — ~15 `.value as Array<>`-кастов гардятся только в рантайме (`?? []`/`?.[0]`/`Array.isArray`); TS их не проверяет (деградируют, не падают). *Единственный из них, который реально падал (`offer_services` = `''` → `''.map`), закрыт 2026-07-22 в `parseOfferBase` (см. 5.3).*
- **Мобильная нав-панель** — focus-trap/scroll-lock (`useDialogA11y`) не подключены: панель — не диалог, отдельная работа.
- 📋 **Два хронически flaky e2e-спека** (проверено 2026-07-22 на прод-билде: падают **и на текущей версии, и на версии до рефакторинга**, значит хрупкость давняя): [reviews.spec.ts:11](tests/e2e/reviews.spec.ts#L11) — `getByTestId('reviews-page')` в момент раскрытия Suspense резолвится в **два** узла (старый ещё скрыт, новый уже вставлен) → strict mode violation; [gallery.spec.ts:17](tests/e2e/gallery.spec.ts#L17) — `scrollIntoViewIfNeeded` на элементе, который в этот момент открепляется от DOM. Оба проходят с ретраем (`retries: 1`), поэтому суммарный прогон зелёный. Чинить в тестах (ждать стабилизации/сужать локатор), а не в коде.
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

482 файла, ~43k строк, крупнейший файл — 519 строк ([RTKApi.ts](app/api/api/RTKApi.ts)), за ним [useBookingWizard.ts](components/layout/booking-page/useBookingWizard.ts) на 479. Это зрелая, дисциплинированная кодовая база: строгий TS без единого `any`/`@ts-ignore` в исходниках, отдельные модули под каждую чистую функцию, JSDoc почти везде, документированные инварианты кэширования и деградации. Архитектурных катастроф нет — есть один системный пробел и несколько накопившихся хвостов.

Пробел был один и объяснял треть находок: **между `app/api/server/*` (сырые SDK-конверты) и `components/layout/*` (презентация) не было доменного слоя**. По состоянию на 2026-07-23 он закрыт наполовину: срез `salon` ([salonFromPage](app/utils/salonFromPage.ts) + [salonMapLinks](app/utils/salonMapLinks.ts), 8 сайтов), типизированный ридер entity-ссылок ([entityLinks](app/utils/entityLinks.ts), закрыл единственную реальную crash-поверхность `''.map`) и фабрика кэширующих ридеров ([createCachedCmsReader](app/api/utils/createCachedCmsReader.ts), 6 обёрток) — сделаны. **Остался срез `master`**: пять параллельных декодеров админа-мастера и два разошедшихся `toMasterItem` (имя салона на `/masters` резолвится из CMS, на главной — через `.replace(/^Thalia\s+/i,'')`) — блок A ниже.

Из трёх очагов долга закрыты два: (в) мёртвая поверхность вычищена по явной просьбе пользователя (`tabsState`, `OrderSlice`, `useCreateOrder`, обёртки и эндпоинты без потребителей, неиспользуемые пакеты), и **пароли больше не пишутся в `localStorage`** — `formFieldsReducer` снят с persist. Остаются: (а) декодирование CMS-атрибутов в срезе `master`, (б) состояние букинга — 12 `useState` в мастере брони (блок C; тестовые леса под него заведены) и форма корзины (блок E).

### 5.2 Что уже хорошо — не трогать

- **[fetchCmsData.ts](app/api/utils/fetchCmsData.ts)** — таймаут, ретрай с бэкоффом и разделение transient/stable ошибок централизованы в одном покрытом тестами файле. Именно поэтому фабрика обёрток (п. 3) — вопрос шаблона, а не корректности.
- **Мелкие чистые хелперы букинга**: [slotFits.ts](components/layout/booking-page/slotFits.ts), [daySlots.ts](components/layout/booking-page/daySlots.ts), [dayCloseMinutes.ts](components/layout/booking-page/dayCloseMinutes.ts), [toBookingInterval.ts](components/layout/booking-page/toBookingInterval.ts) — один экспорт на файл, юнит-покрытие. Это эталон, к которому надо приводить остальное.
- **Тонкие ридеры атрибутов**: [fileDisplayUrl.ts](components/utils/fileDisplayUrl.ts), [fileBlurDataUrl.ts](components/utils/fileBlurDataUrl.ts), [plainTextFromTextAttr.ts](components/utils/plainTextFromTextAttr.ts), [formatUaePhone.ts](components/utils/formatUaePhone.ts), [isOfferProduct.ts](app/utils/isOfferProduct.ts) — правильный паттерн, просто применён не везде.
- **Дедупликация запросов**: [getChildPagesByParentUrl.ts](app/api/server/pages/getChildPagesByParentUrl.ts) и [getMastersList.ts](app/api/utils/getMastersList.ts) уже обёрнуты в React `cache()`. «Салоны фетчатся 6 раз» и «мастера ищутся 4 раза» — это уже решено, повторно оптимизировать нечего.
- **Клиентский гейт `/profile`** ([AuthContext](app/store/providers/AuthProvider.tsx)) — осознанное решение при отсутствии cookie-сессии. Не переводить на middleware.
- **Разделение mobile/desktop сиблингами** и e2e-хуки `data-testid` — рабочая конвенция; e2e-селекторы уже используют `:visible`, дубли testid безопасны.
- **[BookingAnimations.tsx](components/layout/booking-page/animations/BookingAnimations.tsx)** — его «расширенное» условие входа задокументировано как фикс реального бага, а не дрейф. Не унифицировать со stage-обёртками профиля.
- **[app/global-error.tsx](app/global-error.tsx)** — хардкод градиента там намеренный (заменяет root layout, токены недоступны).
- **[components/data/](components/data)** — временные захардкоженные наборы до переезда в CMS, по файлу на набор. Не абстрагировать.

### 5.3 Приоритетный план рефакторинга

#### Следующий заход — ценно, но крупнее

**A. Доменный слой CMS для `master`** — остаток находок 1, 2, 19, 20, 27, 51 (срезы `salon`, `entityLinks` и чтение фото закрыты 2026-07-22).
*Файлы:* [app/masters/page.tsx:44](app/masters/page.tsx#L44), [masters-feed/index.tsx:26](components/layout/home/masters-feed/index.tsx#L26), [booking-data.ts:62](app/booking/booking-data.ts#L62), [master-single/index.tsx:60](components/layout/master-single/index.tsx#L60), [portfolio-grid/index.tsx:42](components/layout/portfolio-grid/index.tsx#L42), [masterSalonsById.ts:29](app/gallery/masterSalonsById.ts#L29).
*Что не так:* пять параллельных декодеров админа-мастера; два из них называются `toMasterItem`, возвращают один тип `MasterItem` и **уже разошлись** по источнику имени салона и по `categories`.
*Что сделать:* (i) экспортировать мапперы — в `booking-data.ts` и `masters-feed/index.tsx` достаточно ключевого слова `export`, реально переносить надо только из двух `page.tsx` (Next отвергает произвольные именованные экспорты в page-модулях); (ii) характеризационные тесты **по каждому сайту отдельно**, сравнить таблицы; (iii) только потом сливать. Маппер класть рядом с роутом (как [catalog-data.ts](app/services/catalog-data.ts)), а не в новое дерево.
*Объём:* M. *Риск:* средний и **видимый** — унификация меняет рендер.
*📋 Требует решения пользователя (два расхождения, оба не покрыты тестами):* рейтинг по умолчанию — **5** (страница мастеров, бронь) против **0** (профиль мастера, карточка заказа); имя салона — «· Thalia Downtown» (`/masters`) против «· Downtown» (лента главной).
*Предварительно:* характеризационные тесты.

**C. Мастер брони: reducer вместо 12 `useState`** — находки 11 и 43.
*Файлы:* [useBookingWizard.ts:129](components/layout/booking-page/useBookingWizard.ts#L129), [useBookingPreselect.ts:16](components/layout/booking-page/useBookingPreselect.ts#L16), [bookingStepKeys.ts:36](components/layout/booking-page/bookingStepKeys.ts#L36).
*Что не так:* 12 независимых ячеек без инварианта. `resetFlow` пишет 10 сеттеров, `startFlow` — 5. Позиция в потоке — `stepIdx: number` по **производному массиву переменной длины**, без клампа: `currentStepKey` может стать `undefined`, пока `flow` установлен ([index.tsx:162](components/layout/booking-page/index.tsx#L162) отрисует бар Back/Continue без шага). Навигация «Change» работает не переходом, а совпадением длин массива. `useBookingPreselect` получает **мешок из 8 сеттеров**, то есть прибит к точной раскладке `useState`. Ячейка `pendingDateTime` существует только чтобы отложить `setStepIdx` до устаканивания производного списка.
*Что сделать:* `booking-page/state/` — `BookingState` со `step: StepKey`, дискриминированный `BookingAction`, редьюсер с `anchorStep(next, data)` в конце каждого кейса (недостижимое состояние становится непредставимым, `pendingDateTime` исчезает, мешок сеттеров заменяется одним `PRESELECT`). `mobileSummary`/`booked` остаются обычным `useState` — это view-состояние. Сигнатура редьюсера требует каррирования: `useReducer(makeBookingReducer(data), init)`.
*Побочно:* [constants.ts:18](components/layout/booking-page/constants.ts#L18) `FLOWS['specialist-first']` мёртв — `bookingStepKeys` хардкодит оба specialist-порядка, порядок шагов уже живёт в двух местах.
*Эффект:* −мешок сеттеров, −ячейка-костыль, один источник переходов. *Объём:* L. *Риск:* **высокий** — это конверсионный путь, покрытый только 7 e2e-спеками. Сохранить дословно: прыжок `clearService` → шаг Service, fast-forward reschedule на Date & Time, авто-закрытие `mobileSummary`, render-фазовые коррекции под `useHydrated`. Ожидаемые «~150 строк из 479» оптимистичны — правила инвалидации переезжают, а не исчезают.

**E. Форма состояния `CartSlice`** — остаток находки 24 (`OrderSlice`, `useCreateOrder` и `tabsState` удалены 2026-07-22, persist форм снят).
*Файлы:* [CartSlice.ts:44](app/store/reducers/CartSlice.ts#L44), [OrderSlice.ts:46](app/store/reducers/OrderSlice.ts#L46), [store.ts:81](app/store/store.ts#L81), [useCreateOrder.ts:29](app/api/hooks/useCreateOrder.ts#L29).
*Что не так:* «Корзина» моделирует многострочность, которой нет: `activeItemId` инициализируется нулём и **не пишется ни одним редьюсером**, все 5 продюсеров передают `selectActiveItemId`, массив вечно длины 1 (JSDoc это признаёт). Из 6 полей `CartItem` читаются 3. Форма массива вынуждает `findIndex` и патчер с `as unknown as Record<string, unknown>`. JSDoc ссылается на хелпер `useCartItem`, которого в дереве нет.
*Что сделать:* сплющить в `{salonId?, productId?, masterId?}` с двумя редьюсерами (184 → ~60 строк).
*Объём:* M. *Риск:* меняется персистируемая форма — нужна третья запись в `cartMigrations`. [CartSlice.test.ts](tests/jest/CartSlice.test.ts) покрывает именно удаляемое поведение и переписывается целиком.
*Не трогать:* `version`/`setCartVersion` и эффект в [AuthProvider.tsx:203](app/store/providers/AuthProvider.tsx#L203) — это аннотированная преднамеренная заглушка под серверную корзину, с тестовым покрытием.

**G. Тени и остаток цветов** — остаток находки 37 (79 статичных inline-цветов в 21 файле переведены в классы 2026-07-22).
*Что не так:* `--shadow-*` токенов нет вообще: **61 inline-`boxShadow`** и **22 arbitrary `shadow-[...]`**, причём одинаковые значения встречаются в обоих синтаксисах. Осталось **4 файла** с `style={{ color: CONST }}` — там же, где рядом живёт динамика. Плюс 5 настоящих brand-градиентов мимо `bg-gradient-brand`.
*Что сделать:* статическая шкала `--shadow-card/-hover/-selected/-modal` (только нейтральные — рантайм-цветные тени не токенизируются); 5 градиентов → `bg-gradient-brand`; убрать императивные восстановления `e.currentTarget.style.borderColor` в [CategoryTabs.tsx:87](components/layout/services-page/CategoryTabs.tsx#L87) и [ServicesCatalog.tsx:173](components/layout/services-page/ServicesCatalog.tsx#L173) (рассинхронизируются, если `active` переключится под курсором).
*Объём:* M. *Риск:* визуальный, inline перебивает классы по каскаду. Диффы на 390/1280. Заметить: градиенты в [modal/index.tsx:170](components/layout/modal/index.tsx#L170) и [review-modal/index.tsx:73](components/shared/review-modal/index.tsx#L73) — **purple→pink**, не `bg-gradient-brand`.

#### По случаю — когда уже открыл файл

- **Разбить [DateTimeStep.tsx](components/layout/booking-page/components/DateTimeStep.tsx)** (322 строки, ноль подкомпонентов): `MonthCalendar` + `CalendarDayCell`, `TimeSlotGrid` + `TimeSlotButton`, `daysInMonth.ts`/`firstDayOfMonth.ts` отдельными файлами рядом с `slotFits.ts`. Дублирования не режет — это соответствие конвенции + тестируемость арифметики месяца. `FadeStaggerGroup` должен остаться прямым родителем кнопок, testid'ы сохранить. S.
- **`.fade-in` наружу из [IntroAnimations.tsx:134](app/animations/IntroAnimations.tsx#L134)**: единственный `useGSAP` в проекте без `scope`, тянет по всему документу пять узлов Header/Footer — сиблингов, а не потомков. Паритет требует пяти врапперов (stagger 0.1 по трём уровням вложенности), поэтому не срочно. Класс — чисто анимационный хук (`@utility fade-in { opacity: 0 }`), стилевого смысла не несёт. M.
- **Слить [FromAnimations.tsx](components/layout/profile-page/animations/FromAnimations.tsx) и [HistoryAnimations.tsx](components/layout/profile-page/animations/HistoryAnimations.tsx)** — `diff` даёт только длительности (0.5/0.6/0.4 против дефолтов) и стиль типизации; оба создают таймлайн с одним `id: 'stageFromTl'`. Мержить с пропом `duration`. S. Профильный `CardAnimations` и `BookingAnimations` **не** трогать.
- **Мёртвый CSS**: [image-gallery.css](app/styles/image-gallery.css) (370 строк) и [payment.css](app/styles/payment.css) (96) не импортируются ниоткуда, `react-image-gallery` вообще отсутствует в package.json; ~134 из 437 строк [globals.css](app/globals.css) недостижимы, включая блок `#footer` (футер рендерит `data-testid`, не `id`). В бандл ничего из этого не попадает — выигрыш чисто читательский. Пустое правило `.menu-item {}` удалить, **а класс в JSX оставить**. S, требует согласия.
- **[nav-menu.scss](app/styles/nav-menu.scss)** — единственная причина зависимости `sass`, 46 строк голой вложенности. Большая часть мертва (`ul.sub-menu` не рендерится нигде, `li.current` не применяется), остальное дублирует `group-hover:flex` и `hover:text-fuchsia-500` из [NavigationMenu.tsx](components/layout/header/main-menu/components/NavigationMenu.tsx) — **но с большей специфичностью**, то есть глобальный стиль молча перебивает компонент. Правильный ход: удалить файл, импорт и `sass`, а не переносить правила в globals.css. S, требует согласия.
- **`@utility page-shell`**: `mx-auto max-w-7xl px-3 md:px-8` в ~27 местах в 19 написаниях. Прецедент — `bg-gradient-stats` (11 потребителей). Не все сайты конвертируемы ([header/index.tsx:46](components/layout/header/index.tsx#L46) без `mx-auto`, два сайта на шорткате `p-3`). Учесть, что `@media` внутри `@utility` тяжело переопределять поштучно. M.

### 5.4 Порядок выполнения

Волны 0–2 выполнены (2026-07-22, коммит `0.1.84`); блоки B, D, F, H, I закрыты целиком, A/E/G — частично. Осталось четыре пункта.

- **A (срез `master`)** — идёт первым: он разблокирует остальное и **упирается в два решения пользователя** (рейтинг по умолчанию 5 или 0; «· Thalia Downtown» или «· Downtown»). Обязан идти после характеризационных тестов по каждому сайту отдельно.
- **G (тени)** — независим, в любой момент. Механический, но визуальный: диффы на 390/1280.
- **C (reducer букинга)** — самый крупный и рискованный, делать по одному. Предусловие снято: тесты на `bookingStepKeys` (12 кейсов) и `renderHook`-тест на `useBookingFilters` заведены 2026-07-22, seam для тестирования хуков появился. Валидировать всеми 7 booking-спеками.
- **E (форма `CartSlice`)** — последним: меняет персистируемую форму, нужна третья запись в `cartMigrations`.

### 5.5 Не трогать / отклонено

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
- **Считать `SearchBar.tsx`, `BottomMenu`, `OfferCircle`/`OfferInfo`, `components/layout/mobile-menu/` кандидатами на удаление** — они удерживаются намеренно. Любое удаление в этом отчёте (пп. 9, E, мёртвый CSS, `nav-menu.scss`, пакеты) — **предложение, требующее явного согласия**, а не самостоятельное действие.

### 5.6 Сверка с разделами 1–4 реестра

Агенты аудита работали, не зная про этот файл, — сверка сделана отдельно:

- **Не противоречит §1.** Корзина на Redux (§1) остаётся осознанным отклонением: пункт E меняет форму данных внутри слайса, а не слой. Клиентский гейт `/profile`, JSDoc-стиль, `LANG_CODE`, словарь на `system_content` — аудит подтвердил их как «не трогать».
- **Совпало с §2.** Находку «разорвать цепочку root-layout → OneEntry SDK» верификация отклонила по той же причине, по которой в §2 стоит 🟨 «не чинить». Находку «`import 'server-only'` во все обёртки `app/api/server/**`» отклонили как ломающую сборку ([logOutUser.ts](app/api/server/users/logOutUser.ts) помечен `'use client'`) — это развитие ⛔-пункта §2 про `updateUserState.ts`.
- **Хвост §3 «Типы SDK↔CMS» — закрыт наполовину.** Было «~15 кастов `.value as Array<>`»; оцифровано как 17 inline-кастов entity/list, 8 сайтов `salon_address` тремя идиомами, 5 кастов `master_salon`. Из них **закрыты 2026-07-22**: все касты entity-ссылок ушли в [entityLinks](app/utils/entityLinks.ts) (grep даёт 0), все чтения `salon_address`/`salon_phone` — в [salonFromPage](app/utils/salonFromPage.ts), вместе с несостоятельной идиомой `as string` без `| undefined`. **Единственная реальная crash-поверхность устранена**: `servicesArr?.map` не переживал `''`, который API отдаёт для пустого entity. Остаются касты среза `master` — блок A.
- **Хвост §3 «Юнит-покрытие SDK-слоя» не закрывается.** Находку «контрактный тест конверта серверных обёрток» верификация отклонила как преувеличенную; блок B сокращает 16 копий до одной, но тестов не добавляет. Хвост остаётся открытым.
- **Новое для §3 — остался один пункт.** На `/gallery` и `/masters` нет ни одного заголовка `h1`–`h6` (факт подтверждён; общий `PageHeader` при этом отклонён — заголовки надо ставить по месту). Остальные четыре находки этого пункта исправлены 2026-07-22: залипший спиннер `VerificationForm` (guard выходил до `try`; попутно выяснилось, что ветка сброса пароля требовала `password_reg`, который в этом потоке никто не пишет, — сброс был **полностью недостижим**), тихий no-op Save в `UserForm`, чужие `sameAs` в разметке для поисковиков, и потери в `sitemap.xml` (53 → 68 записей: добавлены `/offers`, `/reviews`, все `/salons/{handle}` и 15 подкатегорий услуг).
