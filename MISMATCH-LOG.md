# MISMATCH-LOG — аудит проекта на соответствие MCP `oneentry`

Реестр несоответствий кода правилам (`get-rule`) и рецептам (`get-skill`) OneEntry SDK.
Сформирован автоматизированным аудитом: по одному агенту-аудитору на каждое правило и скилл, с адверсариальной верификацией находок вторым агентом-скептиком.

- **Дата:** 2026-07-14
- **Область:** `app/`, `components/`, корневые конфиги. Исключены: `static-html/`, `.claude/`, `node_modules/`, `.next/`, `*.md`.
- **Измерений пройдено:** 22 правил + 20 скиллов = 42.
- **Находок всего:** 246. Верифицировано адверсариально: 55 (подтверждено/частично — **54**, опровергнуто — 1). Не успели верифицировать (прервано лимитом сессии): **191**.

### Легенда

| Метка | Значение |
|---|---|
| ✅ CONFIRMED | Агент-скептик подтвердил нарушение (проверил и правило, и код). |
| 🟡 PARTIAL | Суть верна, severity/строка/детали уточнены при проверке. |
| ⚠️ UNVERIFIED | Находка первого аудитора; адверсариальную проверку не прошла (обрыв по лимиту). Требует ручной проверки. |
| ⛔ REFUTED | Проверкой опровергнута — к исправлению не предлагается. |
| 🔧 deliberate | Осознанное отклонение проекта (задокументировано в CLAUDE.md/коде). |

## 1. Сводка по измерениям

| Измерение | Соотв. | Находок | ✅/🟡 | ⚠️ |
|---|:--:|:--:|:--:|:--:|
| `rule:attribute-sets` | ⚠️ | 5 | 5 | 0 |
| `rule:attribute-values` | ⚠️ | 8 | 8 | 0 |
| `rule:auth-provider` | ⚠️ | 10 | 10 | 0 |
| `rule:forms` | ⚠️ | 13 | 0 | 13 |
| `rule:jsdoc` | ⚠️ | 10 | 0 | 10 |
| `rule:linting` | ⚠️ | 7 | 7 | 0 |
| `rule:localization` | ⚠️ | 8 | 0 | 8 |
| `rule:mismatch-log` | ⚠️ | 3 | 0 | 3 |
| `rule:nextjs-pages` | ⚠️ | 8 | 7 | 0 |
| `rule:orders` | ⚠️ | 5 | 0 | 5 |
| `rule:performance` | ⚠️ | 10 | 0 | 10 |
| `rule:performance-bundle` | ⚠️ | 8 | 0 | 8 |
| `rule:performance-gsap` | ⚠️ | 5 | 0 | 5 |
| `rule:performance-images` | ⚠️ | 12 | 0 | 12 |
| `rule:performance-popups` | ⚠️ | 3 | 0 | 3 |
| `rule:performance-rtk` | ⚠️ | 7 | 0 | 7 |
| `rule:performance-streaming` | ⚠️ | 8 | 0 | 8 |
| `rule:playwright-e2e` | ⚠️ | 4 | 0 | 4 |
| `rule:product-statuses` | ⚠️ | 3 | 0 | 3 |
| `rule:server-actions` | ⚠️ | 7 | 2 | 5 |
| `rule:tokens` | ⚠️ | 6 | 6 | 0 |
| `rule:typescript` | ⚠️ | 9 | 9 | 0 |
| `skill:create-auth` | ⚠️ | 12 | 0 | 12 |
| `skill:create-cart-manager` | ⚠️ | 2 | 0 | 2 |
| `skill:create-checkout` | ⚠️ | 5 | 0 | 5 |
| `skill:create-content-filter` | ✅ | 0 | 0 | 0 |
| `skill:create-favorites` | ✅ | 0 | 0 | 0 |
| `skill:create-filter-panel` | ✅ | 0 | 0 | 0 |
| `skill:create-form` | ⚠️ | 9 | 0 | 9 |
| `skill:create-menu` | ⚠️ | 7 | 0 | 7 |
| `skill:create-orders-list` | ⚠️ | 6 | 0 | 6 |
| `skill:create-page` | ⚠️ | 4 | 0 | 4 |
| `skill:create-product-card` | ⚠️ | 10 | 0 | 10 |
| `skill:create-product-list` | ⚠️ | 6 | 0 | 6 |
| `skill:create-product-page` | ✅ | 0 | 0 | 0 |
| `skill:create-profile` | ⚠️ | 11 | 0 | 11 |
| `skill:create-reviews` | ✅ | 0 | 0 | 0 |
| `skill:create-search` | ⚠️ | 5 | 0 | 5 |
| `skill:create-server-action` | ⚠️ | 8 | 0 | 8 |
| `skill:create-subscription` | ✅ | 0 | 0 | 0 |
| `skill:create-subscription-events` | ✅ | 0 | 0 | 0 |
| `skill:setup-oneentry` | ⚠️ | 2 | 0 | 2 |

## 2. Подтверждённые нарушения (верифицированы)

Отсортировано по критичности. Каждый пункт прошёл независимую адверсариальную проверку.

### 2.1. [СЕРЬЁЗНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `app/booking/booking-data.ts:138`

*Измерение: `rule:attribute-values`*

> **Исправлено:** общий хелпер `plainTextFromTextAttr` в `components/utils.ts` (читает `value[0].plainValue`, при пустом — снимает теги с `htmlValue`); `bio` теперь `plainTextFromTextAttr(attrs.master_description?.value)`. `tsc` чист, визуально подтверждено на `/booking` → шаг «Choose a specialist»: bio мастеров отображается чистым текстом. Тот же хелпер закрывает 2.3.

**Суть:** master_description (тип text) читается как строка — реально массив [{htmlValue}], поэтому bio мастера в визарде бронирования всегда пустое

**Детали:** toBookingMaster: const description = attrs.master_description?.value (стр. 125); bio: typeof description === 'string' ? description : '' (стр. 138). Живая проверка админа id 13: value = [{htmlValue:'<p>Nail Specialist at Thalia Downtown…</p>', plainValue:'', mdValue:''}] — typeof никогда не 'string', bio = '' всегда. bio реально рендерится в карточке мастера визарда (components/layout/booking-page/components/MasterCard.tsx:107, 202). Корректный образец есть в том же репо: MasterDescription.tsx читает descArr?.[0]?.htmlValue.

**Рекомендация:** Читать master_description как массив text-значений: const arr = attrs.master_description?.value; const html = Array.isArray(arr) ? arr[0]?.htmlValue : arr?.htmlValue; и передавать очищенный текст (или plainValue) в bio.

> Проверка: Опровергнуть не удалось. (1) Правило attribute-values реально требует для text читать value.htmlValue/plainValue — value никогда не строка. (2) file:line точны: booking-data.ts:125 берёт attrs.master_description?.value сырым, :138 ставит bio через `typeof description === 'string' ? description : ''`. (3) Нормализации в другом месте нет: обёртка getAdminsInfo.tsx возвращает данные SDK как есть, других трансформаций между SDK и toBookingMaster нет. (4) Живая проверка публичным SDK: у всех мастеров (включая id 13) master_description.value — массив [{htmlValue:'<p>…</p>', mdValue:'', …}], typeof 'object' → bio всегда ''. (5) bio реально рендерится в UI визарда: MasterCard.tsx:107 и :202 ({m.bio} безусловно), карточка используется в SpecialistStep.tsx:231. Корректный образец чтения массива подтверждён в MasterDescription.tsx:20-22. Severity major адекватна: данные в CMS есть, но описание мастера в шаге выбора специалиста никогда не отображается (контентная регрессия без краша).

### 2.2. [СЕРЬЁЗНО] ✅ `app/gallery/[handle]/page.tsx:46`

*Измерение: `rule:nextjs-pages`*

**Суть:** Категорийный роут галереи /gallery/[handle] рендерит только локальные фото (getLocalGalleryItems), игнорируя CMS-галерею, хотя /gallery берёт контент из CMS (getCmsGalleryItems) с локальным фолбэком.

**Детали:** В GallerySingleLayout (строки 44–47) в Promise.all вызывается только getLocalGalleryItems(); getCmsGalleryItems не используется вовсе. При этом app/gallery/page.tsx (строки 31–37) сначала берёт фото из дерева CMS-галереи и падает на локальный скан лишь при пустой CMS. По документации проекта CMS-галерея уже наполнена (fill-gallery.mjs, страницы-фото с gallery_photos и master_id), поэтому диплинки /gallery/gallery-hair и т.д. показывают другой (локальный, захардкоженный) набор фотографий, чем /gallery — контент страницы не из CMS, вопреки правилу и JSDoc самого файла («renders the very same ported GalleryPageContent as /gallery»).

**Рекомендация:** В GallerySingleLayout использовать тот же источник, что и на /gallery: const [{ page, isError }, cmsItems] = await Promise.all([getPageByUrl(handle), getCmsGalleryItems()]); затем items = cmsItems.length > 0 ? cmsItems : await getLocalGalleryItems().

> Проверка: Правило nextjs-pages действительно содержит цитируемый пункт «DO NOT hardcode page content — ✅ CORRECT — content from CMS». Файл app/gallery/[handle]/page.tsx:46 подтверждён дословно: в Promise.all только getLocalGalleryItems(), getCmsGalleryItems не импортируется; JSDoc файла обещает «the very same ported GalleryPageContent as /gallery». При этом app/gallery/page.tsx:31–37 использует CMS-first с локальным фолбэком. Обработки в другом месте нет: GalleryPageContent не фетчит данные (рендерит проп items), другие обёртки не вмешиваются. Живая инспекция CMS (inspect-gallery.mjs) подтвердила: галерея наполнена (4 категории, 32 фото-страницы с gallery_photos и master_id), значит /gallery показывает CMS-фото, а /gallery/gallery-hair и т.п. — другой, захардкоженный локальный набор из public/. Git: [handle]-страница из 0.1.19, getCmsGalleryItems появился в 0.1.21–0.1.22 — миграция на CMS не дошла до категорийного роута (не намеренно). Severity major оправдана: роуты прегенерируются через generateStaticParams, имеют metadata и structured data, то есть публичны, хотя внутренних ссылок на них в UI не найдено. Рекомендация из находки корректна и повторяет паттерн главной страницы галереи.

### 2.3. [СЕРЬЁЗНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `app/services/catalog-data.ts:55`

*Измерение: `rule:attribute-values`*

> **Исправлено:** общий хелпер `plainTextFromTextAttr` вынесен в `components/utils.ts` (снимает теги с `htmlValue`, предпочитает `plainValue`) и переиспользован в `catalog-data.ts` (описания услуг) и `booking-data.ts` (bio мастера, см. 2.1). Локальный дубль `textAttrToPlain` удалён. `tsc` чист; визуально на `/services` описания услуг отображаются чистым текстом («Professional haircut: consultation, wash with premium products…»).

**Суть:** Атрибут description (тип text) читается как строковый примитив — реально это массив [{htmlValue, plainValue}], поэтому описания всех услуг на /services пусты

**Детали:** toServiceItem: const attrDescription = attrs.description?.value; typeof attrDescription === 'string' — проверка никогда не истинна: живая проверка (продукт id 235, страница haircut) показала value = [{htmlValue:'<p>…</p>', plainValue:'…', mdValue:''}]. Фолбэк product.localizeInfos?.plainValue у продуктов undefined (проверено). Итог: ServiceItem.description = '' для всех ~77 услуг — описания не показываются в ServiceCard (стр. 91–93) и не участвуют в поиске каталога (ServicesCatalog.tsx:94), хотя контент в CMS заполнен.

**Рекомендация:** Читать по правилу для типа text: const d = attrs.description?.value; плюс учесть фактическую массивную форму проекта: const obj = Array.isArray(d) ? d[0] : d; описание = obj?.plainValue || obj?.htmlValue (очищенный) || ''.

> Проверка: Правило attribute-values действительно требует для типа text читать value.htmlValue/value.plainValue («value is always an object with htmlValue, plainValue, mdValue»), а не строковый примитив. Живая проверка CMS (продукты 233/234/235 страницы haircut, набор service) подтвердила: description.type='text', value — массив [{htmlValue,plainValue}], контент заполнен; localizeInfos.plainValue у продуктов undefined. В app/services/catalog-data.ts:55 проверка typeof attrDescription === 'string' никогда не истинна, оба фолбэка проваливаются → description='' для всех услуг. Нормализации в другом месте нет: description формируется только в toServiceItem; ServiceCard.tsx:91-93 рендерит его напрямую (пустое — блок не рендерится), ServicesCatalog.tsx:94 использует в поиске (поиск по описанию не работает); затронут и booking-data.ts. file:line точны, severity major адекватна (контент CMS не отображается на всём каталоге, но страница не падает).

### 2.4. [СЕРЬЁЗНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `app/store/providers/AuthContext.tsx:119`

> **Исправлено:** `checkToken` теперь сбрасывает `refresh-token` только при подтверждённых 401/403 (читает `res.error.statusCode`), как соседний эффект и `rules/tokens.md`; транзиентные/сетевые ошибки токен сохраняют (`setIsAuth(false)` без удаления). Happy-path (`res.data.id` → `setUser`+`setIsAuth`) не изменён. tsc/eslint чисты, `/profile` рендерится без ошибок консоли.

*Измерение: `rule:tokens`*

**Суть:** checkToken удаляет refresh-токен из localStorage при ЛЮБОЙ ошибке getMe, а не только при подтверждённых 401/403

**Детали:** В checkToken (строки 115–130) условие `if ((res.isError && !res.isLoading) || !res.data?.id)` и ветка `.catch()` (строка 127) вызывают `localStorage.removeItem('refresh-token')` без проверки statusCode. Транзиентная сетевая ошибка или 5xx при загрузке страницы / сразу после логина безвозвратно стирает валидный refresh-токен — пользователь разлогинивается навсегда. Правильный эффект с фильтром 401/403 в этом же файле есть (строки 211–224), но он не срабатывает: checkToken к этому моменту уже стёр токен по любой ошибке. Это прямо противоречит правилу и собственному JSDoc эффекта («transient network errors must NOT clear the refresh token»).

**Рекомендация:** В checkToken перед `localStorage.removeItem('refresh-token')` проверять `(res.error as IError)?.statusCode === 401 || === 403` (конверт ошибки из getMe в RTKApi содержит statusCode). При прочих ошибках только не выставлять isAuth=true (или оставить текущее isAuth), не трогая storage — поллинг сам повторит запрос. Ветку `.catch()` тоже не должна чистить токен.

> Проверка: Правило tokens действительно требует чистить refresh-token только при подтверждённых 401/403 («Log Out Only on Confirmed 401/403», «Clearing Dead Token»: `if (isError(res) && (statusCode === 401 || 403)) clearTokens()`). Код нарушает это: в AuthContext.tsx checkToken (строки 115–130) условие `(res.isError && !res.isLoading) || !res.data?.id` (строка 118) вызывает `localStorage.removeItem('refresh-token')` (строка 119) при любой ошибке; ветка `.catch()` (строка 127) — аналогично. getMe в RTKApi.ts возвращает `{ error: result }` с доступным `statusCode` для любого envelope (включая 5xx), так что фильтр реализуем, но отсутствует. Корректный эффект с фильтром 401/403 (строки 211–224) защищает только polling-путь: при onInit/login/authenticate токен стирается в .then раньше, чем эффект отработает (его guard `if (!refresh) return` находит уже пустой storage). Обработки/нормализации в другом месте (RTKApi, app/api/server/**) нет. Сценарий реален: транзиентная сетевая ошибка или 5xx на загрузке страницы или сразу после логина безвозвратно разлогинивает пользователя, что противоречит правилу и JSDoc в этом же файле. File:line, детали и severity major точны. Мелкие оговорки, не меняющие вердикт: пример правила сам содержит `catch { clearTokens() }` (рекомендация находки про .catch чуть строже правила), а rulePaths правила формально не покрывают app/store/**, но файл явно ссылается на rules/tokens.md и реализует его паттерн.

### 2.5. [СЕРЬЁЗНО] ✅ `components/forms/ForgotPasswordForm.tsx:58`

*Измерение: `rule:auth-provider`*

**Суть:** Event-маркеры для generateCode/checkCode/changePassword захардкожены инлайн, не вынесены в константы и взаимно несогласованы

**Детали:** Флоу сброса пароля использует ТРИ разных угаданных event-маркера: ForgotPasswordForm.tsx:58 — generateCode(..., 'generate_otp'); VerificationForm.tsx:174 — resend через generateCode(..., 'generate_code') (другое событие, чем при первичной генерации!); VerificationForm.tsx:74 — checkCode(..., 'otp', ...); ResetPasswordForm.tsx:74 — changePassword(..., 'otp', ...). Ни один не вынесен в именованную константу и не сверен с разделом Events админки (Events.getAllEvents() с app-токеном вернул 401 — программно проверить нельзя, нужно смотреть админку). Если реальные маркеры отличаются или код, сгенерированный событием 'generate_otp', проверяется событием 'otp', весь флоу сброса пароля вернёт 400.

**Рекомендация:** Сверить маркеры событий в админке (раздел Events), вынести их в именованные константы с комментарием (EVENT_PASSWORD_RESET и т.п.) в одном модуле и использовать ОДИН и тот же event-маркер для первичной генерации кода и для resend в рамках одного флоу.

> Проверка: Правило auth-provider дословно требует заявленное: «DO NOT hardcode event markers without checking!» и «In code — always extract into named constants with a comment». Все четыре file:line подтверждены точно: ForgotPasswordForm.tsx:58 — 'generate_otp'; VerificationForm.tsx:174 — resend через 'generate_code'; VerificationForm.tsx:74 — checkCode с 'otp'; ResetPasswordForm.tsx:74 — changePassword с 'otp'. Три разных маркера в одном флоу, констант EVENT_*в проекте нет, обёрток/фолбэков в app/api/server, components/utils.ts и провайдерах нет — вызовы напрямую getApi().AuthProvider.*. Адверсариальная проверка усилила находку: публичный Events.getAllEvents() воспроизводимо возвращает 401, а внутренний admin API /api/admin/events (логин через masters-common.mjs) вернул {"total":0,"items":[]} — раздел Events в админке ПУСТ, т.е. ни один из захардкоженных маркеров не существует, и флоу сброса пароля гарантированно падает уже на generateCode. Severity major адекватна (сломан пользовательский флоу сброса пароля; основной login при этом работает). Скрипты проверки: .claude/temp/inspect-events-admin.mjs, inspect-events-admin2.mjs.

### 2.6. [СЕРЬЁЗНО] ✅ `components/forms/SignInForm.tsx:113`

*Измерение: `rule:auth-provider`*

**Суть:** Маркеры auth-провайдеров захардкожены ('email'/'phone') и не берутся из getAuthProviders(); вкладка 'phone' вызывает auth() у несуществующего провайдера

**Детали:** auth(tab, body) вызывается с tab из захардкоженного списка ['email','phone'] (строки 51, 157). Живая проверка getAuthProviders() показала: в админке есть только провайдеры 'email' и 'google' — провайдера 'phone' НЕТ, т.е. вход по вкладке Phone гарантированно падает. Вдобавок authData при вкладке 'phone' всё равно собирается из значений email_reg/password_reg (строки 107–112) — введённое в поле phone_reg значение вообще не отправляется. RTK-запрос useGetAuthProvidersQuery существует (app/api/api/RTKApi.ts:253), но нигде в компонентах не используется; formIdentifier 'reg' также захардкожен во всех auth-формах вместо provider.formIdentifier.

**Рекомендация:** Получать список провайдеров через useGetAuthProvidersQuery, рендерить вкладки только для реально активных провайдеров (identifier из API) и брать formIdentifier из ответа провайдера. Убрать вкладку 'phone' либо завести провайдер в админке. authData собирать из значений полей активного провайдера, а не всегда из email_reg/password_reg.

> Проверка: Правило auth-provider дословно содержит процитированное требование ("Do not guess markers ... getAuthProviders()"). Код подтверждён построчно: SignInForm.tsx:51 — useState('email'), :157 — захардкоженный список ['email','phone'], :113 — auth(tab, body), :107–112 — authData всегда из email_reg/password_reg (значение phone_reg не отправляется никогда). Живая проверка (inspect-auth-providers.mjs) показала ровно два активных провайдера: 'google' и 'email' — провайдера 'phone' нет (снимок CLAUDE.md "провайдеры []" устарел). useGetAuthProvidersQuery (RTKApi.ts:253) экспортируется, но не используется ни в одном компоненте; SignUpForm:211 и VerificationForm:102 тоже хардкодят 'email'; никакой нормализации/фолбэка в utils/api/server/AuthContext нет. Единственный микронюанс: на вкладке phone при пустом email_reg сабмит молча выходит на строке 94, не дойдя до auth() — т.е. вкладка либо тихо не работает, либо вызывает несуществующий провайдер; в любом сценарии вход по Phone неработоспособен, суть и severity (major — сломанная пользовательская вкладка логина при рабочем email-пути) точны.

### 2.7. [СЕРЬЁЗНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/forms/UserForm.tsx:96`

> **Исправлено:** `updateUser` вызывается со `state: user.state` вместо `{}` — состояние пользователя (корзина/избранное) больше не затирается. tsc/eslint чисты.

*Измерение: `rule:tokens`*

**Суть:** updateUser при сохранении профиля передаёт state: {} — затирает user.state (корзину) на сервере

**Детали:** onUpdateUserData (строки 82–97) вызывает `getApi().Users.updateUser({ …, state: {} })`. Правило требует спредить текущее состояние (`state: { ...user.state, cart, favorites }`), потому что updateUser перезаписывает state целиком. Эталонная реализация в этом же проекте (app/api/server/users/updateUserState.ts:53) делает это правильно: `state: { ...user.state, cart }`. В результате любое редактирование профиля пользователем молча стирает сохранённую на сервере корзину (и любые другие поля state).

**Рекомендация:** Передавать `state: { ...(user.state ?? {}) }` (пользователь уже есть в AuthContext) либо вовсе не включать поле state в payload, если SDK это допускает — по аналогии с updateUserState.ts, который свежим getUser() и спредом сохраняет параллельные изменения.

> Проверка: Правило tokens (раздел updateUserState) действительно требует спредить текущее состояние: эталон `state: { ...user.state, cart, favorites }`, т.к. updateUser перезаписывает state целиком. Код подтверждён точно по file:line — components/forms/UserForm.tsx:96 передаёт `state: {}` в Users.updateUser. Митигаций нет: refreshUser() после сохранения лишь перечитывает уже затёртого пользователя; единственный второй call-site updateUser в проекте (app/api/server/users/updateUserState.ts:53) делает спред правильно, и его JSDoc прямо документирует, что без спреда state clobber-ится — проект сам признаёт семантику полной перезаписи. user.state.cart реально консьюмится фронтом (AuthContext.tsx:180, механизм cartVersion). Единственный нюанс, не меняющий вердикт: пишущий путь корзины (useUpdateUserStateMutation, RTKApi.ts:445) пока не подключён в UI, поэтому потеря данных проявится, когда state заполнен (скриптами, e2e или после проводки синка) — латентный, но реальный data-loss дефект в рабочем профиль-флоу; severity major адекватна.

### 2.8. [СЕРЬЁЗНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/forms/UserForm.tsx:82`

> **Исправлено:** результат `updateUser` (`boolean | IError`) проверяется через guard `isError` (импорт `isError as isSdkError` из `@/app/api`); при ошибке показывается `Error {statusCode}` и ранний `return` — тост «Data saved!» и `refreshUser` только при успехе. tsc/eslint чисты.

*Измерение: `rule:server-actions`*

**Суть:** Результат Users.updateUser не проверяется через isError — тост «Data saved!» показывается даже при ошибке API.

**Детали:** Вызов getApi().Users.updateUser(...) на строке 82 не сохраняет результат; далее безусловно вызываются refreshUser(), setError('') и toast('Data saved!') (строки 101–105). Так как SDK возвращает IError значением, а не бросает, catch на строке 106 никогда не сработает для ошибок API (401, валидация) — пользователь получит ложное подтверждение сохранения профиля.

**Рекомендация:** const res = await getApi().Users.updateUser({...}); if (isError(res)) { setError(res.message); return; } — и только потом refreshUser() и toast.

> Проверка: Находка подтверждена по всем пунктам. (1) Правило server-actions действительно содержит цитату «Always check the result via isError(result)»; хотя пункт формально в секции «Mandatory (for Server Actions)», то же правило в примере для user-authorized методов (Users) из клиентских компонентов показывает обязательную проверку if (isError(user)) return. (2) file:line точны: components/forms/UserForm.tsx:82 — результат getApi().Users.updateUser(...) не сохраняется, далее безусловно refreshUser(), setError(''), toast('Data saved!') (строки 101–105). (3) Механика ошибки верна: в проекте defineOneEntry вызывается без errors.isShell, а дефолт isShell=true (node_modules/oneentry/dist/base/stateModule.js:43), при этом asyncModules.js при isShell=true ВОЗВРАЩАЕТ IError значением, а не бросает — catch на строке 106 для API-ошибок (401, валидация) не сработает, пользователь получит ложный тост об успехе, а setError('') ещё и сотрёт прежнюю ошибку. (4) Компенсирующей обработки нигде нет: refreshUser не влияет на тост; при этом собственный wrapper проекта app/api/server/users/updateUserState.ts:61 проверяет (res as IError)?.statusCode и res === true — корректный паттерн в кодовой базе есть, в UserForm.tsx он пропущен; JSDoc хелпера isError (app/api/api/api.ts:129) прямо требует «Use at every call site». Severity major адекватна: ложное подтверждение сохранения профиля — реальный user-facing баг, но без потери данных/безопасности.

### 2.9. [СЕРЬЁЗНО] ✅ `components/forms/VerificationForm.tsx:203`

*Измерение: `rule:auth-provider`*

**Суть:** Конфиг провайдера не читается: OTP-форма жёстко на 6 символов при systemCodeLength=8 в админке, у кнопки Resend нет кулдауна из config.systemCodeTlsSec

**Детали:** numInputs={6} (строка 203) и гейт отправки if (otp.length === 6) (строка 149) захардкожены, а живая проверка getAuthProviders() показала config.systemCodeLength: 8 у провайдера 'email' — пользователь физически не может ввести 8-значный код, верификация (сброс пароля через checkCode) не проходит. Кнопка Resend (строки 211–217) не дизейблится и не показывает каунтдаун — config.systemCodeTlsSec (фактически 120 с) вообще не запрашивается через getAuthProviderByMarker, код можно спамить без ограничений.

**Рекомендация:** Получать конфиг провайдера через getAuthProviderByMarker('email'): numInputs и гейт длины — из config.systemCodeLength; для Resend реализовать кулдаун config.systemCodeTlsSec с дизейблом кнопки и каунтдауном, стартующим после signUp()/generateCode() и после каждого resend.

> Проверка: Все ключевые утверждения находки подтверждены. (1) Первоисточник: правило auth-provider дословно содержит цитату — «Cooldown: config.systemCodeTlsSec seconds (get from getAuthProviderByMarker)… The button is disabled during the cooldown, showing a countdown», кулдаун стартует после signUp() и каждого resend. (2) Код: в components/forms/VerificationForm.tsx numInputs={6} на строке 203 и гейт if (otp.length === 6) на строке 149 — точны; кнопка Resend (строки 211–217) не имеет ни disabled, ни каунтдауна. Grep по всему проекту: systemCodeLength/systemCodeTlsSec/getAuthProviderByMarker нигде не читаются (getAuthProviders есть только в RTKApi.ts, config никем не потребляется) — обработки/фолбэка в другом месте нет. (3) Живая проверка админки (inspect-скрипт, getAuthProviders + getAuthProviderByMarker): провайдер email активен, config.systemCodeLength=8, systemCodeTlsSec=120 — цифры находки точны. Форма реально используется живым флоу сброса пароля (ForgotPasswordForm → generateCode → VerificationForm(action='checkCode') → checkCode): 8-символьный код физически не вводится в 6 ячеек, сброс пароля сломан полностью — severity major оправдана. Единственный нюанс, не влияющий на вердикт: у провайдера isCheckCode=false, поэтому ветка активации (activateUser) на практике недостижима (SignUpForm при res.isActive логинит сразу), но находка и не опирается на активацию — она указывает именно на checkCode/сброс пароля; кроме того, раздел правила про кулдаун формально помечен «MANDATORY when isCheckCode: true», однако требование к поведению кнопки Resend (дизейбл+каунтдаун из config) очевидно применимо к любому resend, а кнопка в форме есть и активно используется.

### 2.10. [СЕРЬЁЗНО] ✅ `components/forms/VerificationForm.tsx:138`

*Измерение: `rule:linting`*

**Суть:** Подавление react-hooks/exhaustive-deps скрывает реальный stale-closure: handleVerification навсегда захватывает начальное значение otp

**Детали:** handleVerification (useCallback, строки 60–139) читает otp, action, login, setComponent, router, setOpen, но deps — только [fields.email_reg, fields.password_reg]; недостающие зависимости подавлены eslint-disable без пояснения. Цепочка бага: otp — локальный useState (строка 40), OtpInput onChange={setOtp} (строка 202); fields приходит из Redux-слайса FormFieldsSlice, где addField (immer) мутирует только один ключ (app/store/reducers/FormFieldsSlice.ts:78) — ссылки fields.email_reg/password_reg стабильны при наборе OTP, поэтому мемоизированный handleVerification никогда не пересоздаётся и в замыкании остаётся otp с первого рендера (пустая строка). onSubmitHandle проверяет свежий otp.length === 6, но вызывает устаревший handleVerification — в checkCode/activateUser уходит пустой/устаревший код. Это ровно тот случай, который правило приводит как ❌-пример.

**Рекомендация:** Убрать eslint-disable и добавить в deps все используемые значения: otp, action, login, setComponent, router, setOpen (или читать otp из аргумента: handleVerification(otp)). После фикса прогнать e2e-сценарий активации (тестовый юзер <claude.test1@example.com>).

> Проверка: Правило linting дословно содержит цитируемый пункт react-hooks/exhaustive-deps с ❌-примером именно этого паттерна. Код по file:line подтверждён: eslint-disable на строке 138, deps только [fields.email_reg, fields.password_reg] (строка 139), при том что handleVerification читает otp/action/login/setComponent/router/setOpen. Stale-closure реален: эмпирический прогон реального редьюсера FormFieldsSlice через RTK проекта показал, что после dispatch addField({otp_code}) ссылки fields.email_reg/password_reg НЕ меняются (immer structural sharing) — deps никогда не обновляются, handleVerification навсегда держит otp='' с первого рендера. Смягчений нигде нет: Redux otp_code читается только в ResetPasswordForm (не в checkCode/activateUser), модалка не ремонтирует форму (key нет), onSubmitHandle проверяет свежий otp, но вызывает устаревший колбэк. В API всегда уходит пустой код — активация и reset-верификация функционально сломаны. Severity major точна (сломанная фича, не безопасность/данные). Единственная микронеточность — текст правила упоминает useEffect, а тут useCallback, но ESLint-правило exhaustive-deps покрывает оба хука, сути не меняет.

### 2.11. [СЕРЬЁЗНО] ✅ `components/forms/inputs/FormInput.tsx:54`

*Измерение: `rule:auth-provider`*

**Суть:** Обязательность поля определяется по validators.requiredValidator.strict вместо isSignUpRequired, а тип input — по имени маркера вместо флагов

**Детали:** required = validators['requiredValidator']?.strict || false (строка 54) — правило прямо запрещает определять обязательность при регистрации через requiredValidator. Реальный эффект: у поля name_reg в CMS isSignUpRequired: true, но validators: [] (проверено по API) — поле рендерится необязательным, и регистрация уходит без обязательного поля (SignUpForm фильтрует пустые значения из formData). Дополнительно тип input определяется в первую очередь по подстроке в маркере — marker.indexOf('password')/indexOf('email') (строки 38–44), флаги isPassword/isLogin/isNotification* не проверяются вовсе, хотя по правилу маркер — только последний фолбэк.

**Рекомендация:** Пробрасывать в FormInput флаги поля и вычислять required как f.isSignUpRequired === true (в signup-режиме) / isLogin|isPassword (в signin); тип input определять по флагам (isPassword → password, isNotificationEmail|isLogin → email, isNotificationPhone* → tel) и лишь при отсутствии флагов падать на эвристику по маркеру.

> Проверка: Правило auth-provider действительно дословно требует определять обязательность при регистрации по isSignUpRequired === true («this flag specifically, not validators.requiredValidator.strict»), а тип input — по флагам (isPassword→password, isNotificationEmail/isLogin→email, isNotificationPhone*→tel) с маркером лишь как последним фолбэком. Код FormInput.tsx нарушает оба пункта: строка 54 — required = validators['requiredValidator']?.strict || false; строки 38–44 — тип по подстроке маркера ('password'/'email') и затем field.type, флаги не читаются нигде в файле. Компенсации в других местах нет: SignUpForm передаёт поле как есть ({...field}), getFormAttributes только нормализует массив/объект, canSubmit опирается на valid, который в FormInput захардкожен true. Живой API подтверждает эффект: у name_reg isSignUpRequired: true при пустых validators ({}) — поле рендерится необязательным, пустое значение отфильтровывается из formData, и signUp уходит без обязательного при регистрации поля. Единственная неточность находки — validators указаны как [], фактически {} (тривиально). file:line, механизм, эффект и severity (major — реальный дефект флоу регистрации на текущих данных CMS) подтверждены.

### 2.12. [СЕРЬЁЗНО] ✅ `components/layout/booking-page/useBookingSubmit.ts:37`

*Измерение: `rule:attribute-values`*

**Суть:** Интервал записи (type: 'timeInterval') строится в локальном времени клиента, а профиль форматирует его по UTC — забронированное время отображается со сдвигом на таймзону (в Дубае −4 часа)

**Детали:** toInterval создаёт new Date(y, m, d, hh, mm) — локальное время браузера. При отправке createOrder значение сериализуется в UTC-ISO: слот «10:00», выбранный в Дубае (UTC+4), уходит как 06:00Z. OrderDateTime.tsx (стр. 26–30) по правилу форматирует из getUTCHours()/getUTCMinutes() — пользователь видит в профиле 06:00 вместо выбранных 10:00; та же смещённая дата/время видна и в заказах CMS. Обёртка value: [interval] (стр. 126) соответствует требуемой форме [[start, end]], но правило требует UTC-семантику слотов по всей цепочке.

**Рекомендация:** Строить интервал в UTC: new Date(Date.UTC(y, m, d, hh, mm)) (и конец аналогично), тогда «10:00» уйдёт как 10:00Z и getUTCHours() в OrderDateTime вернёт то, что выбрал пользователь.

> Проверка: Находка подтверждается по всем пунктам. (1) Правило attribute-values действительно требует UTC-семантику по всей цепочке timeInterval: фильтрация слотов по UTC, «Time formatting — from UTC hours!» (getUTCHours/getUTCMinutes) и отправка выбранного слота как value: [[startISO, endISO]] — цитата ruleQuote дословная. (2) Код по file:line точен: useBookingSubmit.ts:37 — `const start = new Date(y, m, d, hh, mm)` строит Date в локальной таймзоне браузера ('use client'-хук), конец интервала — от start.getTime(). Слоты берутся не из CMS-UTC-интервалов, а из хардкода TIMES ('09:00'…'20:00', constants.ts) — «настенное» время салона. При сериализации в createOrder Date уходит как UTC-ISO со сдвигом на офсет клиента: «10:00» в Дубае (UTC+4) → 06:00Z. (3) Чтение подтверждено: OrderDateTime.tsx стр. 26–30 форматирует именно через getUTCMonth/getUTCDate/getUTCHours/getUTCMinutes — пользователь увидит 06:00 и, при переходе через полночь UTC, смещённую дату. (4) Нормализации/фолбэка нигде нет: grep по Date.UTC/getTimezoneOffset/toISOString не находит обработки в booking/orders-цепочке; серверных обёрток для createOrder нет; форма value: [interval] = [[start,end]] соответствует правилу — расходится только таймзонная семантика. Оговорка, не меняющая вердикт: по контент-плану у формы `order` поля пока не заведены (attributes = {}), так что до заведения поля `interval` баг может не проявляться визуально, но код-нарушение правила реально и проявится для всех клиентов вне UTC (вся целевая аудитория — Дубай). Severity major адекватна: запись создаётся, но время в профиле и в CMS сдвинуто на −4 часа.

### 2.13. [СЕРЬЁЗНО] ✅ `components/layout/booking-page/useBookingSubmit.ts:134`

*Измерение: `rule:typescript`*

**Суть:** Тело createOrder приводится через 'as unknown as Parameters<...>[1]' в обход SDK-типа IOrderData, а форма formData (строка 107) вручную дублирует IOrdersFormData.

**Детали:** Локальный тип '{ marker: string; type: string; value: unknown }[]' (строка 107) — точная копия экспортируемого SDK-типа IOrdersFormData из 'oneentry/dist/orders/ordersInterfaces'. Само тело запроса '{ formIdentifier, paymentAccountIdentifier, products, formData }' полностью совпадает с IOrderData (проверено по node_modules/oneentry/dist/orders/ordersInterfaces.d.ts, оба типа экспортируются), поэтому двойной каст 'as unknown as' не нужен и полностью отключает проверку типов всего тела заказа: опечатка в имени поля или неверная структура products компилируется молча. Документирующего комментария о конфликте типа SDK и API (как требует исключение правила) нет.

**Рекомендация:** Импортировать 'import type { IOrderData, IOrdersFormData } from "oneentry/dist/orders/ordersInterfaces"', объявить 'const formData: IOrdersFormData[] = []', типизировать тело как IOrderData и убрать каст 'as unknown as Parameters<...>[1]'. Если после этого tsc выявит реальный конфликт — задокументировать его комментарием по образцу из правила (Omit + пояснение).

> Проверка: Все утверждения находки подтверждены первоисточниками. (1) Правило "typescript" действительно содержит секцию «Do not duplicate SDK types as flat DTOs» (распространяется на любые SDK-сущности), требует использовать типы SDK и документировать комментарием конфликт SDK-типа с API. (2) useBookingSubmit.ts:107 — локальный тип `{ marker: string; type: string; value: unknown }[]` посимвольно дублирует экспортируемый IOrdersFormData (ordersInterfaces.d.ts:259-263). (3) Строки 134-136 — двойной каст `as unknown as Parameters<...>[1]` (= IOrderData), отключающий проверку всего тела заказа. (4) Эмпирическая проверка: временно убрал каст и прогнал `npx tsc --noEmit` — вывод байт-в-байт совпадает с бейслайном (только посторонние ошибки в сгенерированных .next/dev/types), т.е. тело без каста типизируется как IOrderData без единой ошибки — конфликта SDK/API нет, каст не нужен, документирующего комментария нет. (5) Соседний вызов того же метода (app/api/hooks/useCreateOrder.ts:93) передаёт тело без каста — обработки/обхода в другом месте не существует. Severity major адекватна: каст полностью гасит типобезопасность платёжного/букингового payload (опечатка в имени поля скомпилируется молча). Файл восстановлен в исходное состояние.

### 2.14. [СЕРЬЁЗНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/layout/contacts-page/ContactFormCard.tsx:119`

> **Исправлено:** результат `postFormsData` (`IPostFormResponse | IError`) проверяется через guard `isError`; при ошибке — `setError` и ранний `return`, экран «Message sent!» показывается только при успехе. tsc/eslint чисты. (Ветка активна после заполнения полей формы `contact_us` в CMS.)

*Измерение: `rule:server-actions`*

**Суть:** Результат FormData.postFormsData не проверяется через isError — при ошибке API показывается экран успеха «sent».

**Детали:** SDK возвращает ошибку значением IError (statusCode >= 400), а не исключением (подтверждено по node_modules/oneentry/dist/base/asyncModules.js). Вызов postFormsData на строке 119 обёрнут только в try/catch; на строке 128 безусловно выполняется setSent(true) и очистка полей. Если API вернул IError (валидация, недоступность), пользователь видит подтверждение отправки, хотя сообщение не отправлено.

**Рекомендация:** Сохранить результат вызова в переменную, проверить `if (isError(res)) { setError(res.message); return; }` перед setSent(true) — по образцу useBookingSubmit.ts:138.

> Проверка: Находка подтверждена по всем пунктам. (1) Правило server-actions действительно требует «Always check the result via isError(result)», а FormData.postFormsData прямо указан в таблице методов; клиентские примеры правила тоже проверяют isError. (2) SDK не бросает исключение при ошибке API: isShell по умолчанию true (node_modules/oneentry/dist/base/stateModule.js:43), конфиг defineOneEntry в app/api/api/api.ts errors не задаёт, а browserResponse (asyncModules.js:342-353) при isShell=true ВОЗВРАЩАЕТ IError значением и для HTTP-ошибок, и для сетевых сбоев — try/catch в компоненте для SDK-ошибок мёртв. (3) ContactFormCard.tsx:119 отбрасывает результат postFormsData, строка 128 безусловно ставит setSent(true) и чистит поля — при ошибке API пользователь видит «Message sent!», сообщение теряется молча. (4) Обработки в другом месте нет: вызов идёт напрямую через getApi(), минуя серверные обёртки; собственный паттерн проекта (useBookingSubmit.ts:138 — isError(createdOrder)) и экспорт isError из @/app/api делают рекомендацию напрямую применимой. Единственная оговорка: сейчас у формы contact_us нет полей ({}), поэтому ветка с API-вызовом пока не выполняется — дефект латентный, но это штатный продакшн-путь после заполнения формы по контент-плану, поэтому severity major справедлива. file:line точны.

### 2.15. [СЕРЬЁЗНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/layout/offers-page/parseOfferDetail.ts:63`

> **Исправлено (общий фикс офферов, покрывает 2.15/2.16/2.38–2.42):** реальные маркеры набора `offer` подтверждены инспекцией CMS (`offer_description`, `offer_sale`, `offer_price`, `offer_type`, `offer_services`, `offer_sku`, `offer_time`, `offer_image`). `parseOfferDetail.ts` переписан по образцу рабочего `parseOffer.ts`: `offer_description` (string), `offer_services` (title верхнего уровня, `parentId` из `value.parentId`), `offer_sale`/`offer_price` через `Number()` (real приходит строкой), `offer_image` (значение — объект `{downloadLink}`, обрабатываются обе формы), `offer_time` (строка). Акцент-цвет — per-category fallback. Также: `parseOffer.ts` tagline → `offer_description`; мёртвые `PriceCell`/`ServicesCell`/`OfferInfo` переведены на префиксные маркеры. `tsc` чист. Визуально `/offers`: описания, состав услуг, цена 700 / зачёркнутая 830, скидки −16/−17%, 4 фото из CMS через next/image, длительность «2 hours»; клик «Book Offer» переходит в `/booking` (`firstServiceParentId`=88 «manicure» резолвится — кнопка больше не no-op).

*Измерение: `rule:attribute-sets`*

**Суть:** Парсер карточки оффера на /offers читает выдуманные маркеры (services, sale, image, duration, description), которых нет в наборе атрибутов 'offer' — данные CMS молча теряются, кнопка Book не работает.

**Детали:** Проверено по живой CMS (AttributesSets.getAttributesByMarker('offer') и Products.getProductById(310)): реальные маркеры набора — offer_description, offer_sale, offer_price, offer_type, offer_services, offer_sku, offer_time, offer_image. Код же читает: 'description' (строка 58), 'services' (63), 'sale' (71), 'image' (84), 'duration' (91) — все пять возвращают undefined. Эффект на живой странице /offers (используется через OfferDetailCard.tsx:60 ← app/offers/page.tsx:88): список услуг оффера всегда пуст; зачёркнутая цена и бейдж скидки никогда не показываются (хотя offer_price=300 заполнен); фото всегда мок-баннер (offer_image игнорируется); плашка длительности скрыта (offer_time игнорируется). Критичнее всего: firstServiceParentId всегда 0 → useGetPageByIdQuery({id:0}) не находит страницу → handleBook в OfferDetailCard.tsx:71 молча выходит — кнопка Book на странице офферов мертва. Дополнительно неверна форма entity-значения: parentId лежит вложенно в value.parentId (см. эталонный parseOffer.ts:106), а код ждёт его на верхнем уровне элемента массива. Соседний parseOffer.ts (home offers-feed) читает те же данные правильно (offer_services/offer_sale/offer_price + value.parentId) — parseOfferDetail — его устаревший близнец.

**Рекомендация:** Переписать parseOfferDetail.ts по образцу components/layout/home/offers-feed/components/parseOffer.ts: offer_description, offer_services (title верхнего уровня, parentId из value.parentId), offer_sale/offer_price для цены и скидки, offer_image для фото, offer_time для длительности. Затем визуально проверить /offers и клик по Book.

> Проверка: Опровергнуть не удалось — находка подтверждена по всем пунктам. (1) Правило attribute-sets реально содержит цитату про marker и требование не угадывать маркеры (глоссарий MCP: "DO NOT guess markers — always obtain them via /inspect-api or the API"). (2) Живая CMS (Products.getProductById(310) + AttributesSets.getAttributesByMarker('offer')) подтверждает: реальные маркеры — offer_description/offer_sale/offer_price/offer_type/offer_services/offer_sku/offer_time/offer_image; легаси-маркеров description/services/sale/image/duration в attributeValues нет (все `in`-проверки false), при этом offer_price="300", offer_image (jpeg) и offer_time="2 hours" заполнены — данные молча теряются. (3) parseOfferDetail.ts:58/63/71/84/91 читает именно выдуманные маркеры; нормализации нигде нет (getProductsByPageUrl отдаёт сырые SDK-сущности, utils/провайдеры офферы не трогают). (4) Форма entity подтверждена: parentId лежит в value.parentId (=88), код ждёт его на верхнем уровне → firstServiceParentId=0 → RTKApi getPageById возвращает {error:null} при !id → service undefined → handleBook (OfferDetailCard.tsx:71) молча выходит — кнопка Book на /offers мертва; страница реально использует этот путь (app/offers/page.tsx:88 → OfferDetailCard.tsx:60). (5) Эталонный parseOffer.ts читает те же данные правильно — рекомендация валидна. Строка 63 и severity major точны (страница не падает, но контент деградирован и главный CTA неработоспособен).

### 2.16. [СЕРЬЁЗНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/layout/offers-page/parseOfferDetail.ts:63`

> Исправлено вместе с 2.15 (см. общий фикс офферов выше).

*Измерение: `rule:attribute-values`*

**Суть:** Страница /offers читает угаданные маркеры (services, sale, image, duration, description), которых нет у продуктов набора offer — реальные данные CMS (offer_services, offer_price, offer_image, offer_time, offer_description) не отображаются

**Детали:** Живая проверка API (продукты id 310–313, набор offer) показала реальные маркеры: offer_description, offer_sale, offer_price, offer_type, offer_services, offer_sku, offer_time, offer_image. parseOfferDetail читает несуществующие: attributeValues?.services (стр. 63) — список услуг оффера всегда пуст; attributeValues?.sale (стр. 71) — зачёркнутая цена и скидка никогда не показываются; attributeValues?.image (стр. 84) — вместо загруженного в CMS offer_image всегда рендерится мок-баннер; attributeValues?.duration (стр. 91) — плашка длительности скрыта (реальный маркер offer_time = «2 hours»); attributeValues?.description (стр. 58) — падает на localizeInfos.plainValue, который у продуктов undefined, т.е. описание пусто (реальный маркер offer_description заполнен). Дополнительно нарушена форма entity-значения: firstServiceParentId = servicesArr?.[0]?.parentId (стр. 110) — parentId лежит в value.parentId ({title, value:{id, parentId}}), а не на верхнем уровне. Также offer_image приходит ОБЪЕКТОМ (проверено), а код ожидает только Array<{downloadLink}>.

**Рекомендация:** Переписать parseOfferDetail на реальные маркеры: offer_services (услуги, entity — заголовок в entry.title, parentId в entry.value.parentId), offer_sale/offer_price (текущая/исходная цена, значения-строки — оборачивать в Number()), offer_image (обрабатывать обе формы: const img = Array.isArray(raw) ? raw[0] : raw; img?.downloadLink), offer_time (строка «2 hours»), offer_description. Ориентир — уже корректный parseOffer.ts из home/offers-feed.

> Проверка: Правило attribute-values действительно требует не угадывать маркеры и проверять форму image (object|array) — цитата дословная. Все file:line подтверждены в parseOfferDetail.ts (description:58, services:63, sale:71, image:84, duration:91, parentId:110). Нормализации в другом месте нет: app/offers/page.tsx → getProductsByPageUrl → parseOfferDetail напрямую. Живой прогон API тем же методом (4 продукта 310–313, набор offer): угаданных маркеров services/sale/image/duration/description нет ни у одного; реальные offer_* заполнены; localizeInfos.plainValue=undefined (описание пусто); offer_services[0].parentId лежит в value.parentId (top-level undefined → firstServiceParentId=0); offer_image — ОБЪЕКТ, не массив; offer_time="2 hours". Эталон parseOffer.ts из home читает маркеры верно. Severity major точна: страница не падает (фолбэки), но почти весь CMS-контент офферов не рендерится + сломан id категории для корзины.

### 2.17. [СЕРЬЁЗНО] 🟡 🔧 `components/shared/Image.tsx:1`

*Измерение: `rule:linting`*

**Суть:** Системный обход @next/next/no-img-element: 16 вхождений <img> в 11 файлах через eslint-disable

**Детали:** Правило запрещает <img> в пользу next/image. В проекте next/image используется в 17 файлах, а в 11 других запрет подавлен: блочные disable в components/shared/Image.tsx:1 (кастомная обёртка с LQIP-blur, рендерит два сырых <img>), home-cta-banner/index.tsx:1 (строки 20, 26 — крупные баннеры из public/images), SalonPhotoGallery.tsx:3, SalonLightbox.tsx:3, GalleryLightbox.tsx:3; построчные — GalleryGrid.tsx:31 (лента галереи на главной), SpecialistsGrid.tsx:33 (мастера на главной), Avatar.tsx:31, PortfolioLightbox.tsx:127/164, PortfolioGallery.tsx:50. Для PhotoSwipe-лайтбоксов сырые <img> практически необходимы (нужны натуральные размеры), но баннеры и сетки главной страницы теряют оптимизацию next/image (srcset, AVIF/WebP, ленивая подгрузка с resize) при полностью настроенном next.config.ts images (remotePatterns **.oneentry.cloud, formats avif/webp) — реальный эффект на трафик и LCP главной. Решение выглядит осознанным архитектурным выбором (собственная обёртка Image с LQIP), но в списке задокументированных отклонений проекта его нет.

**Рекомендация:** Для статичных баннеров (home-cta-banner) и сеток главной (GalleryGrid, SpecialistsGrid, Avatar) перейти на next/image (домены CMS уже в remotePatterns). Подавления оставить только там, где <img> технически необходим (PhotoSwipe-лайтбоксы, LQIP-подложка), и снабдить каждое комментарием-обоснованием. Либо задокументировать кастомный Image-компонент как осознанное отклонение проекта.

> Проверка: Правило подтверждено дословно: rule "linting" содержит «@next/next/no-img-element — <img> is prohibited, use next/image». Факты проверены: (1) все 11 указанных file:line-якорей точны (Image.tsx:1, home-cta-banner:1 с <img> на 20/26, SalonPhotoGallery.tsx:3, SalonLightbox.tsx:3, GalleryLightbox.tsx:3, GalleryGrid.tsx:31, SpecialistsGrid.tsx:33, Avatar.tsx:31, PortfolioLightbox.tsx:127/164, PortfolioGallery.tsx:50); (2) next/image действительно используется ровно в 17 файлах; (3) next.config.ts images полностью настроен (remotePatterns **.oneentry.cloud, formats avif/webp); (4) компенсации нигде нет — обёртка components/shared/Image.tsx сама рендерит два сырых <img> (LQIP + основное) без srcset/оптимизации, баннеры home-cta-banner (public/images/baners/*.png) грузятся оба (mobile+desktop скрываются CSS) и даже без loading="lazy", сетки GalleryGrid/SpecialistsGrid — lazy, но без srcset/форматов; (5) в CLAUDE.md отклонение не задокументировано. Единственная неточность — счёт файлов: <img> встречается 16 раз в 10 файлах, а не в 11 (11 — это число eslint-disable-комментариев: 5 блочных + 6 построчных; PortfolioLightbox содержит два). Совпадения в utils.ts/README.md/loading.tsx — комментарии/доки, не элементы. Суть, severity и рекомендация верны.

### 2.18. [СЕРЬЁЗНО] ✅ `eslint.config.mjs:121`

*Измерение: `rule:linting`*

**Суть:** В проекте нет .prettierrc — standalone Prettier не проходит ни на одном файле, prettier-plugin-tailwindcss не активирован

**Детали:** Правило требует наличия .prettierrc с настройками (singleQuote, trailingComma all, plugins: prettier-plugin-tailwindcss) и чтобы код проходил Prettier «без необходимости автоформатирования». Конфига Prettier нет нигде (ни .prettierrc, ни prettier.config.*, ни ключа prettier в package.json) — настройки живут только внутри ESLint-правила prettier/prettier (eslint.config.mjs:121–127, причём только singleQuote и endOfLine). Проверено: npx prettier --check app/api/index.ts app/layout.tsx components/utils.ts — все три файла FAIL (Prettier по умолчанию требует двойные кавычки). Любой запуск prettier --write или format-on-save в IDE переформатирует код вразрез с ESLint. prettier-plugin-tailwindcss установлен в devDependencies, но без конфига не подключён — канонический порядок Tailwind-классов Prettier'ом не проверяется (пример непойманного нарушения порядка: components/layout/home/home-cta-banner/index.tsx:16 — «py-4 xl:py-10 md:py-6», md-вариант после xl).

**Рекомендация:** Создать .prettierrc с настройками из правила: { "singleQuote": true, "endOfLine": "auto", "trailingComma": "all", "tabWidth": 2, "semi": true, "plugins": ["prettier-plugin-tailwindcss"] } — тогда инлайн-опции prettier/prettier в eslint.config.mjs можно убрать (eslint-plugin-prettier сам подхватит конфиг). После добавления прогнать prettier --check по app/ и components/ и поправить порядок классов.

> Проверка: Правило linting подтверждено первоисточником: оно требует читать eslint.config.mjs И .prettierrc, приводит обязательные настройки .prettierrc (singleQuote, endOfLine auto, trailingComma all, tabWidth 2, semi, plugins: prettier-plugin-tailwindcss) и требует прохождения Prettier «without errors, warnings, and without the need for auto-formatting» (цитата ruleQuote совпадает дословно). Факты проверены: (1) конфига Prettier нет нигде — Glob по .prettierrc*/prettier.config.* пуст, ключа prettier в package.json нет, npx prettier --find-config-path app/layout.tsx → «Can not find configure file»; (2) eslint.config.mjs:121–127 — prettier/prettier только с singleQuote и endOfLine, строка 121 точна; (3) npx prettier --check app/api/index.ts app/layout.tsx components/utils.ts → все три FAIL (exit 1); (4) prettier-plugin-tailwindcss есть в devDependencies (^0.8.0), но в Prettier 3 плагины не автоподключаются — порядок классов не проверяется, живой пример подтверждён: components/layout/home/home-cta-banner/index.tsx:16 «py-4 xl:py-10 md:py-6» (md после xl). Контраргумент «форматирование частично покрыто через eslint-plugin-prettier» не опровергает находку: standalone prettier --write/format-on-save переформатирует код в двойные кавычки вразрез с ESLint, а требование правила о .prettierrc и каноническом порядке Tailwind-классов не выполнено. Severity major адекватна: нарушение системное (все файлы проекта не проходят Prettier), создаёт реальный риск конфликта инструментов.

### 2.19. [НЕЗНАЧИТЕЛЬНО] ✅ `app/api/api/api.ts:113`

*Измерение: `rule:tokens`*

**Суть:** reDefine не передаёт auth.providerMarker — сохранённый authProviderMarker нигде не читается

**Детали:** Правило: проактивный refresh строит URL `/marker/{providerMarker}/users/refresh` именно из `auth.providerMarker` (дефолт SDK — 'email'), и маркер провайдера обязателен к сохранению при логине ради этого. Проект сохраняет 'authProviderMarker' в localStorage (AuthContext.tsx:172), но ни reDefine (api.ts:106–118), ни clearSession не читают его и не передают в конфиг defineOneEntry. SignInForm позволяет логин через вкладку 'phone' (tab передаётся как authProviderMarker) — восстановление такой сессии после перезагрузки пойдёт на /marker/email/users/refresh с чужим токеном → 400 → разлогин. Сейчас реально используется только email-провайдер, видимого эффекта нет.

**Рекомендация:** В onInit (AuthContext) читать `localStorage.getItem('authProviderMarker')` и передавать его в reDefine; в reDefine добавить `auth.providerMarker` в конфиг defineOneEntry (с фолбэком 'email').

> Проверка: Все утверждения находки подтверждены первоисточниками. (1) Правило "tokens" действительно содержит цитируемый текст: proactive refresh строит URL /marker/{providerMarker}/users/refresh из auth.providerMarker (дефолт 'email'), маркер «mandatory to save at login». (2) SDK в node_modules это подтверждает: stateModule.js:39 — дефолт 'email' из config.auth.providerMarker; asyncModules.js:154–157 — URL refresh собирается из state.providerMarker. (3) reDefine (api.ts:106–118, конфиг auth на строке 113) передаёт только saveFunction+refreshToken, providerMarker отсутствует; clearSession — тоже (но ему и не нужен: без refreshToken проактивный refresh не срабатывает). (4) Грепом по проекту: 'authProviderMarker' пишется в AuthContext.tsx:172, удаляется в logOutUser.ts:31 — и НИГДЕ не читается; onInit вызывает reDefine(refresh) без маркера. Компенсации в utils.ts / app/api/server / провайдерах нет. (5) SignInForm.tsx:123 реально передаёт tab ('email'|'phone') как authProviderMarker — сценарий отказа при восстановлении phone-сессии корректен. Severity minor точна: баг латентный — фактически используется только email (auth-провайдеры в админке пусты, phone-логин и так шлёт email_reg/password_reg). Контраргумент «пример reDefine в самом правиле тоже не передаёт providerMarker» не опровергает: правило прямо объясняет, что маркер обязателен к сохранению именно потому, что из него строится refresh-URL — сохранение без чтения лишает требование смысла.

### 2.20. [НЕЗНАЧИТЕЛЬНО] ✅ `app/api/api/api.ts:26`

*Измерение: `rule:tokens`*

**Суть:** saveFunction обращается к localStorage без guard `typeof window !== 'undefined'`

**Детали:** Канонический saveFunction в правиле обёрнут в проверку `typeof window !== 'undefined'`. Модуль api.ts исполняется и на сервере (его импортируют все обёртки app/api/server/**), и инстанс defineOneEntry создаётся на сервере тоже. Сегодня saveFunction фактически вызывается только на клиенте (refresh срабатывает лишь при auth.refreshToken, который ставится только клиентским reDefine/syncTokens), поэтому видимого эффекта нет. Но любой будущий серверный код, вызвавший авторизованный метод после ротации токена, упадёт с ReferenceError: localStorage is not defined. Та же проблема у logOutUser.ts (строки 15, 30–31): файл лежит в app/api/server/, но использует localStorage — работает только потому, что вызывается исключительно из клиентских компонентов.

**Рекомендация:** Добавить в saveFunction guard `if (typeof window === 'undefined') return;`. Для logOutUser — как минимум JSDoc-пометка client-only (или перенос из каталога server/), чтобы его случайно не вызвали из Server Action.

> Проверка: Правило tokens дословно содержит канонический saveFunction с guard'ом `typeof window !== 'undefined'` (цитата в находке точна; clearTokens в правиле — тоже с guard'ом). В app/api/api/api.ts:26 localStorage.setItem вызывается без guard'а (есть только `if (!refreshToken)`); saveFunction передаётся в defineOneEntry в трёх местах без какой-либо обёртки — обработки в другом месте нет. Модуль реально исполняется на сервере (обёртки app/api/server/** импортируют getApi; ни в одном файле server/ нет 'use server' — это shared-модули), инстанс SDK создаётся при module eval и на сервере. Оценка «сегодня эффекта нет» верна: reDefine/syncTokens вызываются только из клиентского AuthContext.tsx, серверный singleton никогда не получает refreshToken, поэтому единственный триггер saveFunction (успешный /refresh) на сервере не срабатывает — риск латентный, что соответствует severity minor. Детали по logOutUser.ts тоже подтверждены: строки 15, 30–31 используют localStorage, файл в app/api/server/, импортируется только клиентскими LogoutMenuItem.tsx и SignOutButton.tsx. Контраргумент про rulePaths правила (app/actions/**, components/** не покрывают api.ts) не опровергает: это триггеры подгрузки правила, а канонический saveFunction в самом правиле определён в lib/oneentry.ts — аналоге этого файла.

### 2.21. [НЕЗНАЧИТЕЛЬНО] ✅ `app/api/server/attributes/getSingleAttributeByMarkerSet.ts:28`

*Измерение: `rule:attribute-sets`*

**Суть:** Обёртка передаёт аргументы в SDK в обратном порядке (attributeMarker, setMarker) — любой вызов уйдёт на несуществующий эндпоинт.

**Детали:** Правило и реальная реализация SDK определяют сигнатуру getSingleAttributeByMarkerSet(setMarker, attributeMarker, langCode) — проверено в node_modules/oneentry/dist/attribute-sets/attributeSetsApi.js:80, где строится URL `/${setMarker}/attributes/${attributeMarker}`. Обёртка проекта (строки 28-31) вызывает getApi().AttributesSets.getSingleAttributeByMarkerSet(attributeMarker, setMarker) — маркеры перепутаны местами, запрос уйдёт на `/{attributeMarker}/attributes/{setMarker}` и вернёт ошибку. Причина понятна: интерфейсный d.ts самого SDK (attributeSetsInterfaces.d.ts:28) декларирует обратный порядок — тот же класс ненадёжности типизации, о котором правило предупреждает для getAttributesByMarker. Видимого эффекта сейчас нет: функция экспортируется из app/api/index.ts:33, но нигде в app/ и components/ не вызывается.

**Рекомендация:** Поменять аргументы местами: getApi().AttributesSets.getSingleAttributeByMarkerSet(setMarker, attributeMarker). При первом реальном использовании проверить ответ инспекционным скриптом.

> Проверка: Правило attribute-sets явно задаёт сигнатуру getSingleAttributeByMarkerSet(setMarker, attrMarker) (в двух местах). Рантайм SDK подтверждён: attributeSetsApi.js:80 — async getSingleAttributeByMarkerSet(setMarker, attributeMarker, ...) с URL `/${setMarker}/attributes/${attributeMarker}`; корректный порядок задекларирован и в attributeSetsApi.d.ts:56. Обёртка d:\OneEntry\oneentry-next-beauty-v2\app\api\server\attributes\getSingleAttributeByMarkerSet.ts:28-31 передаёт (attributeMarker, setMarker) — порядок обратный, запрос уйдёт на /{attributeMarker}/attributes/{setMarker} и вернёт ошибку. Источник путаницы — attributeSetsInterfaces.d.ts:28, где порядок перепутан (совпадает с details находки). Компенсации нет: обёртка принимает именованные пропсы, так что вызывающий код не может исправить перестановку; grep по app/ и components/ показывает, что функция только экспортируется из app/api/index.ts:33 и нигде не вызывается — никакой нормализации/фолбэка в utils/провайдерах не существует. Severity minor адекватна (мёртвый экспорт, эффекта на рантайм сейчас нет), file:line точны.

### 2.22. [НЕЗНАЧИТЕЛЬНО] ✅ 🔧 `app/contacts/page.tsx:119`

*Измерение: `rule:nextjs-pages`*

**Суть:** Ряд UI-текстов и данных секций захардкожен в page-файлах без чтения из CMS/словаря: «Get in Touch», подзаголовок героя, статистика «Daily 10:00–22:00» и др.

**Детали:** Примеры в файлах правила (app/**/page.tsx): contacts:119 — заголовок секции «Get in Touch» (SectionHeading), contacts:98 — подзаголовок «… · Always happy to see you», contacts:104–108 — статистика ['Daily','10:00–22:00'], ['Dubai','UAE']; offers:70 — «Back to Home», offers:100–101 — «Good to know» и offerTermsData из components/data; booking:41 — «Premium beauty experience»; services:46 — «locations across Dubai»; salons/[handle]:62 — about/highlights из локального salonContent.ts. Заголовки h1 при этом везде берутся из CMS (page.localizeInfos.title) — нарушение касается вторичных текстов. Это соответствует задокументированному переходному состоянию портирования: components/data.js описан в CLAUDE.md как «временные захардкоженные данные до переноса в CMS», атрибут salon_time заведён в CMS, но кодом пока не читается, а у словарных UI-текстов проект требует лишь английские фолбэки.

**Рекомендация:** По мере наполнения CMS переносить эти тексты в system_content (getDictionary с английскими фолбэками) и атрибуты страниц (например, часы работы — из salon_time), начиная с повторяющихся текстов (часы «10:00–22:00» встречаются и в contacts, и в OpeningHours).

> Проверка: Правило nextjs-pages действительно содержит раздел «DO NOT hardcode page content» (цитата в находке точная), и его paths покрывают app/**/page.tsx. Все file:line подтверждены дословно: contacts:119 «Get in Touch», contacts:98 «Always happy to see you», contacts:105–107 stats ['Daily','10:00–22:00']/['Dubai','UAE']; offers:70 «Back to Home», offers:101 «Good to know» + offerTermsData из components/data.js; booking:41 «Premium beauty experience»; services:46 «locations across Dubai»; salons/[handle]:62 SALON_CONTENT из локального salonContent.ts. Обработки в другом месте нет: getDictionary() вызывается, но ни одна из этих строк из словаря не читается — «Get in Touch» существует только как JSX-литерал, паттерн dict?.x?.value || '…' для них отсутствует. Утверждение находки, что h1 везде из CMS и нарушение касается только вторичных текстов, тоже подтверждено. Severity minor корректна: нарушение буквы правила реально, но это задокументированное переходное состояние проекта (components/data.js — «временные данные до переноса в CMS», salon_time заведён, но не читается), что находка честно отражает (deliberate: true).

### 2.23. [НЕЗНАЧИТЕЛЬНО] ✅ `app/masters/page.tsx:46`

*Измерение: `rule:attribute-values`*

**Суть:** fileUrl предпочитает previewLink вместо downloadLink и обращается к link.default[1] без учёта defaultPreview и без защиты — риск LQIP вместо фото и TypeError при не-default пресете

**Детали:** fileUrl (стр. 40–47, идентичный дубль в app/booking/booking-data.ts:36–43): const link = first?.previewLink ?? first?.downloadLink; return link.default[1] ?? link.default[0]. По правилу previewLink — объект пресетов {[preset]: [base64-LQIP, previewURL]}, не рендер-URL (downloadLink — единственный URL для отображения; собственная документация проекта в components/utils.ts:249–257 говорит то же: второй элемент — ~16px LQIP, «not a display-ready thumbnail»). Сейчас у master_image админов previewLink отсутствует (проверено, admin id 13) — работает ветка downloadLink, видимого эффекта нет. Но при появлении previewLink фото мастеров деградируют до 16px-превью, а при пресете, отличном от 'default', link.default[1] бросит TypeError (обращение к undefined). Третья копия хелпера в components/layout/home/masters-feed/index.tsx:31 защищена (link.default?.[1]), что подчёркивает рассинхрон.

**Рекомендация:** Возвращать first?.downloadLink как рендер-URL (previewLink использовать только для blurDataURL через пресет img?.defaultPreview || 'default' с optional chaining), либо переиспользовать getGalleryImageUrls из components/utils.ts. Синхронизировать все три копии fileUrl.

> Проверка: Находка подтверждена по всем пунктам. (1) Правило attribute-values действительно требует заявленного: previewLink — объект пресетов {[preset]: [base64-LQIP, previewURL]}, пресет надо брать из img?.defaultPreview || 'default', а в связанном правиле performance-images (процитировано в футере attribute-values) — «downloadLink goes into <Image src>»; previewLink предназначен только для blurDataURL/превью. Цитата в находке точна. (2) Код по file:line подтверждается: app/masters/page.tsx:43 — `first?.previewLink ?? first?.downloadLink` (previewLink предпочтён), строка 46 — `link.default[1] ?? link.default[0]` без учёта defaultPreview и без optional chaining на `.default` → TypeError при пресете, отличном от 'default' (это серверный компонент — упадёт вся страница /masters). Идентичный незащищённый дубль в app/booking/booking-data.ts:36–43; третья копия в components/layout/home/masters-feed/index.tsx:31 защищена (`link.default?.[1]`) — рассинхрон реален. (3) Собственная документация проекта (components/utils.ts:249–256 и getGalleryImageUrls:274–285) прямо говорит: второй элемент пары — ~16px LQIP, «the full downloadLink is the only rendering URL» — т.е. в проекте уже есть правильный нормализатор, который эти два хелпера не используют. (4) Фактическое состояние CMS перепроверено живым скриптом (.claude/temp/inspect-master-image-preview.mjs): у всех 32 мастеров master_image содержит только строковый downloadLink, previewLink отсутствует (0/32) — сейчас работает строковая ветка, видимого эффекта нет, баг латентный. Обработки/фолбэка в другом месте нет: fileUrl — терминальная точка извлечения URL, дальше photo идёт как готовая строка. Severity minor адекватна латентному дефекту с потенциальным TypeError/деградацией фото при появлении previewLink у новых загрузок (utils.ts фиксирует, что новые загрузки в проекте его уже имеют).

### 2.24. [НЕЗНАЧИТЕЛЬНО] ✅ `app/page.tsx:139`

*Измерение: `rule:nextjs-pages`*

**Суть:** При ошибке загрузки страницы 'home' главная рендерит отладочную строку «isError» вместо notFound() или дизайн-фолбэка.

**Детали:** IndexPageLayout: if (isError || !page) { return <>isError</>; } — посетитель при недоступной CMS увидит на главной голый текст «isError». Правило предписывает паттерн isError → notFound(); осознанное отклонение проекта разрешает тихую деградацию (фолбэк/пустая секция) вместо notFound только для отсутствующих блоков/списков — но здесь отсутствует сама страница, и рендер отладочной строки не является ни notFound(), ни допустимым фолбэком. Для сравнения: root layout (app/layout.tsx:137–162) в аналогичной ситуации рендерит осмысленный экран «Site temporarily unavailable».

**Рекомендация:** Заменить <>isError</> на notFound() либо на осмысленный фолбэк-экран в духе root layout (например, «Something went wrong»).

> Проверка: Правило nextjs-pages действительно предписывает `if (isError(page)) notFound();` (цитата точная). В app/page.tsx:138-140 при `isError || !page` рендерится отладочная строка `<>isError</>` — строка 139 подтверждена. Обёртка getPageByUrl (app/api/server/pages/getPageByUrl.ts) только нормализует ответ, фолбэка не добавляет. Root layout (app/layout.tsx:137-162) перекрывает лишь сценарий падения собственного запроса меню («Site temporarily unavailable»); если меню отдаётся, а страница 'home' отсутствует/скрыта, посетитель реально увидит голый текст «isError» — сценарий достижим. Осознанное отклонение проекта (деградация вместо notFound) распространяется только на блоки/списки, не на саму страницу, и отладочная строка не является допустимым фолбэком. Severity minor адекватна: только ошибочный путь, но на главной странице.

### 2.25. [НЕЗНАЧИТЕЛЬНО] ✅ `app/profile/page.tsx:16`

*Измерение: `rule:nextjs-pages`*

**Суть:** Три независимых фетча профиля (getDictionary, getPageByUrl('profile'), getAdminsInfo) выполняются последовательно вместо Promise.all.

**Детали:** Строки 16–23: await getDictionary() → await getPageByUrl('profile') → await getAdminsInfo(...). Все три запроса независимы, но сериализованы — три последовательных round-trip'а на каждый рендер /profile. Все остальные страницы проекта (home, services, contacts, masters, offers, booking и т.д.) корректно используют Promise.all — profile единственная страница, выбивающаяся из паттерна правила.

**Рекомендация:** Объединить: const [dictData, pageResult, adminsResult] = await Promise.all([getDictionary(), getPageByUrl('profile'), getAdminsInfo({ body: [], offset: 0, limit: 100 })]);

> Проверка: Правило nextjs-pages действительно предписывает Promise.all для независимых запросов («Parallel requests — faster» + ссылка на performance.md «Promise.all for independent fetches») — цитата в находке точна. Файл app/profile/page.tsx, строки 16–23: три последовательных await (getDictionary → getPageByUrl('profile') → getAdminsInfo), между ними нет зависимостей по данным и нет условных ранних выходов — сериализация ничем не оправдана. Обёртки getPageByUrl/getAdminsInfo — тонкие, без кэша; единственная поправка — getDictionary идёт через in-process Map-кэш (getCachedData), поэтому «три round-trip'а на каждый рендер» — лёгкое преувеличение (на прогретом процессе словарь — cache hit, остаются 2 последовательных round-trip'а; на холодном старте/dev — все 3). Это не меняет сути и severity. Утверждение «все остальные страницы используют Promise.all» подтверждено grep'ом (home, booking, contacts, offers, gallery, services, masters, salons/[handle], [handle] и др.) — profile единственное исключение. Severity minor адекватна, рекомендация применима (ServerProvider('dict', …) спокойно оборачивает первый элемент деструктуризации).

### 2.26. [НЕЗНАЧИТЕЛЬНО] ✅ 🔧 `app/reviews/page.tsx:32`

*Измерение: `rule:nextjs-pages`*

**Суть:** Тело страницы /reviews целиком рендерится из локального мока (components/layout/reviews-page/data.ts), контент CMS-страницы 'reviews' в теле не используется (только в generateMetadata).

**Детали:** ReviewsPageLayout не вызывает getPageByUrl для тела страницы: заголовок «Reviews» захардкожен в components/layout/reviews-page/index.tsx:135, отзывы — из локального массива REVIEWS (data.ts). Это нарушает «DO NOT hardcode page content», но соответствует задокументированному состоянию проекта: блок reviews_carousel в CMS создан, но пуст (без атрибутов/слайдов), и отзывы фронта осознанно держатся на моке до наполнения CMS.

**Рекомендация:** После наполнения reviews_carousel/страницы reviews в CMS перевести заголовок на page.localizeInfos?.title и отзывы на данные CMS; до тех пор — оставить как задокументированное переходное состояние.

> Проверка: Правило nextjs-pages действительно содержит секцию «DO NOT hardcode page content» (пример: хардкод <h1> запрещён, нужен page.localizeInfos?.title) — цитата точна. Код подтверждается полностью: app/reviews/page.tsx:32 рендерит тело только из <ReviewsPageContent/>, getPageByUrl('reviews') используется лишь в generateMetadata (строка 47); заголовок «Reviews» захардкожен в components/layout/reviews-page/index.tsx:135; отзывы берутся из локального мока components/layout/reviews-page/data.ts (REVIEWS/REVIEW_SALONS/MASTER_SALON/MASTER_CAT). Никакой обработки/фолбэка на CMS в другом месте нет (grep по app/ — ноль CMS-источников для тела /reviews). Состояние осознанное и задокументированное (JSDoc страницы, шапка data.ts, CLAUDE.md: reviews_carousel пуст), поэтому deliberate:true и severity minor корректны. Формальное нарушение правила реально — CONFIRMED.

### 2.27. [НЕЗНАЧИТЕЛЬНО] ✅ `app/services/[handle]/page.tsx:75`

*Измерение: `rule:nextjs-pages`*

**Суть:** В JSON-LD structured data страницы категории услуг безусловно захардкожено имя провайдера 'OneEntry Beauty' вместо имени сайта из CMS.

**Детали:** structuredData.provider.name = 'OneEntry Beauty' — это не фолбэк (нет обращения к словарю), а безусловный хардкод, при том что root layout (app/layout.tsx:71–74) берёт имя сайта из system_content (site_name → «Thalia Beauty Studio»). В результате поисковики получают в разметке Service неверное имя организации, расходящееся с Organization-разметкой из layout.

**Рекомендация:** Читать имя из словаря с фолбэком, как в layout: (dict?.site_name?.value as string) || 'Thalia Beauty Studio' — dict на этой странице уже загружается в том же Promise.all.

> Проверка: Находка подтверждается по всем пунктам. (1) Правило nextjs-pages действительно содержит секцию «DO NOT hardcode page content» — цитата точна. (2) app/services/[handle]/page.tsx:75 — точное совпадение: structuredData.provider.name = 'OneEntry Beauty' захардкожен безусловно (не фолбэк — обращения к словарю нет вообще), при этом dict уже загружается на этой странице в том же Promise.all (строка 38). (3) Утверждение про layout верно: app/layout.tsx:71–74 (getSiteName) читает dict?.site_name?.value с фолбэком 'Thalia Beauty Studio', и Organization JSON-LD в layout использует это имя — расхождение Service↔Organization реально. (4) Нормализации в другом месте нет: grep показывает, что в app/page.tsx 'OneEntry Beauty' используется как фолбэк после чтения CMS, а здесь — единственный безусловный хардкод. (5) Severity minor адекватна (SEO-несоответствие, не функциональный баг), рекомендация корректна и дешёва в реализации.

### 2.28. [НЕЗНАЧИТЕЛЬНО] ✅ `app/services/catalog-data.ts:27`

*Измерение: `rule:typescript`*

**Суть:** attributeValues продукта перетипизируется как Record<string, { value?: unknown } | undefined> — прямой ❌-пример из правила (дубль IAttributeValues).

**Детали:** Строки 27–30: 'const attrs = (product.attributeValues ?? {}) as Record<string, { value?: unknown } | undefined>'. Правило приводит ровно этот паттерн как запрещённый: SDK уже описывает эту структуру типом IAttributeValues (Record<string, IAttributeValue>, где value: unknown). Локальная копия теряет поля type/position/additionalFields и не увидит изменений SDK. Дальнейшие точечные чтения (attrs.price?.value и проверки typeof) корректны и остались бы такими же с SDK-типом.

**Рекомендация:** Заменить на 'import type { IAttributeValues } from "oneentry/dist/base/utils"; const attrs: IAttributeValues = product.attributeValues ?? {};' — остальной код (attrs.price?.value и typeof-проверки) не изменится.

> Проверка: 1) Правило "typescript" (раздел «The rule applies to any SDK entity») дословно содержит этот ❌-пример: `const attrs = (product.attributeValues || {}) as Record<string, { value?: unknown; type?: string }>` с ✅-заменой на `IAttributeValues` из `oneentry/dist/base/utils` — ruleQuote находки точен. 2) Код d:\OneEntry\oneentry-next-beauty-v2\app\services\catalog-data.ts:27–30 делает ровно это: `const attrs = (product.attributeValues ?? {}) as Record<string, { value?: unknown } | undefined>`. 3) SDK: `IProductsEntity.attributeValues: IAttributeValues` (productsInterfaces.d.ts:505), `IAttributeValues = Record<string, IAttributeValue>`, `IAttributeValue.value: unknown` (base/utils.d.ts:212–226) — рекомендация находки компилируется без изменений остального кода: при `noUncheckedIndexedAccess` `attrs.price` даёт `IAttributeValue | undefined`, `attrs.price?.value` — `unknown`, typeof-проверки работают. 4) Исключение правила «narrowing unknown at the access point» не применимо: ретипизируется весь Record (дубль SDK-типа), а не одно значение. Нормализации/обёрток в другом месте нет. Severity minor корректна — функционального бага нет, чисто нарушение типизации.

### 2.29. [НЕЗНАЧИТЕЛЬНО] ✅ `components/forms/ResetPasswordForm.tsx:17`

*Измерение: `rule:auth-provider`*

**Суть:** Поля формы сброса пароля захардкожены (resetPasswordFormFields с marker 'password_reg'/'password_confirm') вместо загрузки через getFormByMarker

**Детали:** Массив resetPasswordFormFields (строки 17–34) статически описывает поля с маркерами password_reg и password_confirm — правило прямо запрещает хардкодить input с name="password_reg". В CMS-форме reg реально есть поля password_reg (isPassword: true) и repeat_password — при переименовании маркера в админке форма сброса молча сломается. Кроме того, в changePassword передаётся password_confirm.value седьмым аргументом (строка 78), собранный из захардкоженного поля.

**Рекомендация:** Загрузить форму через useGetFormByMarkerQuery({ marker: 'reg' }) (в компоненте уже есть этот паттерн в соседних формах), взять поле с isPassword === true и существующее поле repeat_password из CMS, рендерить их динамически через FormInput.

> Проверка: Правило auth-provider реально содержит дословно процитированный запрет («NEVER hardcode <input name="password_reg">. Always load fields via getFormByMarker») в разделе MANDATORY PATTERN. Файл components/forms/ResetPasswordForm.tsx:17-34 действительно хардкодит массив resetPasswordFormFields с маркерами password_reg/password_confirm и рендерит их через FormInput — строка 17 точна. Обработки/фолбэка в другом месте нет: это единственная форма в проекте, не использующая useGetFormByMarkerQuery (SignIn/SignUp/ForgotPassword/UserForm/ContactUs — все грузят поля из CMS). Захардкоженный password_confirm даже не совпадает с реальным CMS-полем repeat_password, а лейблы захардкожены по-английски вместо localizeInfos из CMS. 7-й аргумент changePassword (repeatPassword) — легитимный опциональный параметр SDK, факт передачи из захардкоженного поля указан верно. Единственная мелкая неточность в details: при переименовании именно password_reg в админке сами поля пароля не сломаются (они локально самосогласованы через Redux), но сценарий тихой поломки реален через захардкоженные Redux-ключи email_reg/otp_code (строки 44/62), которые заполняет CMS-загружаемая ForgotPasswordForm — тот же класс проблемы. Severity minor корректна: форма сейчас работает, нарушение — соответствие обязательному паттерну правила и потеря локализации/валидаторов CMS.

### 2.30. [НЕЗНАЧИТЕЛЬНО] ✅ `components/forms/SignInForm.tsx:173`

*Измерение: `rule:auth-provider`*

**Суть:** Поля для signin фильтруются по имени маркера (`${tab}_reg`/'password_reg'), а не по флагам isLogin/isPassword; authData не фильтрует пустые значения

**Детали:** Рендер полей (строки 171–179) отбирает их по строковому совпадению маркера, а authData (строки 107–112) собирается из захардкоженных маркеров email_reg/password_reg без .filter по непустому значению — FormInput при монтировании кладёт в Redux записи с value: '' и valid: true (хардкод), так что проверка if (!email_reg || !password_reg) пустые строки не отсекает (реально спасает только HTML required от requiredValidator). Для вкладки email маркеры сейчас совпадают с флагами в CMS (email_reg isLogin, password_reg isPassword), поэтому видимого эффекта нет; для 'phone' поле phone_reg — профильное (оба флага false) и по правилу для signin не нужно вовсе.

**Рекомендация:** Отбирать поля для signin по a.isLogin === true || a.isPassword === true (как в образце правила), authData строить из этих же полей и фильтровать пустые значения перед отправкой.

> Проверка: Правило auth-provider дословно требует отбирать поля для signin по флагам isLogin/isPassword ("filter by flags, NOT by marker name") и фильтровать пустые значения в authData ("only { marker, value }, filter out empty"; "empty string → 400"). Код нарушает оба пункта: SignInForm.tsx:172-175 фильтрует по строковым маркерам `${tab}_reg`/'password_reg'; строки 107-112 собирают authData из захардкоженных email_reg/password_reg без фильтра пустых. Подтверждено, что FormInput.tsx (строки 32, 35, 61-70) при монтировании кладёт в Redux value:'' с хардкодом valid:true, поэтому guard на строке 94 пустые значения не отсекает — спасает только HTML required (requiredValidator у email_reg/password_reg в CMS есть). Компенсации в другом месте нет: getFormAttributes лишь нормализует массив/объект, флаговая маршрутизация есть только в SignUpForm. Детали про CMS тоже верны (email_reg isLogin, password_reg isPassword, phone_reg без флагов; провайдер phone не включён — активны google+email), что подтверждает severity minor: видимого эффекта на вкладке email нет, а вкладка phone нерабочая независимо от этого. file:line точны.

### 2.31. [НЕЗНАЧИТЕЛЬНО] ✅ `components/forms/SignUpForm.tsx:99`

*Измерение: `rule:auth-provider`*

**Суть:** Видимость полей регистрации не учитывает isSignUpRequired — override только по isSignUp

**Детали:** isPureNotification вычисляется как isNotif && !isLoginCredential(f) && f.isSignUp !== true — по правилу должно быть ещё && f.isSignUpRequired !== true, а видимость — !isPureNotification(f) || f.isSignUp === true || f.isSignUpRequired === true. Тип FormField (строки 33–40) вообще не объявляет isSignUpRequired, и грепом флаг в кодовой базе не встречается. Сейчас в форме reg нет notification-поля с isSignUpRequired: true (email_notification_reg имеет оба флага false и корректно скрыто), поэтому видимого эффекта нет, но обязательное при регистрации notification-поле (пример из правила — phone_reg с isNotificationPhonePush + isSignUpRequired) будет ошибочно скрыто.

**Рекомендация:** Добавить isSignUpRequired в тип FormField и в условие: поле показывается, если оно не pure-notification ЛИБО f.isSignUp === true ЛИБО f.isSignUpRequired === true; в isPureNotification добавить f.isSignUpRequired !== true.

> Проверка: Правило auth-provider (секция «Field visibility by modes» и эталонный isPureNotification) дословно требует учитывать isSignUpRequired: видимость = !isPureNotification(f) || f.isSignUp === true || f.isSignUpRequired === true, а в isPureNotification — f.isSignUpRequired !== true; ruleQuote подтверждена дословно. Код SignUpForm.tsx:99 содержит ровно `isNotif && !isLoginCredential(f) && f.isSignUp !== true;` — условия по isSignUpRequired нет; тип FormField (строки 33–40) флаг не объявляет, базовый IAttributes — тоже (только isSignUp). Греп по проекту: isSignUpRequired нигде в коде не обрабатывается (только упоминание в ONEENTRY-CONTENT-PLAN.md); getFormAttributes — чистый нормализатор, видимость решается только в visibleFields этой формы, фолбэков нет. Живая проверка CMS (inspect-reg-form.mjs): ни одно поле reg не сочетает notification-флаг с isSignUpRequired=1 (email_notification_reg: notifEmail=1, signUpReq=0 — корректно скрыто), т.е. эффект латентный — что находка сама указывает. Severity minor и file:line точны.

### 2.32. [НЕЗНАЧИТЕЛЬНО] ✅ `components/forms/SignUpForm.tsx:33`

*Измерение: `rule:typescript`*

**Суть:** Локальный тип FormField = IAttributes & { isLogin?, isSignUp?, isPassword?, isNotification*? } вручную дублирует флаги, уже типизированные в SDK-типе IFormAttribute.

**Детали:** SDK-тип IFormAttribute ('oneentry/dist/forms/formsInterfaces') уже содержит все эти поля как обязательные boolean (isLogin, isSignUp, isPassword, isNotificationEmail, isNotificationPhonePush, isNotificationPhoneSMS) плюс initialValue и типизированные additionalFields. Локальный тип объявляет их как 'boolean | null' — типы молча расходятся с SDK; при добавлении/переименовании флага в SDK локальная копия не заметит изменения. Это ровно тот случай, о котором правило говорит: соблазн написать trimmed-subset — сигнал импортировать SDK-тип.

**Рекомендация:** Удалить локальный FormField, импортировать 'import type { IFormAttribute } from "oneentry/dist/forms/formsInterfaces"' и использовать getFormAttributes<IFormAttribute>(data); хелперы isPasswordField/isLoginCredential/isConfirmPasswordField перевести на IFormAttribute.

> Проверка: Правило typescript подтверждено первоисточником: таблица типов предписывает IFormAttribute для полей формы (form.attributes[]) — «has flags isLogin, isSignUp, isNotification*, initialValue, and typed additionalFields» (ruleQuote совпадает дословно), а раздел «Do not duplicate SDK types as flat DTOs» прямо запрещает локальные trimmed-типы: «Import IFoo». file:line подтверждён — SignUpForm.tsx:33 объявляет FormField = IAttributes & {6 флагов как boolean | null} и использует его в getFormAttributes<FormField>(data). SDK-тип IFormAttribute (node_modules/oneentry/dist/forms/formsInterfaces.d.ts) содержит все 6 флагов как обязательные boolean + initialValue + типизированные additionalFields, и именно он — фактический тип данных (useGetFormByMarkerQuery → IFormsEntity.attributes: IFormAttribute[]). Обработки/нормализации типов в другом месте нет: getFormAttributes (components/utils.ts) — лишь каст массива, IFormAttribute в проекте не импортируется нигде. Исключение правила («форма truly diverges from SDK») не применимо: локальный тип не добавляет ни одного фронтового флага — все 6 есть в SDK. Мелкие нюансы не меняют сути: базовый IAttributes сам уже содержит 5 из 6 флагов (boolean?), так что «| null» в пересечении для них фактически стирается, дублирование двойное; фикс чуть сложнее рекомендации (FormInput типизирован через IAttributes, additionalFields/listTitles/validators у IFormAttribute структурно другие — прямой spread потребует правки FormInput). Severity minor точна: чисто типовая/поддерживаемостная проблема без runtime-бага.

### 2.33. [НЕЗНАЧИТЕЛЬНО] ✅ `components/forms/SignUpForm.tsx:44`

*Измерение: `rule:linting`*

**Суть:** Единственные живые предупреждения ESLint в области аудита: jsdoc/require-param и jsdoc/require-returns

**Детали:** npx eslint app components даёт 2 warning: JSDoc-блок на строках 44–49 (документация isConfirmPasswordField, строки 50–51) не содержит @param "f" и @returns. Правило требует прохождения ESLint «без ошибок и предупреждений» — это единственное место в app/ и components/, где линтер сейчас не чист.

**Рекомендация:** Дополнить JSDoc-блок: @param {FormField} f — проверяемое поле формы; @returns {boolean} — признак confirm-password-поля (по образцу соседних хелперов isPasswordField/isLoginCredential выше).

> Проверка: Правило "linting" дословно требует прохождения ESLint «without errors, warnings, and without the need for auto-formatting» — цитата в находке точна. Запуск `npx eslint app components` воспроизводит ровно 2 warning (0 errors), оба на components/forms/SignUpForm.tsx:44:1 — jsdoc/require-param (Missing @param "f") и jsdoc/require-returns; это единственные предупреждения в области аудита. JSDoc-блок строк 44–49 документирует isConfirmPasswordField (50–51) без @param/@returns. Подавления нет: eslint-disable на строке 1 гасит только jsdoc/no-undefined-types. Severity minor адекватна (стилистическое нарушение, 2 warning без влияния на рантайм). Единственная микронеточность — в recommendation образец указан неверно (у соседних isPasswordField/isLoginCredential своих @param/@returns нет; правильный образец — JSDoc компонента SignUpForm ниже), но на суть, file:line и severity это не влияет.

### 2.34. [НЕЗНАЧИТЕЛЬНО] 🟡 `components/forms/SignUpForm.tsx:247`

*Измерение: `rule:linting`*

**Суть:** react-hooks/exhaustive-deps подавлен без пояснения у onSignUp

**Детали:** useCallback onSignUp (deps [fields, attributes, canSubmit], строка 248) использует внутри login, router, setOpen, setComponent, setAction и другие значения, не входящие в deps; недостающие зависимости скрыты eslint-disable-next-line без комментария-обоснования. Риск ниже, чем в VerificationForm (fields целиком в deps, а его ссылка меняется при каждом вводе, поэтому колбэк часто пересоздаётся; контекстные сеттеры квазистабильны), но нарушение правила то же и маскирует будущие регрессии.

**Рекомендация:** Убрать подавление и добавить недостающие зависимости в массив; если какая-то зависимость исключается сознательно — оставить комментарий с обоснованием (как сделано в AuthContext.tsx:231–232).

> Проверка: Суть подтверждена: правило linting требует react-hooks/exhaustive-deps (активно в eslint.config.mjs через recommended-latest), а в SignUpForm.tsx:247 подавление стоит без комментария-обоснования; useCallback onSignUp (deps [fields, attributes, canSubmit]) реально использует login (стр. 224), setOpen (230/233), setComponent (234), setAction (235), не входящие в deps. Компенсации в другом месте нет; образец правильного оформления в AuthContext.tsx:231–233 существует. Однако деталь находки неточна: 'router' среди пропущенных зависимостей указан ошибочно — в SignUpForm.tsx нет ни router, ни useRouter (grep 0 совпадений). Severity minor корректна.

### 2.35. [НЕЗНАЧИТЕЛЬНО] ✅ `components/forms/UserForm.tsx:57`

*Измерение: `rule:auth-provider`*

**Суть:** При обновлении профиля пароль попадает и в authData, и в formData, а пустые значения отправляются как '' вместо фильтрации

**Детали:** formData собирается из всех полей формы reg, исключая только email_notification_reg (строки 52–63) — туда попадают password_reg (одновременно отправляемый в authData, строки 85–90) и repeat_password; правило требует: login credentials — ТОЛЬКО в authData, «If the password is left in formData — login will break». value: fields[...]?.value || '' — это ровно ❌-паттерн правила «empty string → 400»: незаполненные поля уходят пустыми строками. Вызов идёт через Users.updateUser (смежный с AuthProvider API с той же схемой тела authData/formData/notificationData), роутинг сделан по именам маркеров, а не по флагам.

**Рекомендация:** Роутить поля по флагам, как в signUp: isLogin/isPassword — только в authData, repeat_password не отправлять вовсе, остальные — в formData с фильтрацией пустых значений (.filter(f => value(f.marker))).

> Проверка: Попытка опровергнуть не удалась — все фактические утверждения находки подтверждены.

1. Правило реально требует заявленное: rule "auth-provider" (rulePaths включают components/**/*.tsx) — «Login credentials (isLogin, isPassword) go ONLY in authData, NOT in formData», «If the password is left in formData — login will break», плюс ❌-паттерн `value: values[marker] || '' // empty string → 400` и фильтрация пустых в эталонном коде и для authData, и для formData. Цитата в находке точна.

2. Код нарушает: components/forms/UserForm.tsx строки 52–63 — formData собирается из ВСЕХ полей формы reg кроме email_notification_reg, строка 57 — ровно `value: fields[...]?.value || ''`; строки 85–90 — password_reg одновременно уходит в authData. Роутинг по имени маркера, флаги isLogin/isPassword не используются.

3. Поля реально существуют: живая инспекция CMS (inspect-forms.mjs) показала, что форма reg заполнена (снимок в CLAUDE.md об «attributes = {}» устарел): password_reg (isPassword=true), repeat_password, email_reg (isLogin=true), name_reg, phone_reg — т.е. в formData попадают и пароль, и repeat_password.

4. Пустые строки достижимы в рантайме: FormInput (строки 61–70) диспатчит addField при монтировании со значением `field.value || ''`; пароль не префиллится из user.formData, поэтому fields.password_reg = {value:''} существует сразу. Гард UserForm (строка 72) проверяет только наличие ключа, не значение — при сохранении профиля без повторного ввода пароля уйдёт authData с value:'' и пустые строки в formData.

5. Митигации нигде нет: вызов `getApi().Users.updateUser` идёт напрямую из компонента (единственный другой вызов updateUser — app/api/server/users/updateUserState.ts, для корзины, к этой форме отношения не имеет); getFormAttributes лишь нормализует массив/объект. Компонент живой — рендерится на странице профиля (ProfileCard.tsx:64).

6. Рекомендация корректна: SignUpForm.tsx в этом же репо уже реализует требуемый флаговый роутинг (isLoginCredential → только authData, repeat_password не отправляется, `.filter(f => value(f.marker))`).

Единственная натяжка — правило формулирует требования для AuthProvider.signUp/auth, а не Users.updateUser, но находка это честно раскрывает («смежный API с той же схемой тела authData/formData/notificationData»), и схема тела действительно идентична. Severity minor точна и даже консервативна (фактическое поведение Users API на пустой authData не проверялось — мутационный тест сломал бы тестового юзера; в сохранённом formData тестового юзера утечки пароля нет, т.к. он регистрировался через корректный SignUpForm). Строка, описание, цитата правила и рекомендация — всё точно.

### 2.36. [НЕЗНАЧИТЕЛЬНО] ✅ `components/layout/header/nav/user-menu/LogoutMenuItem.tsx:23`

*Измерение: `rule:tokens`*

**Суть:** Маркер провайдера при logout захардкожен 'email' вместо сохранённого authProviderMarker

**Детали:** `logOutUser({ marker: 'email' })` здесь и в components/layout/profile-page/components/SignOutButton.tsx:31 игнорирует сохранённый при логине 'authProviderMarker'. При сессии, открытой через провайдер 'phone' (вкладка в SignInForm), серверный `AuthProvider.logout('email', token)` уйдёт не тому провайдеру — refresh-токен не будет отозван на сервере (локальная сессия при этом чистится в finally logOutUser). Пока активен только email-провайдер — эффект латентный.

**Рекомендация:** В logOutUser (или в вызывающих компонентах) брать маркер из `localStorage.getItem('authProviderMarker') ?? 'email'` вместо константы.

> Проверка: Факт подтверждён по обеим точкам: LogoutMenuItem.tsx:23 и SignOutButton.tsx:31 передают в logOutUser захардкоженный marker: 'email'. Обёртка app/api/server/users/logOutUser.ts использует маркер как есть — нормализации/фолбэка на сохранённый 'authProviderMarker' нет нигде: grep показывает, что ключ только записывается (AuthContext.login:172, SignInForm:123, SignUpForm:227, VerificationForm:114) и удаляется (logOutUser.ts:31), но никогда не читается. Правило tokens действительно требует обязательного сохранения authProviderMarker при логине (цитата ruleQuote точная) и объясняет, что провайдер-специфичные эндпоинты строятся из этого маркера — AuthProvider.logout(marker, token) относится к таким вызовам, поэтому при сессии 'phone' revoke уйдёт не тому провайдеру, а локальная сессия всё равно чистится в finally — ровно как описано. Путь к сессии 'phone' в коде реален (SignInForm: auth(tab, body) + login({authProviderMarker: tab}), вкладки ['email','phone']), хотя сейчас практически недостижим (провайдеры в админке не включены, phone-таб шлёт email_reg-маркеры) — находка сама оговаривает латентность, severity minor адекватна. Строка, описание и рекомендация точны.

### 2.37. [НЕЗНАЧИТЕЛЬНО] ✅ `components/layout/header/nav/user-menu/LogoutMenuItem.tsx:23`

*Измерение: `rule:auth-provider`*

**Суть:** logout вызывается с захардкоженным маркером 'email' вместо сохранённого при логине localStorage['authProviderMarker']

**Детали:** logOutUser({ marker: 'email' }) здесь и в components/layout/profile-page/components/SignOutButton.tsx:31. AuthContext.login() сохраняет authProviderMarker в localStorage (app/store/providers/AuthContext.tsx:172), logOutUser его удаляет (app/api/server/users/logOutUser.ts:31), но НИКТО его не читает — ключ мёртвый. В админке уже активен второй провайдер 'google' (проверено getAuthProviders): если появится OAuth-вход, серверный logout такого пользователя уйдёт с неверным маркером.

**Рекомендация:** В обоих компонентах брать маркер из localStorage.getItem('authProviderMarker') с фолбэком 'email' и передавать его в logOutUser.

> Проверка: Правило auth-provider действительно требует заявленного: после auth() — localStorage.setItem('authProviderMarker', marker), а эталонный logout в правиле снабжён именно процитированным комментарием «marker is taken from localStorage (saved during login)». Код нарушает: LogoutMenuItem.tsx:23 и SignOutButton.tsx:31 вызывают logOutUser({ marker: 'email' }) с захардкоженным маркером; AuthContext.login() (AuthContext.tsx:172) сохраняет authProviderMarker, logOutUser.ts:31 удаляет, но grep по проекту и node_modules/oneentry подтверждает — ключ никто не читает (write-only, SDK его тоже не использует). Нормализации/фолбэка в других местах нет: logOutUser передаёт marker напрямую в AuthProvider.logout(). Живая проверка getAuthProviders (inspect-auth-providers.mjs) подтвердила второй активный провайдер {"identifier":"google","type":"oauth","isActive":true}. Дополнительно SignInForm.tsx:113/123 передаёт динамический tab ('email'|'phone') — даже логин не гарантирует 'email'. Severity minor корректна: сейчас в UI есть только email-вход, поломка проявится лишь при добавлении OAuth. file:line, детали и рекомендация точны.

### 2.38. [НЕЗНАЧИТЕЛЬНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/layout/home/offers-feed/components/OfferInfo.tsx:43`

> Маркер `services`→`offer_services`, `parentId` из `value.parentId` (мёртвый код, но приведён к корректным маркерам). См. общий фикс офферов у 2.15.

*Измерение: `rule:attribute-sets`*

**Суть:** Неиспользуемый OfferInfo читает маркер 'services' вместо offer_services и ждёт parentId на верхнем уровне вместо value.parentId.

**Детали:** item.product.attributeValues.services?.value всегда undefined для офферов (в наборе 'offer' есть только offer_services), а тип Array<{ parentId: number }> не соответствует реальной entity-форме [{ title, value: { id, parentId } }] — parentId вложен в value. Итог при использовании: servicesArr?.[0]?.parentId ?? 0 → запрос страницы id=0 → handleSelect молча не срабатывает. Видимого эффекта сейчас нет: компонент нигде не импортируется (в CLAUDE.md OfferInfo явно указан как неиспользуемый, оставленный на диске). Актуальная лента офферов использует parseOffer.ts с корректными маркерами.

**Рекомендация:** При реанимации компонента заменить на offer_services и брать parentId из value.parentId (как в parseOffer.ts:106); до тех пор оставить как есть — удалять по конвенции проекта нельзя.

> Проверка: Все утверждения находки подтверждены. (1) Правило attribute-sets действительно содержит цитату «marker — unique identifier — used in attributeValues of the entity» и запрет угадывать маркеры («Do not guess — inspect via /inspect-api»; также в глоссарии MCP). (2) OfferInfo.tsx:43-46 точно как описано: читает attributeValues.services (в наборе 'offer' такого маркера нет — только offer_services, offer_price, offer_sale, offer_type, offer_sku) и типизирует entity-значение как Array<{ parentId }> вместо реальной формы [{ title, value: { id, parentId } }] — это подтверждается рабочим parseOffer.ts:50-56 и :106 (servicesArr?.[0]?.value?.parentId ?? 0). (3) Обработки в другом месте нет: grep показывает, что OfferInfo нигде не импортируется (только упоминание в CLAUDE.md как намеренно оставленный неиспользуемый компонент); активная лента офферов использует отдельный parseOffer.ts с корректными маркерами, но сам OfferInfo при использовании молча ломался бы (id=0 → service undefined → ранний return). (4) Severity minor адекватен: нарушение правила реальное, но рантайм-эффекта ноль (мёртвый код), и находка это явно оговаривает. Рекомендация (чинить при реанимации по образцу parseOffer.ts:106, не удалять) соответствует конвенции проекта.

### 2.39. [НЕЗНАЧИТЕЛЬНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/layout/home/offers-feed/components/parseOffer.ts:47`

> tagline теперь читается из `offer_description` (фолбэк на `plainValue`). См. общий фикс офферов у 2.15.

*Измерение: `rule:attribute-values`*

**Суть:** Тэглайн оффера берётся из localizeInfos.plainValue, который у продуктов пуст, — заполненный атрибут offer_description не читается, подпись на карточке никогда не показывается

**Детали:** const tagline = (product.localizeInfos?.plainValue as string | undefined) ?? '' — живая проверка показала, что localizeInfos у продуктов содержит только title (plainValue undefined). При этом у каждого оффера заполнен строковый атрибут offer_description («Skin renewal followed by a soothing massage…»). OfferCard.tsx (стр. 141–146) скрывает пустой тэглайн, поэтому деградация тихая, но контент из CMS теряется. Остальной parseOffer корректен (offer_sale/offer_price через Number(), offer_services по title, фолбэк цвета по offer_type.title — задокументирован).

**Рекомендация:** Читать tagline из attributeValues: const tagline = (product.attributeValues?.offer_description?.value as string | undefined) ?? '' с текущим фолбэком на plainValue.

> Проверка: Находка подтверждена по всем пунктам. (1) Правило attribute-values действительно предписывает читать значения по маркеру напрямую (attrs.marker?.value), а localizeInfos упоминает только как fallback. (2) parseOffer.ts:47-48 читает тэглайн исключительно из product.localizeInfos?.plainValue; обработки/нормализации в другом месте нет — offers-feed/index.tsx передаёт сырые продукты из блока home_offers_feed, OfferCard.tsx:141-148 скрывает пустой тэглайн (тихая деградация, как заявлено). (3) Живая проверка обоими путями данных (Products.getProductsByPageUrl('offers') и Blocks.getBlockByMarker('home_offers_feed').similarProducts) показала: у всех 4 офферов (id 310-313) localizeInfos содержит только title (plainValue undefined), а строковый атрибут offer_description заполнен у всех, включая цитируемый текст «Skin renewal followed by a soothing massage…» (id 313). Тэглайн всегда '', контент CMS теряется. Рекомендация корректна и соответствует паттерну, уже применённому в parseOfferDetail.ts:58-62 (атрибут с фолбэком на plainValue). Severity minor адекватна: тихая потеря контента без ошибок/падений. Скрипты проверки: .claude/temp/inspect-offer-tagline-verify.mjs и inspect-offer-tagline-block.mjs.

### 2.40. [НЕЗНАЧИТЕЛЬНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/layout/offers-table/components/PriceCell.tsx:22`

> `offer_price` (зачёркнутая, `line-through`) / `offer_sale` (текущая, фолбэк `product.price`), значения через `Number()`. См. общий фикс офферов у 2.15.

*Измерение: `rule:attribute-sets`*

**Суть:** Ячейка цены таблицы офферов читает маркер 'sale', которого нет в наборе 'offer' (реальные — offer_sale/offer_price).

**Детали:** product.attributeValues?.sale?.value всегда undefined для офферов — «старая» цена в ячейке не отобразится (рендерится пустой div с символом дирхама). Верифицировано по схеме набора 'offer' в CMS: есть offer_sale (real, текущая цена) и offer_price (real, зачёркнутая). Видимого эффекта сейчас нет — родительский OffersTable нигде не используется (лежит на диске по конвенции «не удалять»).

**Рекомендация:** Читать offer_price как зачёркнутую цену и offer_sale (с фолбэком на product.price) как текущую — по образцу parseOffer.ts:63-65.

> Проверка: Находка подтверждена по всем пунктам. (1) Правило attribute-sets действительно содержит цитату «marker — unique identifier — used in attributeValues of the entity», а глоссарий MCP требует «DO NOT guess markers». (2) PriceCell.tsx:22 точно читает product.attributeValues?.sale?.value. (3) Живая проверка CMS (продукт 310, набор offer): ключей attributeValues ровно 8 (offer_description, offer_sale, offer_price, offer_type, offer_services, offer_sku, offer_time, offer_image), маркера 'sale' нет — значение всегда undefined, серый div рендерится только с символом дирхама. offer_sale=250 (текущая), offer_price=300 (зачёркнутая) — детали находки верны. (4) Компенсации нет: OffersTable фильтрует attributeSetIdentifier==='offer' и передаёт сырой IProductsEntity без нормализации; сам OffersTable нигде не импортируется (мёртвый код по конвенции «не удалять») — что находка честно оговаривает, обосновывая severity minor. (5) Рекомендация корректна: parseOffer.ts:63-65 — рабочий образец (offer_sale || product.price, offer_price как original).

### 2.41. [НЕЗНАЧИТЕЛЬНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/layout/offers-table/components/PriceCell.tsx:22`

> Исправлено вместе с 2.40/2.42 (PriceCell + ServicesCell на префиксные маркеры). См. общий фикс офферов у 2.15.

*Измерение: `rule:attribute-values`*

**Суть:** Легаси-компоненты офферов читают несуществующие маркеры sale и services (реальные — offer_price/offer_services); компоненты сейчас нигде не используются

**Детали:** PriceCell.tsx:22 (attributeValues?.sale), ServicesCell.tsx:19 (attributeValues?.services) и home/offers-feed/components/OfferInfo.tsx:43 (attributeValues.services — вдобавок без optional chaining на attributeValues) читают маркеры, которых нет у продуктов набора offer (проверено живым API). OffersTable и OfferInfo/OfferCircle не импортируются ни одной страницей (grep по репо), лежат на диске по конвенции проекта «ничего не удалять», поэтому видимого эффекта нет. Если их вернут в работу — цены/составы офферов будут пустыми.

**Рекомендация:** При реанимации этих компонентов заменить маркеры на offer_price/offer_services (entity: заголовок в entry.title) и добавить ?. при доступе к attributeValues в OfferInfo. До тех пор — оставить как есть (конвенция «не удалять»).

> Проверка: Правило attribute-values действительно содержит дословную цитату «Always check the actual structure via /inspect-api or console.log before use. Do not guess markers». Все три указанных места подтверждены построчно: PriceCell.tsx:22 читает attributeValues?.sale, ServicesCell.tsx:19 — attributeValues?.services, OfferInfo.tsx:43 — attributeValues.services без optional chaining на attributeValues. У продуктов набора offer таких маркеров нет — реальные префиксные offer_price/offer_sale/offer_services/offer_type (подтверждено рабочим кодом parseOffer.ts и снимком CMS в CLAUDE.md от 2026-07-12). Grep подтверждает: OffersTable, OfferInfo и OfferCircle нигде не импортируются — действующий путь офферов (offers-feed/index.tsx → OffersFeed → parseOffer) использует правильные маркеры; никакой нормализации/фолбэка, исправляющей легаси-маркеры, в utils/обёртках нет. Severity minor адекватна: мёртвый код с латентным багом при реанимации. Единственная микронеточность — в рекомендации для sale ближайший аналог offer_sale, а не offer_price (offer_price — зачёркнутая исходная цена), но на суть находки это не влияет.

### 2.42. [НЕЗНАЧИТЕЛЬНО] ✅ ✔️ИСПРАВЛЕНО (2026-07-14) `components/layout/offers-table/components/ServicesCell.tsx:19`

> Маркер `services`→`offer_services`. См. общий фикс офферов у 2.15.

*Измерение: `rule:attribute-sets`*

**Суть:** Ячейка услуг таблицы офферов читает маркер 'services', которого нет в наборе 'offer' (реальный — offer_services).

**Детали:** product.attributeValues?.services?.value всегда undefined для офферов — список услуг в ячейке никогда не отрендерится. Верифицировано по схеме набора 'offer' в CMS. Видимого эффекта сейчас нет: компонент OffersTable (components/layout/offers-table/index.tsx) нигде не импортируется — лежит на диске по конвенции проекта «ничего не удалять». Если таблицу вернут в работу, ячейка будет пустой.

**Рекомендация:** Заменить маркер на offer_services (title элементов лежит на верхнем уровне entity-значения, поэтому s.title после замены заработает).

> Проверка: Попытка опровергнуть провалилась по всем направлениям. 1) Первоисточник: правило attribute-sets действительно содержит цитату «marker … unique identifier — used in attributeValues of the entity», а глоссарий MCP oneentry — требование «DO NOT guess markers»; ruleQuote точен. 2) file:line подтверждается: components/layout/offers-table/components/ServicesCell.tsx:19 читает `product.attributeValues?.services?.value`. 3) Обработки в другом месте нет: продукт идёт сырым по цепочке OffersTable (index.tsx, фильтр `attributeSetIdentifier === 'offer'`) → OfferRow.tsx:64 → ServicesCell; в components/utils.ts, app/api/server/**, app/store/** нет ни нормализации attributeValues, ни переименования offer_services→services (grep). Единственное место, читающее правильный маркер `offer_services`, — offers-feed/components/parseOffer.ts. 4) Живая проверка CMS (SDK, продукты 310–313): у всех набор `offer`, ключи attributeValues = offer_description/offer_sale/offer_price/offer_type/offer_services/offer_sku/offer_time/offer_image; ключа `services` нет ни у одного — services в ячейке всегда undefined, список никогда не отрендерится. 5) Утверждение об отсутствии видимого эффекта верно: OffersTable нигде не импортируется (grep по репо — только собственный файл и docs), лежит по конвенции «ничего не удалять» — severity minor адекватна. 6) Рекомендация корректна: у entity-значения title лежит на верхнем уровне элемента (`[{ title, value: {...} }]`, подтверждено комментарием в parseOffer.ts и механикой admin API), т.е. `s.title` после замены маркера заработает.

### 2.43. [НЕЗНАЧИТЕЛЬНО] ✅ `components/layout/profile-page/components/getUserDisplayName.ts:34`

*Измерение: `rule:typescript`*

**Суть:** user.formData кастится в ad-hoc пару NameField = { marker?, value? } — прямой ❌-пример из правила (дубль FormDataType).

**Детали:** Строка 4 объявляет 'type NameField = { marker?: string; value?: unknown }' (комментарий сам признаёт: subset SDK-шного FormDataType), строки 33–35 кастят 'user.formData as NameField[]'. SDK уже типизирует IUserEntity.formData как FormDataType[] ('oneentry/dist/forms-data/formsDataInterfaces', тип существует в установленной версии — проверено). Правило требует вместо ad-hoc пары импортировать FormDataType и сужать через type guard, т.к. union содержит и вариант Record<string, unknown> без marker.

**Рекомендация:** Удалить NameField; импортировать FormDataType и написать type guard hasMarker(i): i is FormDataType & { marker: string; value: unknown } по образцу из правила, затем итерироваться по user.formData без каста.

> Проверка: Все утверждения находки подтверждены первоисточниками. (1) Правило "typescript" (MCP oneentry get-rule) дословно содержит цитируемый ❌-пример: «Retyping user.formData into ad-hoc pair — duplicates FormDataType options» с кастом `user.formData as Array<{ marker: string; value: unknown }>`, и ✅-фикс: импорт `FormDataType` из `oneentry/dist/forms-data/formsDataInterfaces` + type guard `hasMarker` (вариант union `Record<string, unknown>` без marker). (2) Файл d:\OneEntry\oneentry-next-beauty-v2\components\layout\profile-page\components\getUserDisplayName.ts: строка 4 — `type NameField = { marker?: string; value?: unknown }` (комментарий сам признаёт «subset of the SDK's FormDataType union»), строка 34 — каст `(user.formData as NameField[])`. Указание file:line точное. (3) SDK установленной версии действительно экспортирует `FormDataType` (node_modules/oneentry/dist/forms-data/formsDataInterfaces.d.ts:305,597) и типизирует `IUserEntity.formData: FormDataType[]` (usersInterfaces.d.ts:249) — рекомендация реализуема как есть. (4) Обработки в другом месте нет: единственный вызывающий — ProfileCard.tsx:36, передаёт `user` из AuthContext напрямую; в components/utils.ts нормализации formData нет (getFormAttributes — про Forms.attributes, не про user.formData). Исключение правила «narrowing unknown at the access point» не применимо: formData типизирован SDK как FormDataType[], а не unknown, т.е. NameField — именно дубль SDK-типа. Смягчающие нюансы (тип не экспортируется, поля optional, код рантайм-безопасен) не выводят из-под запрета — правило прямо называет этот паттерн антипаттерном независимо от soundness. Severity minor корректна: рантайм-бага нет, чисто нарушение правила типизации.

### 2.44. [НЕЗНАЧИТЕЛЬНО] ✅ `components/layout/profile-page/components/order-card/components/OrderProductTitle.tsx:3`

*Измерение: `rule:typescript`*

**Суть:** Локальные interface OrderProduct/Order — обрезанный структурный дубль IOrderByMarkerEntity, хотя все соседние компоненты order-card используют SDK-тип.

**Детали:** Строки 3–11: 'interface OrderProduct { title: string }' и 'interface Order { products: OrderProduct[] }' с комментариями «Add other product properties as needed» — ровно та ловушка, которую описывает правило: каждое следующее поле придётся протаскивать через самодельный DTO. Компонент получает реальный IOrderByMarkerEntity (order-card/index.tsx:136 передаёт order: IOrderByMarkerEntity), а соседние OrderDateTime.tsx и OrderButtonsGroup.tsx корректно импортируют SDK-тип.

**Рекомендация:** Удалить локальные Order/OrderProduct и типизировать проп как 'order: IOrderByMarkerEntity' (import type из 'oneentry/dist/orders/ordersInterfaces'), как в соседних OrderDateTime/OrderButtonsGroup.

> Проверка: Все утверждения находки подтверждаются. (1) Правило "typescript" действительно содержит дословную цитату «if you feel tempted to write `type FooField = { …trimmed subset of IFoo… }` — stop. Import `IFoo`» и явно называет IOrderByMarkerEntity в списке SDK-типов, которые нельзя дублировать «плоскими DTO» («The rule applies to any SDK entity»). (2) Файл OrderProductTitle.tsx, строки 3–11: локальные `interface OrderProduct { title: string }` и `interface Order { products: OrderProduct[] }` с комментариями «Add other product properties as needed» — точный обрезанный структурный дубль. (3) Вызывающий order-card/index.tsx строка 136 передаёт `order`, типизированный как IOrderByMarkerEntity (строка 58) — совпадает с описанием. (4) Все шесть соседних компонентов (OrderDateTime, OrderButtonsGroup, CancelOrderButton, SaveOrderButton, RepeatOrder, EditOrderButton) импортируют IOrderByMarkerEntity из 'oneentry/dist/orders/ordersInterfaces' — OrderProductTitle единственное исключение. (5) Рекомендация технически корректна: SDK-тип IOrderProducts (поле products у IOrderByMarkerEntity) содержит `title: string`, так что `order.products[0]?.title` работает без локального типа. Исключение правила («local type justified only if truly diverges from SDK») не применимо — здесь чистое подмножество без дивергенции. Обработки/нормализации в другом месте нет и быть не может — это чисто типизация пропа. Severity minor адекватна: нарушение стилевое/поддерживаемость, без runtime-бага.

### 2.45. [НЕЗНАЧИТЕЛЬНО] ✅ `components/utils.ts:20`

*Измерение: `rule:typescript`*

**Суть:** getFormAttributes типизирует поля формы дефолтом T = IAttributes вместо IFormAttribute — все потребители форм получают неверный (обеднённый) тип поля.

**Детали:** Правило требует для элементов form.attributes[] использовать IFormAttribute. IAttributes (из 'oneentry/dist/base/utils') не содержит isPassword и initialValue, а additionalFields типизирует как Record<string, IAttributes> вместо Record<string, IFormAttributeAdditionalField>. Из-за этого дефолта UserForm.tsx:52, ContactUsForm.tsx:42, SignInForm.tsx:76, ForgotPasswordForm.tsx:92 и ContactFormCard.tsx:97 работают с полями формы под неточным типом, а SignUpForm был вынужден изобрести локальный FormField (см. отдельную находку). Сама нормализация массив/объект — документированное осознанное поведение и не оспаривается; вопрос только в типе элемента.

**Рекомендация:** Сменить дефолт дженерика на 'T = IFormAttribute' (импорт из 'oneentry/dist/forms/formsInterfaces') — сигнатура и все вызовы останутся совместимыми, а поля форм получат полный SDK-тип.

> Проверка: Правило "typescript" действительно требует IFormAttribute для элементов form.attributes[] (цитата дословная; таблица типов и ✅-пример в разделе про DTO кастуют к IFormAttribute[]; в SDK IFormsEntity.attributes: IFormAttribute[]). Код components/utils.ts:20 подтверждён: дефолт дженерика T = IAttributes. Разница типов проверена по .d.ts SDK: IAttributes не содержит isPassword, isSignUpRequired, initialValue; additionalFields — Record<string, IAttributes> вместо Record<string, IFormAttributeAdditionalField>. Все перечисленные потребители (UserForm.tsx:52, ContactUsForm.tsx:42, SignInForm.tsx:76, ForgotPasswordForm.tsx:92, ContactFormCard.tsx:97) вызывают getFormAttributes без явного дженерика и получают обеднённый тип; IFormAttribute не импортируется нигде в проекте (grep — 0 совпадений), компенсации в обёртках/провайдерах нет. SignUpForm.tsx:33 подтверждает практический вред: локальный FormField = IAttributes & { isPassword?... } изобретён именно из-за отсутствия isPassword. Severity minor адекватна (типовая деградация без рантайм-бага), строка и описание точны.

### 2.46. [ИНФО] ✅ `app/api/api/api.ts:58`

*Измерение: `rule:typescript`*

**Суть:** hasActiveSession читает внутреннее поле AuthProvider.state через 'as unknown as { state?: { accessToken?: string } }' — публичный тип SDK его не описывает.

**Детали:** Каст задокументирован JSDoc-комментарием (SDK хранит auth-состояние внутри AuthProvider, публичного геттера нет), что укладывается в исключение правила о конфликте типа SDK и фактического поведения. Риск: поле state — недокументированный интерьер SDK и может исчезнуть/переименоваться при обновлении пакета, а двойной каст скроет поломку на уровне типов (вернётся просто false).

**Рекомендация:** Оставить с текущей документацией; при обновлениях SDK проверять, не появился ли публичный метод проверки сессии (например, isAuth/getAccessToken), и мигрировать на него.

> Проверка: Факты подтверждены полностью. (1) file:line точны: каст `as unknown as { state?: { accessToken?: string } }` — app/api/api/api.ts:58, JSDoc-обоснование на строках 50-56. (2) Публичный тип SDK действительно не даёт доступа к полю: в authProviderApi.d.ts/asyncModules.d.ts оно объявлено как `protected state: StateModule` — извне без каста недоступно; при этом форма каста совпадает с реальным типом (StateModule.accessToken: string | undefined). (3) Публичной альтернативы нет: grep по всем .d.ts SDK не находит getAccessToken/isAuth/hasSession (getActiveSessionsByMarker — сетевой вызов, не локальная проверка), так что рекомендация «оставить и следить за обновлениями SDK» корректна. (4) Риск описан верно: двойной каст скроет переименование `state` на уровне типов, функция молча вернёт false (вызывающий AuthContext.onInit:144 просто сделает лишний reDefine — мягкая деградация, что подтверждает severity info). (5) Правило typescript запрещает `any` и DTO-дубли — здесь ни того, ни другого; цитируемое исключение («document this explicitly») в правиле буквально описывает обратный случай (тип требует поле, API его отвергает), так что привязка — интерпретация принципа «задокументированного отклонения», но находка и не заявляет нарушения (severity info, deliberate false), и её суть, строка и severity точны. Обработки/нормализации в другом месте нет — находка не устарела.

### 2.47. [ИНФО] 🟡 `app/layout.tsx:134`

*Измерение: `rule:nextjs-pages`*

**Суть:** В корневом layout два независимых фетча (getDictionary и getMenuByMarker('main')) выполняются последовательно вместо Promise.all.

**Детали:** Строка 134: await getDictionary(); строка 135: await getMenuByMarker('main'). Запросы независимы друг от друга, но сериализованы — root layout выполняется для каждого роута, т.е. каждый SSR-рендер получает лишний последовательный сетевой round-trip к OneEntry. Правило nextjs-pages в разделе «Getting page content» предписывает объединять независимые запросы в Promise.all.

**Рекомендация:** const [dictData, menuResult] = await Promise.all([getDictionary(), getMenuByMarker('main')]); затем ServerProvider('dict', dictData).

> Проверка: Правило nextjs-pages действительно предписывает Promise.all для независимых запросов (раздел «Getting page content»: «// Parallel requests — faster», плюс ссылка на performance.md «Promise.all for independent fetches») — цитата подтверждена. Код по file:line совпадает: app/layout.tsx:134-135 — два последовательных await независимых вызовов, ServerProvider принимает готовое значение, рефакторинг применим. НО заявленный импакт завышен: getDictionary идёт через getCachedData (app/api/utils/getCachedData.tsx) — module-scope Map без TTL, т.е. сетевой запрос словаря выполняется максимум один раз на процесс; на прогретом сервере await getDictionary() — мгновенный cache hit, и «лишний последовательный round-trip на каждый SSR-рендер» не возникает. Реальная цена — только холодный первый запрос процесса (dev-рестарт, serverless cold start), причём JSDoc в том же файле (строки 78-79) прямо документирует кэширование. Нарушение паттерна формально есть, поэтому не REFUTED, но детали неточны и severity следует понизить до info.

### 2.48. [ИНФО] ✅ `app/store/providers/AuthContext.tsx:171`

*Измерение: `rule:tokens`*

**Суть:** Ручные localStorage.setItem('refresh-token') и syncTokens после auth() избыточны по правилу

**Детали:** login() (строки 162–176) вызывается формами после успешного `AuthProvider.auth()` (SignInForm.tsx:113–124, SignUpForm.tsx:211–228, VerificationForm.tsx:102–115). По правилу auth() сам кладёт оба токена в state текущего инстанса и вызывает saveFunction — ручной `localStorage.setItem('refresh-token', …)` (строка 171) и `syncTokens(…)` (строка 173) после него избыточны (записывают те же значения). Вреда нет — операции идемпотентны; сохранение authProviderMarker (строка 172) при этом обязательно и корректно.

**Рекомендация:** Можно упростить login() до сохранения authProviderMarker + setIsAuth + checkToken, как в эталоне правила. Если syncTokens оставлен намеренно как страховка единого пути для auth/signUp — зафиксировать это в JSDoc со ссылкой на правило.

> Проверка: Правило tokens дословно содержит заявленное: после auth() «syncTokens and manual localStorage.setItem('refresh-token', ...) after it are redundant». file:line точны: AuthContext.tsx:171 — setItem('refresh-token'), :173 — syncTokens внутри login() (162–176). Адверсариальные проверки не опровергли: (1) saveFunction сконфигурирован в SDK-инстансе проекта (app/api/api/api.ts:22–38) и пишет refresh-token в localStorage — auth() сам персистит токен; (2) SDK oneentry@1.0.155 ≥ 1.0.152 — поведение правила применимо; (3) все три вызова login() (SignInForm.tsx:113→120, SignUpForm.tsx:211→224, VerificationForm.tsx:102→111) идут только после AuthProvider.auth(); oauth() в проекте нет, исключение правила не применяется. Находка честно отмечает идемпотентность (вреда нет) и обязательность сохранения authProviderMarker. Severity info адекватна — это избыточность, не баг.

### 2.49. [ИНФО] ✅ `app/store/providers/AuthContext.tsx:171`

*Измерение: `rule:auth-provider`*

**Суть:** login() вручную дублирует сохранение refresh-токена в localStorage и запись токенов в SDK, хотя auth() уже делает это сам через saveFunction

**Детали:** localStorage.setItem('refresh-token', refreshToken) (строка 171) и syncTokens(accessToken, refreshToken) (строка 173, app/api/api/api.ts:73–76) дублируют то, что auth()/signUp() уже сделали: SDK кладёт оба токена в state того же инстанса и вызывает saveFunction, пишущую refresh-токен под тем же ключом 'refresh-token' (app/api/api/api.ts:22–27). Вреда нет (ключ совпадает, accessToken в localStorage не пишется, authProviderMarker сохраняется корректно), но по правилу ручное сохранение не нужно — достаточно сохранить маркер провайдера.

**Рекомендация:** Оставить в login() только сохранение authProviderMarker и обновление React-состояния; ручную запись 'refresh-token' и syncTokens можно убрать (предварительно проверив, что нигде не полагаются на синхронность записи).

> Проверка: Правило auth-provider дословно содержит процитированное требование («tokens do not need to be saved manually … Only save the provider marker»). SDK подтверждает (node_modules/oneentry/dist/auth-provider/authProviderApi.js:191–203): auth() сам кладёт оба токена в state инстанса и вызывает saveFunction, а saveFunction проекта (app/api/api/api.ts:22–27) пишет refresh-токен под тем же ключом 'refresh-token' и сконфигурирована во всех defineOneEntry. Все три вызова login() (SignInForm:113→120, VerificationForm:102→111, SignUpForm:211→224) идут сразу после getApi().AuthProvider.auth() на том же инстансе — значит localStorage.setItem('refresh-token', …) (AuthContext.tsx:171) и syncTokens (строка 173) действительно дублируют уже сделанное SDK. file:line точны, severity info корректна (вреда нет: ключ совпадает, accessToken в localStorage не пишется, маркер сохраняется). Единственная микронеточность в details: сам signUp() saveFunction не вызывает, но в проекте после signUp всегда вызывается auth() перед login(), так что суть находки не затронута.

### 2.50. [ИНФО] ✅ 🔧 `app/store/providers/AuthContext.tsx:233`

*Измерение: `rule:linting`*

**Суть:** Осознанное подавление exhaustive-deps с задокументированным обоснованием (isAuth намеренно исключён из deps)

**Детали:** useEffect «Check token on refetch» (строки 227–234) читает isAuth, но deps — [refetch, refetchUser, checkToken]; подавление снабжено комментарием (строки 231–232): перепроверка токена нужна только при явном переключении refetch/refetchUser, а не при каждой смене auth-состояния. Формально нарушает требование правила о полном списке зависимостей, но решение зафиксировано в коде и функционально обосновано (иначе — лишние перепроверки токена при каждом логине/логауте).

**Рекомендация:** Оставить как есть (обоснование в коде присутствует). Альтернатива без подавления — хранить isAuth в ref и читать его внутри эффекта.

> Проверка: Правило "linting" дословно требует: «react-hooks/exhaustive-deps — all dependencies of useEffect must be in the deps array» — цитата в находке точна. В AuthContext.tsx эффект (строки 227–234) читает isAuth, но deps = [refetch, refetchUser, checkToken]; подавление eslint-disable-next-line стоит ровно на строке 233, поясняющий комментарий — строки 231–232. Обоснование комментария соответствует коду: refetch/refetchUser переключаются только в authenticate()/refreshUser(), а добавление isAuth в deps дало бы лишние checkToken() при каждом логине/логауте (login() уже вызывает checkToken сам). Обработки «в другом месте» для линт-подавления не существует по определению. Severity info и deliberate=true адекватны: нарушение формальное, осознанное, задокументированное, ESLint с директивой проходит. Все детали находки подтверждены.

### 2.51. [ИНФО] ✅ `app/types/global.d.ts:4`

*Измерение: `rule:typescript`*

**Суть:** Объявлен неиспользуемый тип LocalizeInfo — нигде в app/ и components/ не употребляется и по смыслу дублирует SDK-тип ILocalizeInfo.

**Детали:** declare type LocalizeInfo = { content; menuTitle; title } не имеет ни одного использования (grep по всей области аудита — только само объявление) и представляет устаревший ручной слепок SDK-типа ILocalizeInfo ('oneentry/dist/base/utils'), причём с расходящейся формой (content вместо plainValue/htmlValue/htmlContent). ESLint не флагует ambient-объявления в .d.ts, поэтому no-unused-vars это не ловит.

**Рекомендация:** По духу правила тип подлежит удалению, но по конвенции проекта («ничего не удалять без явной просьбы») — согласовать удаление с пользователем; при будущем использовании локализаций импортировать ILocalizeInfo из SDK.

> Проверка: Опровергнуть не удалось, все утверждения находки подтверждены первоисточниками. (1) Правило "typescript" содержит точную цитату "Do not declare unused variables and imports" и дополнительно раздел о запрете дублирования SDK-типов, где ILocalizeInfo прямо указан в таблице импортов из 'oneentry/dist/base/utils'. (2) file:line верны: declare type LocalizeInfo = { content; menuTitle; title } в app/types/global.d.ts:4-8. (3) Grep по всему проекту (вне node_modules/.next/static-html): единственное вхождение голого LocalizeInfo — само объявление; gallery-feed использует SDK-тип ILocalizeInfo напрямую, минуя ручной. (4) Форма действительно расходится: SDK ILocalizeInfo = { title, plainValue?, htmlValue?, htmlContent?, menuTitle? }, поля content нет. (5) Severity info адекватен (нет рантайм-эффекта), рекомендация корректно учитывает конвенцию проекта «ничего не удалять без явной просьбы».

### 2.52. [ИНФО] ✅ `components/hooks/getImageSize.ts:64`

*Измерение: `rule:linting`*

**Суть:** Подавление @typescript-eslint/no-unused-vars вместо optional catch binding

**Детали:** catch (error) на строке 65 не использует переменную error, и вместо синтаксиса без привязки применён eslint-disable-next-line @typescript-eslint/no-unused-vars. Подавление избыточно: TS/ES2019 позволяет написать catch без параметра, и правило перестаёт срабатывать без отключения.

**Рекомендация:** Заменить catch (error) { ... } на catch { ... } и убрать eslint-disable.

> Проверка: Все факты подтверждены. (1) Правило "linting" дословно содержит цитату «@typescript-eslint/no-unused-vars — unused variables and imports are prohibited» и требует прохождения ESLint без предупреждений. (2) В components/hooks/getImageSize.ts строка 64 — eslint-disable-next-line, строка 65 — catch (error) с пустым телом, error не используется; file:line точны. (3) В eslint.config.mjs правило включено ('@typescript-eslint/no-unused-vars': ['warn']), typescript-eslint v8 (^8.63.0) по умолчанию имеет caughtErrors: 'all' — директива реально подавляет срабатывание. (4) Рекомендация catch { } валидна: ecmaVersion 'latest' в парсере, TS даунлевелит optional catch binding при target ES2017. Подавление обходит запрет вместо тривиального идиоматичного фикса; severity info адекватна — функционального эффекта нет, чистая линт-гигиена.

### 2.53. [ИНФО] ✅ `components/layout/home/home-hero/index.tsx:41`

*Измерение: `rule:typescript`*

**Суть:** slide.attributeValues кастится через 'as unknown as Record<string, unknown>', переопределяя SDK-тип IAttributeValues (у слайдов API реально отдаёт сырые значения без обёртки {value}).

**Детали:** SDK типизирует IBlockSlideItem.attributeValues как IAttributeValues (Record<string, { type, value, … }>), но фактический ответ эндпоинта слайдов содержит сырые значения (массив файлов / строку) — это расхождение SDK-типа и поведения API. Код документирует его развёрнутым комментарием (строки 33–40), что соответствует исключению правила («document this explicitly»), поэтому это не нарушение, а зона риска: при исправлении типа в будущих версиях SDK двойной каст скроет изменение.

**Рекомендация:** Оставить как есть (исключение задокументировано), но зафиксировать расхождение в mismatch-log (MCP-правило mismatch-log) и при обновлении пакета oneentry перепроверять фактическую форму ответа getSlides.

> Проверка: Все утверждения находки подтверждены первоисточниками. (1) Правило typescript действительно содержит и анти-паттерн «Retyping attributeValues — duplicates IAttributeValues», и исключение «Exception — SDK type conflict and API behavior … document this explicitly»; ruleQuote — реальный текст правила. (2) file:line точны: components/layout/home/home-hero/index.tsx:41-42 — именно двойной каст `as unknown as Record<string, unknown>`. (3) SDK-тип подтверждён: IBlockSlideItem.attributeValues: IAttributeValues (blocksInterfaces.d.ts:344), где IAttributeValue = {type, value, …}. (4) Живой вызов Blocks.getSlides('home_hero') подтвердил: API отдаёт сырые значения (image_id1 — массив файлов с downloadLink, string_id3 — строка) без обёртки {value} — расхождение SDK-типа и API реально. (5) Расхождение задокументировано комментарием (строки 33-40) и JSDoc обёртки getBlockSlides.ts — код соответствует исключению правила, что находка и констатирует (severity info, «не нарушение, а зона риска»). (6) Нормализации в другом месте нет: getBlockSlides — pass-through, единственный потребитель — этот файл; MISMATCH-LOG.md в репо отсутствует, т.е. рекомендация зафиксировать расхождение актуальна. Единственная микро-неточность — цитируемое исключение буквально про request-side (400 при передаче поля), а здесь response-shape, но заголовок исключения («SDK type conflict and API behavior») случай покрывает; на суть и severity не влияет. Опровергнуть находку не удалось.

### 2.54. [ИНФО] 🟡 `components/layout/service-hero/components/ServiceDescription.tsx:13`

*Измерение: `rule:attribute-values`*

**Суть:** Доступ к entity.attributeValues без предохранителя || {} в нескольких компонентах (деструктуризация/прямое обращение)

**Детали:** Правило предписывает паттерн const attrs = entity.attributeValues || {}. Без него: ServiceDescription.tsx:13, ServiceTitle.tsx:13, ServiceImage.tsx:13 (деструктуризация page.attributeValues), MasterInfo.tsx:31, MasterReviews.tsx:23 (master.attributeValues), portfolio-grid/index.tsx:48 (master.attributeValues.master_portfolio при том, что стр. 92 того же файла использует ?? {}). Сейчас API стабильно возвращает attributeValues (у страниц — пустой объект), поэтому эффекта нет; при недоступности поля был бы TypeError вместо предписанной тихой деградации.

**Рекомендация:** Привести к паттерну правила: const attrs = entity.attributeValues || {} (или ?.) во всех перечисленных местах — как уже сделано в catalog-data.ts, booking-data.ts, contacts/page.tsx.

> Проверка: Правило attribute-values действительно предписывает паттерн `const attrs = entity.attributeValues || {};` — цитата точна. Все 6 указанных file:line подтверждены дословно, нормализации выше по стеку нет (обёртки app/api/server attributeValues не трогают). НО: 5 из 6 мест — мёртвый код. ServiceHero (service-hero/index.tsx) не импортируется нигде, значит ServiceDescription/ServiceTitle/ServiceImage не рендерятся; MasterInfo.tsx и MasterReviews.tsx импортируются только из Master.tsx, который сам нигде не используется (живой master-single/index.tsx уже применяет `?? {}` на стр. 57). Единственное живое место из списка — portfolio-grid/index.tsx:48 (используется в app/masters/[handle]/page.tsx), причём там есть и второй незащищённый доступ на стр. 66 (page.attributeValues.gallery_photos), не упомянутый в находке. Также пропущено живое нарушение: master-single/components/MasterDescription.tsx:20 (рендерится из живого index.tsx:167). Суть находки верна (отступление от паттерна правила, эффекта сейчас нет, severity info корректна), но детализация существенно неточна: большинство перечисленных мест никогда не исполняется, а часть живых нарушений не перечислена.

## 3. Непроверенные находки (⚠️ верификация прервана лимитом)

Находки первого аудитора; **требуют ручной проверки** перед исправлением — среди них возможны ложные срабатывания. Сгруппированы по измерению, внутри — по критичности.

### `rule:forms` — 13

- **[СЕРЬЁЗНО]** `components/forms/ContactUsForm.tsx:93` — postFormsData вызывается с захардкоженными formModuleConfigId: 0, moduleEntityIdentifier: '' и status: '' вместо значений из getFormByMarker.
  - *Рек.:* Читать из data: formModuleConfigId: data?.moduleFormConfigs?.[0]?.id ?? 0, moduleEntityIdentifier: data?.moduleFormConfigs?.[0]?.entityIdentifiers?.[0]?.id ?? '', formIdentifier: data?.identifier, status: 'sent'.
- **[СЕРЬЁЗНО]** `components/layout/contacts-page/ContactFormCard.tsx:122` — Второй вызов postFormsData с теми же заглушками formModuleConfigId: 0, moduleEntityIdentifier: '', status: ''.
  - *Рек.:* Как и в ContactUsForm: брать formModuleConfigId и moduleEntityIdentifier из data.moduleFormConfigs, status: 'sent'.
- **[СЕРЬЁЗНО]** `components/forms/ContactUsForm.tsx:67` — Тип значения formData определяется switch'ем по МАРКЕРУ поля, а не по attributes[].type — типы угадываются.
  - *Рек.:* Строить formData из field.type (как в эталонном flow правила): map по formFields с type: field.type и конвертацией значения по типу; spam/button не подменять строкой 'test'.
- **[СЕРЬЁЗНО]** `components/layout/contacts-page/ContactFormCard.tsx:119` — Результат postFormsData не проверяется через isError — при ошибке API показывается «Message sent!»; message-массив не нормализуется.
  - *Рек.:* const result = await …postFormsData(...); if (isError(result)) { setError(normalizeError(result.message)); return; } — с normalizeError по образцу правила и маппингом маркеров на validators[].errorMessage.
- **[СЕРЬЁЗНО]** `components/forms/inputs/FormCaptcha.tsx:21` — Captcha для spam-поля — нерабочая заглушка: setToken никогда не вызывается, captchaKey из поля игнорируется, ключ захардкожен.
  - *Рек.:* Реализовать получение токена reCAPTCHA v3 (grecaptcha.execute → setToken) с ключом из field.settings.captchaKey и передавать токен в значение spam-поля при отправке.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/ContactUsForm.tsx:72` — Неверные форматы значений formData для типов list и text.
  - *Рек.:* list: value: [value]; text: value: [{ plainValue: value }] (одно поле).
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/inputs/FormInput.tsx:38` — Поля типов dateTime и time рендерятся обычным текстовым input — нет маппинга в нативные пикеры.
  - *Рек.:* Добавить в FormFieldsEnum dateTime = 'datetime-local' и time = 'time'; при отправке собирать { fullDate, formattedValue, formatString } по образцам правила.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/inputs/FormInput.tsx:121` — Placeholder берётся из localizeInfos.title вместо additionalFields.placeholder; hint не рендерится вовсе.
  - *Рек.:* placeholder={field.additionalFields?.placeholder?.value || ''}; при наличии additionalFields?.hint?.value выводить подсказку под полем.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/SignUpForm.tsx:33` — Для полей формы используется тип IAttributes из oneentry/dist/base/utils вместо IFormAttribute из oneentry/dist/forms/formsInterfaces.
  - *Рек.:* Импортировать IFormAttribute из 'oneentry/dist/forms/formsInterfaces' для типизации полей форм и убрать ручное расширение FormField.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/SignUpForm.tsx:84` — Поля формы не сортируются по position в SignUpForm, UserForm и ForgotPasswordForm.
  - *Рек.:* Добавить .sort((a, b) => a.position - b.position) (или sortArrayByPosition из components/utils.ts) после getFormAttributes во всех трёх формах.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/contacts-page/ContactFormCard.tsx:155` — Сообщения успеха/ошибки захардкожены — form.localizeInfos.successMessage/unsuccessMessage из настроек формы не используются.
  - *Рек.:* Выводить data?.localizeInfos?.successMessage || 'Message sent!' (и unsuccessMessage для ошибки).
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/UserForm.tsx:58` — В formData для updateUser тип каждого поля захардкожен как 'string' вместо field.type из атрибутов формы.
  - *Рек.:* Использовать type: field.type и конвертировать value по типу поля.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/booking-page/useBookingSubmit.ts:120` — В formData заказа entity-ссылка на страницу салона передаётся строкой, типы полей захардкожены, timeInterval — Date-объекты вместо ISO-строк.
  - *Рек.:* Передавать value: [salonId] числом; interval — [[start.toISOString(), end.toISOString()]]; по мере наполнения формы order брать типы из её attributes.

### `rule:jsdoc` — 10

- **[СЕРЬЁЗНО]** `components/utils.ts:14` — Систематическое указание типа в @returns в фигурных скобках — 421 из 442 тегов @returns по всей базе (app/ и components/) нарушают требование «@returns без типа».
  - *Рек.:* Определиться на уровне проекта: либо массово убрать типы из @returns (`@returns {JSX.Element} X` → `@returns X`) кодмодом/eslint-правилом jsdoc/no-types для @returns, либо зафиксировать отклонение от правила jsdoc в документации проекта. Как минимум — не воспроизводить тип в @returns в новых файлах (SaleText.tsx уже создан с нарушением).
- **[СЕРЬЁЗНО]** `components/icons/badge.tsx:1` — 22 React-компонента иконок объявлены вообще без JSDoc-блока.
  - *Рек.:* Добавить каждому компоненту-иконке JSDoc-блок по образцу components/icons/facebook.tsx (первая строка с именем, @param {object} props + цепочка props.*, @returns без типа).
- **[СЕРЬЁЗНО]** `app/api/api/RTKApi.ts:79` — 29 тегов @param без типа в фигурных скобках: все JSDoc эндпоинтов RTKApi.ts (20 тегов), OpenDrawerContext.tsx (8) и components/utils.ts:154.
  - *Рек.:* Дописать типы в фигурных скобках всем @param в RTKApi.ts и utils.ts:154. В OpenDrawerContext.tsx заменить псевдо-@param-список на обычное описание полей контекста (JSDoc с @param — для функций, не для типов/контекстов).
- **[СЕРЬЁЗНО]** `components/forms/SignUpForm.tsx:41` — Утилиты уровня модуля isPasswordField и isLoginCredential объявлены без JSDoc, хотя соседняя isConfirmPasswordField задокументирована.
  - *Рек.:* Добавить JSDoc-блоки с первой строкой `isPasswordField — ...`, @param {FormField} f и @returns без типа.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/booking-page/useBookingWizard.ts:329` — 14 именованных хендлеров хука useBookingWizard (handleNext, handleBack, resetFlow, startFlow, selectSalon, selectService и др.) без индивидуальных JSDoc — только групповой баннер-комментарий.
  - *Рек.:* Добавить короткие JSDoc-блоки каждому хендлеру (у принимающих аргументы — с @param {string} id и т.п.).
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/home/home-hero/index.tsx:43` — Около 20 прочих именованных внутренних функций/хендлеров без JSDoc в разных файлах (fileLink/str, fetchOrders, fetchPages, applyPatch, findValue и др.).
  - *Рек.:* Добавить короткие JSDoc минимум функциям с нетривиальной логикой (fileLink/str, fetchOrders, fetchPages, applyPatch, findValue, worker, percentile); для одно-строчных коллбэков внутри useEffect допустимо оставить как есть, зафиксировав трактовку в конвенциях проекта.
- **[НЕЗНАЧИТЕЛЬНО]** `app/api/api/api.ts:14` — Первая строка JSDoc почти нигде не следует формату «Name — what it does.» с именем функции и em-dash — описания начинаются с глагольной фразы без имени.
  - *Рек.:* В новых и редактируемых файлах начинать первую строку с имени функции и em-dash: «SaleText — renders sale text with % wrapped in spans.». Массовый рефакторинг существующих блоков — по решению команды.
- **[НЕЗНАЧИТЕЛЬНО]** `components/utils.ts:13` — Систематически отсутствует пустая строка между описанием/расширенным контекстом и секцией @param.
  - *Рек.:* Добавлять пустую комментарную строку `*` перед первым @param в новых/редактируемых блоках; массовое исправление можно сделать кодмодом.
- **[НЕЗНАЧИТЕЛЬНО]** `app/api/server/users/logOutUser.ts:7` — В logOutUser нарушена chain-notation деструктурированных props (объект назван «marker» с полем «marker.marker», описания продублированы) и не задокументировано, что функция выполняется на клиенте, несмотря на путь app/api/server/.
  - *Рек.:* Переписать блок: `@param {LogOutProps} props` + `@param {string} props.marker - Auth-provider marker (e.g. 'email')`, добавить абзац контекста о клиентском выполнении (localStorage) несмотря на путь app/api/server/.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/profile-page/components/SignOutButton.tsx:28` — Однострочный JSDoc над handleLogout не расширен до полной формы при редактировании файла (файл изменён в текущем рабочем дереве).
  - *Рек.:* При текущей правке SignOutButton.tsx расширить JSDoc handleLogout до полной формы; остальные 11 однострочных блоков расширять при следующем редактировании их файлов.

### `rule:localization` — 8

- **[СЕРЬЁЗНО]** `app/page.tsx:79` — Метаданные страниц читают localizeInfos?.plainValue, но у страниц в рантайме этого поля нет — plain-текст приходит в поле plainContent, поэтому description никогда не берётся из CMS.
  - *Рек.:* Заменить чтение на рантайм-поле с кастом, как в правиле: const plain = (page.localizeInfos as { plainContent?: string | null })?.plainContent, и использовать его в description/JSON-LD (лучше — общим хелпером getPagePlainContent(page) в одном файле по конвенции проекта).
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/home/offers-feed/components/parseOffer.ts:48` — У продуктов читается localizeInfos?.plainValue, хотя localizeInfos продукта в рантайме содержит только title — tagline оффера всегда пустой, фолбэки описаний мёртвые.
  - *Рек.:* Убрать чтение plainValue у продуктов; tagline оффера брать из реального источника (атрибут, например description или отдельный offer_tagline в CMS), мёртвые фолбэки заменить на ''.
- **[НЕЗНАЧИТЕЛЬНО]** `components/shared/SignInButton.tsx:35` — Текст кнопки входа {log_in_text?.value} рендерится без английского фолбэка — при недоступном словаре system_content кнопка будет пустой.
  - *Рек.:* Добавить фолбэк: {(log_in_text?.value as string | undefined) || 'Log in'} — по образцу соседних компонентов (BookingButton, RepeatOrder, CardInfo).
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/UserForm.tsx:150` — title={dict?.save_button_text?.value} передаётся в SubmitButton без фолбэка — при недоступном словаре кнопка сохранения профиля останется без текста.
  - *Рек.:* Передавать title={(dict?.save_button_text?.value as string | undefined) || 'Save'}.
- **[НЕЗНАЧИТЕЛЬНО]** `app/api/utils/dictionaries.ts:40` — getDictionary в catch возвращает undefined вместо {}, как предписывает образец правила — тип IAttributeValues | undefined протекает в обязательные пропсы dict: IAttributeValues.
  - *Рек.:* В catch возвращать {} as IAttributeValues и сузить тип возврата до Promise<IAttributeValues>, убрав | undefined; console.log заменить на молчаливую деградацию.
- **[ИНФО]** `components/layout/home/offers-feed/components/OfferInfo.tsx:85` — dict.select_txt?.value рендерится без фолбэка — но компонент OfferInfo сейчас нигде не импортируется (осознанно оставлен на диске).
  - *Рек.:* При возврате компонента в работу добавить фолбэк: {(dict.select_txt?.value as string | undefined) || 'Select'}.
- **[ИНФО] 🔧** `app/api/utils/dictionaries.ts:29` — Словарь UI-строк реализован на блоке system_content (getBlockByMarker) вместо предписанного правилом AttributeSet static_content (getAttributesByMarker), и без центрального хелпера t().
  - *Рек.:* Оставить как есть (задокументированное решение проекта); опционально — завести тонкий хелпер t(dict, marker, fallback) в components/utils.ts, чтобы убрать повторяющиеся касты (value as string | undefined) || '...' и исключить пропуски фолбэков.
- **[ИНФО] 🔧** `components/layout/contacts-page/BookCtaBanner.tsx:30` — Часть UI-микрокопи захардкожена в JSX без словаря (BookCtaBanner «Ready to visit us?», PromoBanner и др.) — помечено в коде как переходное состояние до наполнения system_content.
  - *Рек.:* На следующем этапе наполнения добавить маркеры для этих текстов в system_content и переключить компоненты на dict с сохранением текущих строк как фолбэков.

### `rule:mismatch-log` — 3

- **[СЕРЬЁЗНО] 🔧** `components/data.js:1` — MISMATCH-LOG.md отсутствует в корне проекта при множестве активных триггеров правила (фолбэки/моки для отсутствующих CMS-сущностей, пустые формы, открытые вопросы к клиенту).
  - *Рек.:* Либо завести MISMATCH-LOG.md по шаблону правила и перенести в секцию C незакрытые пункты (opening_time, reviews-контент, bottom_web, поля contact_us/order, события auth, auth_required_text), связав их ссылками на файлы фронта; либо, если решено оставить единый реестр в ONEENTRY-CONTENT-PLAN.md, привести его незакрытые пункты к машиночитаемому формату правила: ID C.x.n с датами, таблицы полей форм marker|type|title, префикс «> ❓ Clarify with the user:» для вопросов.
- **[СЕРЬЁЗНО]** `components/forms/ForgotPasswordForm.tsx:58` — Event-маркеры auth-флоу ('generate_otp', 'generate_code', 'otp') не подтверждены через inspect-api и не отражены ни в одном реестре несоответствий.
  - *Рек.:* Проверить инспекционным скриптом (или в админке) фактические маркеры Events для generateCode/checkCode/changePassword; привести все вызовы к подтверждённым маркерам (устранив расхождение generate_otp/generate_code). До подтверждения — завести пункт C.6 (Events) в реестре несоответствий с перечнем требуемых событий и ссылками на components/forms/ForgotPasswordForm.tsx, VerificationForm.tsx, ResetPasswordForm.tsx.
- **[НЕЗНАЧИТЕЛЬНО]** `components/pages/AuthError.tsx:17` — TODO «Uncomment and use localized text when available» ждёт CMS-текст auth_required_text без пункта в реестре несоответствий — анти-паттерн правила.
  - *Рек.:* Заменить закомментированный код на рабочий паттерн с фолбэком: {auth_required_text?.value || 'Authorization required'} (вместо «ERROR»), убрать TODO; добавить маркер auth_required_text в реестр несоответствий (пункт C.4 — атрибуты словаря system_content) либо сразу завести текст в блоке system_content.

### `rule:orders` — 5

- **[СЕРЬЁЗНО]** `components/layout/booking-page/useBookingSubmit.ts:131` — Активный флоу бронирования жёстко зашивает paymentAccountIdentifier: 'cash' — выбор способа оплаты пользователю не показывается, хотя в проекте настроены 2 платёжных аккаунта (cash и stripe).
  - *Рек.:* В шаге подтверждения бронирования получать storage через Orders.getAllOrdersStorage() (или getOrdersStorageByMarker('orders') — эндпоинт уже есть в RTKApi), брать storage.paymentAccountIdentifiers; при 0 привязанных — фолбэк Payments.getAccounts() с фильтром isVisible && isUsed; при 1 — использовать автоматически; при 2+ — отрендерить выбор всех методов в одном блоке (по умолчанию первый). Если оплата на месте — осознанное продуктовое решение, зафиксировать это как документированное отклонение в CLAUDE.md/плане.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/profile-page/components/ProfileHistory.tsx:74` — Маркеры статусов заказа ('upcoming'/'completed'/'canceled') и их отображаемые названия захардкожены; statusLocalizeInfos и getAllStatusesByStorageMarker не используются нигде в кодовой базе.
  - *Рек.:* Для заголовков/фильтров загрузить список статусов через Orders.getAllStatusesByStorageMarker(storage.identifier), фильтровать по isUsed и сортировать по position; при выводе статуса конкретного заказа — order.statusLocalizeInfos?.title || order.statusIdentifier. Проверки веток UI (кнопки cancel/save) можно оставить по маркерам, но вынести маркеры в именованные константы одного модуля, чтобы переименование в админке правилось в одном месте.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/booking-page/useBookingSubmit.ts:130` — getAllOrdersStorage не вызывается нигде: маркер storage 'orders' и formIdentifier 'order' захардкожены во всех точках работы с заказами.
  - *Рек.:* Один раз получать storage (Orders.getAllOrdersStorage() либо уже существующий RTK-эндпоинт getOrderStorageByMarker) и прокидывать storage.identifier / storage.formIdentifier в createOrder и списки заказов; как минимум — вынести маркеры в общие константы вместо шести разбросанных литералов.
- **[ИНФО]** `app/api/api/RTKApi.ts:303` — Эндпоинт getAccounts отдаёт все платёжные аккаунты без фильтра isVisible && isUsed, предписанного правилом для фолбэка выбора оплаты.
  - *Рек.:* В queryFn применить .filter((a) => a.isVisible && a.isUsed) (или фильтровать на месте использования, когда эндпоинт будет задействован для фолбэка выбора оплаты).
- **[ИНФО]** `app/api/hooks/useCreateOrder.ts:114` — useCreateOrder определяет онлайн-оплату по blacklist (paymentAccountIdentifier !== 'cash') вместо whitelist онлайн-провайдеров, рекомендованного правилом.
  - *Рек.:* Перейти на whitelist по identifier: const isStripe = id === 'stripe'; const isOnline = isStripe /*+ 'paypal' и др. по мере добавления*/; для онлайн не-Stripe — поллинг Payments.getSessionByOrderId (помня, что он возвращает массив).

### `rule:performance` — 10

- **[СЕРЬЁЗНО]** `app/page.tsx:59` — Ни одна CMS-страница не объявляет export const dynamic = 'force-static' и export const revalidate — ISR полностью не настроен.
  - *Рек.:* Добавить на каждую CMS-страницу export const dynamic = 'force-static' и export const revalidate = 60 (300 для страниц с меню/формами/словарём); исключения оставить только для /profile и dev-страниц. Фильтр /reviews перенести в клиентский компонент под <Suspense>. Прогнать next build как детектор.
- **[СЕРЬЁЗНО]** `app/api/server/pages/getPageByUrl.ts:29` — Ни один серверный SDK-фетчер не обёрнут в unstable_cache поверх React cache() — межзапросного кэша и тегов инвалидации нет вообще.
  - *Рек.:* Обернуть каждый фетчер по образцу правила: const impl = unstable_cache(async …, ['oneentry-<имя>'], { revalidate: 60|300, tags: ['oneentry', 'oneentry-pages'|…] }); export const fn = cache(impl). Для getProductsByPageUrl (объектный аргумент) собрать каноническую строку-ключ из limit/offset/handle/searchParams. Поправить устаревший JSDoc в test-connection/route.ts.
- **[СЕРЬЁЗНО]** `app/api/utils/getCachedData.tsx:3` — Словарь system_content кэшируется бессрочным module-level Map без TTL и инвалидации — правки UI-текстов в админке не появятся до рестарта сервера.
  - *Рек.:* Заменить getCachedData на unstable_cache(async () => getBlockByMarker('system_content'), ['oneentry-dictionary'], { revalidate: 300, tags: ['oneentry', 'oneentry-blocks'] }) + обернуть getDictionary в React cache() для дедупликации внутри рендера.
- **[СЕРЬЁЗНО]** `app/layout.tsx:134` — Корневой layout await-ит данные OneEntry (словарь + меню), причём двумя последовательными запросами — весь рендер дерева сериализуется за ними.
  - *Рек.:* Минимум — объединить в Promise.all([getDictionary(), getMenuByMarker('main')]). По правилу — не await-ить вовсе: передавать Promise словаря в клиентский DictProvider с use() (образец в правиле), а Header сделать самостоятельным async-потребителем меню.
- **[СЕРЬЁЗНО]** `app/profile/page.tsx:16` — Страница профиля выполняет три независимых запроса к OneEntry последовательным waterfall'ом вместо Promise.all.
  - *Рек.:* const [dict, pageResult, adminsResult] = await Promise.all([getDictionary(), getPageByUrl('profile'), getAdminsInfo({ body: [], offset: 0, limit: 100 })]).
- **[СЕРЬЁЗНО]** `components/layout/profile-page/components/ProfileHistory.tsx:33` — useSearchParams() в ProfileHistory не обёрнут в <Suspense> нигде по дереву страницы /profile.
  - *Рек.:* Обернуть <ProfileHistory …/> в <Suspense fallback={null}> в profile-page/index.tsx:91. При будущем подключении SearchBar в шапку — тоже только под Suspense.
- **[СЕРЬЁЗНО]** `app/layout.tsx:202` — ToastContainer (react-toastify) и его CSS импортируются статически в корневом layout — тосты попадают в начальный чанк каждой страницы и монтируются сразу, без requestIdleCallback.
  - *Рек.:* Создать components/shared/LazyToastContainer.tsx ('use client', CSS-импорт внутри, export ToastContainer) и ResponsiveToastContainer с dynamic(() => import('./LazyToastContainer'), { ssr: false }) + гейт requestIdleCallback/setTimeout по образцу правила; в layout рендерить обёртку. CSS из layout убрать.
- **[СЕРЬЁЗНО]** `components/layout/masters-page/components/MasterCard.tsx:66` — Повторяющиеся карточки-листинги рендерят <Link> без prefetch={false} — страница /masters с 32 мастерами делает до 32 лишних prefetch-запросов RSC-payload.
  - *Рек.:* Добавить prefetch={false} во все Link повторяющихся карточек листингов (MasterCard, MobileSpecialistList, SpecialistsGrid, GalleryGrid, CatalogCard/CatalogGrid). Дефолтный prefetch оставить только у hero-CTA и пагинации.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/masters-page/components/MasterCard.tsx:31` — Повторяющиеся next/image в карточках мастеров не гейтятся по близости к вьюпорту — хука useNearViewport в проекте нет вообще.
  - *Рек.:* Добавить hooks/useNearViewport.ts по образцу правила (rootMargin ~300px) и монтировать <Image> в MasterCard только при isNear; к hero-изображениям не применять.
- **[ИНФО]** `app/api-test/page.tsx:7` — export const dynamic = 'force-dynamic' на dev-дашборде /api-test — формально запрещённая директива, но страница не CMS-ная и в продакшене отдаёт notFound().
  - *Рек.:* Оставить как есть (dev-инструмент), но актуализировать комментарий-обоснование force-dynamic, чтобы он не ссылался на несуществующий useSearchParams в layout.

### `rule:performance-bundle` — 8

- **[СЕРЬЁЗНО]** `app/store/providers/AuthContext.tsx:8` — OneEntry SDK попадает в клиентский бандл: 'use client'-файлы импортируют SDK-синглтон (getApi/reDefine/syncTokens/hasActiveSession) из app/api/api/api.ts, где defineOneEntry выполняется на уровне модуля.
  - *Рек.:* Перенести все вызовы SDK на сервер: заменить прямые вызовы getApi() в формах и AuthContext на server actions / route handlers (auth, формы, logout), а RTK Query перевести на HTTP-запросы к этим роутам вместо fakeBaseQuery с SDK. Хранение refresh-токена перенести из localStorage в httpOnly-cookie на роутах. Как минимум — не импортировать app/api/api/api.ts (напрямую или через баррель '@/app/api') из файлов с 'use client'.
- **[СЕРЬЁЗНО] 🔧** `app/api/index.ts:1` — Баррель app/api/index.ts реэкспортирует SDK-синглтон, RTK Query и все 19 серверных обёрток одним файлом; из него импортируют ~80 файлов, включая клиентские компоненты.
  - *Рек.:* Удалить баррель (или перестать добавлять в него новые экспорты) и перевести потребителей на прямые subpath-импорты: import { getApi } from '@/app/api/api/api', import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl' и т.д. Обновить конвенцию в CLAUDE.md. Минимум — разделить клиентскую (RTK-хуки) и серверную (обёртки SDK) части на разные точки входа, чтобы клиентские импорты не резолвили серверный граф.
- **[СЕРЬЁЗНО]** `components/layout/modal/index.tsx:8` — Баррель components/forms/index.tsx и namespace-импорт import * as forms в клиентской модалке рут-лейаута кладут все 7 форм (каждая тянет SDK) в first-load JS каждой страницы.
  - *Рек.:* Заменить import * as forms на явную map с dynamic()-импортами каждой формы (const formsMap = { SignInForm: dynamic(() => import('@/components/forms/SignInForm')), … }) — формы событийные, чанк подгрузится при открытии модалки. Баррель components/forms/index.tsx удалить или перестать использовать; в ProfileCard импортировать UserForm напрямую из '@/components/forms/UserForm'.
- **[НЕЗНАЧИТЕЛЬНО]** `package.json:5` — @next/bundle-analyzer не установлен и не подключён: нет пакета в devDependencies, нет скрипта analyze, next.config.ts не обёрнут в withBundleAnalyzer.
  - *Рек.:* Установить @next/bundle-analyzer, обернуть nextConfig в withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' }) в next.config.ts, добавить скрипт "analyze": "cross-env ANALYZE=true next build" (Windows — через cross-env) и проверить бюджет 200 KB gzipped для маршрута /.
- **[НЕЗНАЧИТЕЛЬНО]** `app/layout.tsx:23` — dynamic() применён к лёгким, всегда рендерящимся компонентам (Header, Footer, BottomMenu, IntroAnimations, все секции главной, DropdownIcon) вместо модулей ≥ 30 KB или событийных.
  - *Рек.:* Заменить перечисленные dynamic() на обычные статические импорты (для route-уровня Next.js и так делает code-splitting по маршрутам). dynamic() оставить только для реально тяжёлых или событийных модулей (модалка форм, лайтбокс).
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/gallery-grid/components/GalleryGrid.tsx:7` — Лайтбокс photoswipe импортируется статически, хотя открывается только по клику: react-photoswipe-gallery статически тянет ядро photoswipe (~189 KB esm до минификации) в чанки маршрутов галереи и мастера.
  - *Рек.:* Вынести grid-компоненты с photoswipe в dynamic(() => import(...), { ssr: false }) на уровне их index.tsx (учтя паттерн статического CSS-импорта внутри ленивого модуля из performance.md), либо перейти на photoswipe-lightbox с ленивой загрузкой ядра (pswpModule: () => import('photoswipe')).
- **[НЕЗНАЧИТЕЛЬНО]** `next.config.ts:11` — lucide-react отсутствует в experimental.optimizePackageImports, хотя импортируется в 58 файлах app/ и components/.
  - *Рек.:* Добавить 'lucide-react' в experimental.optimizePackageImports в next.config.ts рядом с 'gsap' и 'react-toastify'.
- **[НЕЗНАЧИТЕЛЬНО]** `components/icons/index.tsx:1` — Собственные баррели иконок components/icons/index.tsx и components/icons/catalog/index.tsx потребляются через import * as icons, что отключает tree-shaking.
  - *Рек.:* В SocialButtons и CatalogCardIcon заменить import * as icons на явную map из subpath-импортов нужных иконок (как уже сделано в остальных 17 потребителях); баррели после этого перестать использовать (удалять без явной просьбы нельзя — конвенция проекта).

### `rule:performance-gsap` — 5

- **[СЕРЬЁЗНО]** `app/animations/RegisterGSAP.tsx:22` — ScrollToPlugin регистрируется жадно в глобальном RegisterGSAP, хотя используется только при переходах между маршрутами.
  - *Рек.:* Убрать импорт и регистрацию ScrollToPlugin из RegisterGSAP (оставить только core gsap + useGSAP + ScrollTrigger). В TransitionProvider реализовать ensureScrollToPlugin() по образцу из правила: динамический import('gsap/dist/ScrollToPlugin') с идемпотентным флагом и дедупликацией промиса, вызов fire-and-forget в leave-обработчике плюс нативный фолбэк window.scrollTo({ top: 0 }) для первой навигации, пока чанк не загрузился.
- **[НЕЗНАЧИТЕЛЬНО]** `app/animations/TransitionProvider.tsx:33` — gsap.timeline().set(window, { scrollTo: 0 }) без локальной защиты ensureScrollToPlugin() и без нативного фолбэка.
  - *Рек.:* При переводе ScrollToPlugin на ленивую регистрацию добавить в leave-обработчик паттерн из правила: ensureScrollToPlugin() (fire-and-forget) + ветка `if (scrollToPluginRegistered) { … scrollTo-твин … } else { window.scrollTo({ top: 0, behavior: 'auto' }); }`.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/home/catalog-grid/animations/BgAnimations.tsx:51` — Системное отсутствие { scope: ref } в вызовах useGSAP: scope задан только в 1 из 31 вызова по проекту.
  - *Рек.:* Добавить { scope: ref } вторым аргументом useGSAP во всех анимационных компонентах (ref на корневой контейнер уже есть почти везде). В BgAnimations и HeroAnimations перевести '#beauty_bg'/'#salon_bg'/'.bg-gradient-1' на селекторы, резолвящиеся внутри scope. Для IntroAnimations ('.fade-in' — элементы вне поддерева) — либо поднять scope на общий контейнер, либо передавать цели через рефы/контекст.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/mobile-menu/animations/MobileMenuAnimations.tsx:42` — Твины мобильного меню таргетят глобальные id '#modalBg'/'#modalBody', которые также используются модалкой форм — латентный конфликт целей анимации.
  - *Рек.:* Таргетить узлы через ref.current и querySelector от ref (как сделано в ModalAnimations.tsx:51-54) либо добавить { scope: ref } и локальные селекторы; исключить дублирование id между мобильным меню и модалкой.
- **[НЕЗНАЧИТЕЛЬНО]** `next.config.ts:11` — В experimental.optimizePackageImports указан 'gsap', но отсутствует '@gsap/react'.
  - *Рек.:* Добавить '@gsap/react' в массив: optimizePackageImports: ['gsap', '@gsap/react', 'react-toastify'].

### `rule:performance-images` — 12

- **[СЕРЬЁЗНО]** `next.config.ts:25` — minimumCacheTTL: 60 — на 3 порядка ниже требуемого правилом минимума (>= 86400, рекомендовано 30 дней)
  - *Рек.:* Поставить minimumCacheTTL: 60 *60* 24 * 30 (30 дней) — URL файлов OneEntry контентно-адресуемые (это уже отражено в комментарии getLqipPreview.ts про месячный revalidate).
- **[СЕРЬЁЗНО]** `next.config.ts:26` — deviceSizes: [640, 1920] не соответствует реальным брейкпоинтам — всё шире 640 CSS px получает вариант 1920w
  - *Рек.:* Расширить до сетки проекта: deviceSizes: [640, 768, 1024, 1280, 1920].
- **[СЕРЬЁЗНО]** `components/shared/Image.tsx:87` — Кастомный компонент Image рендерит CMS-изображения сырым <img>, полностью обходя next/image
  - *Рек.:* Вернуть next/image (в GalleryGridCell — fill + sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw" под сетку grid-cols-2/3/5); blur из item.preview уже готов. Кастомную обёртку оставить только если нужен эффект LQIP-фейда — но внутри рендерить next/image, а не <img>.
- **[СЕРЬЁЗНО]** `components/layout/portfolio-grid/components/PortfolioGallery.tsx:51` — Сетка портфолио мастера рендерит полноразмерный downloadLink сырым <img>
  - *Рек.:* Заменить на next/image: src={item.thumb || item.img}, fill + sizes под grid-cols-2/3/5, placeholder='blur' с blurDataURL={item.preview}. Полноразмерный item.img оставить только лайтбоксу.
- **[СЕРЬЁЗНО]** `components/layout/home/gallery-feed/components/GalleryGrid.tsx:31` — GALLERY-стрип главной рендерит полноразмерные CMS-фото сырым <img>
  - *Рек.:* Перевести плитки на next/image (fill + sizes="(min-width:1024px) 16vw, (min-width:640px) 33vw, 50vw" под grid-cols-2/3/6) с placeholder='blur' из preview; либо убрать бесполезный вызов getLqipPreview из gallery-feed/index.tsx:168, раз preview не отображается.
- **[СЕРЬЁЗНО]** `components/layout/home/home-hero/components/HeroSlider.tsx:80` — Два priority-изображения на главном роуте: desktop- и mobile-версии первого слайда преложатся обе на любом вьюпорте
  - *Рек.:* Оставить один LCP-кандидат: рендерить одну <Image> с art-direction через getImageProps + <picture>/<source media>, либо ставить priority только мобильной версии, а десктопной — loading='eager' без preload (или наоборот, по доминирующему трафику).
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/home/masters-feed/components/SpecialistsGrid.tsx:33` — Стрип «Our Specialists» на главной рендерит master_image сырым <img> вместо next/image
  - *Рек.:* Заменить на next/image (fill + sizes под grid-cols-2/3/6, например "(min-width:1024px) 16vw, (min-width:640px) 33vw, 50vw").
- **[НЕЗНАЧИТЕЛЬНО]** `components/hooks/getLqipPreview.ts:18` — LQIP генерируется сетевым fetch исходника + lqip-modern + unstable_cache — правило требует брать готовый base64 из previewLink без fetch и кэша
  - *Рек.:* Основной путь — только previewLink.default[0] (уже реализован в getGalleryImageUrls); генерацию оставить исключительно для легаси-файлов без previewLink и удалить вызов из gallery-feed, где preview не отображается. Лучше — перезалить старые файлы, чтобы у всех был previewLink.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/master-single/components/MasterImage.tsx:35` — Безусловная генерация LQIP через getLqipPreview(imageSrc) вместо готового previewLink (компонент сейчас не подключён)
  - *Рек.:* При возврате компонента в работу передавать в него готовый LQIP из previewLink (previewLink.default[0]) пропсом вместо вызова getLqipPreview.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/gallery-grid/components/GalleryCardImage.tsx:93` — priority={'high'} на каждой повторяющейся карточке галереи и нет loading="lazy" (неиспользуемый legacy-компонент)
  - *Рек.:* При реанимации компонента: убрать priority с карточек, добавить loading="lazy" (плюс useNearViewport по performance.md).
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/portfolio-grid/components/PortfolioCardImage.tsx:80` — priority="high" на каждой карточке портфолио и нет loading="lazy" (неиспользуемый legacy-компонент)
  - *Рек.:* При возврате в работу: priority убрать, loading="lazy" добавить, размеры для лайтбокса брать из метаданных CMS, а не скачиванием оригинала.
- **[ИНФО]** `next.config.ts:23` — imageSizes не задан — используется дефолт из 8 значений
  - *Рек.:* Добавить imageSizes: [16, 32, 64, 128, 256, 384] в images.

### `rule:performance-popups` — 3

- **[СЕРЬЁЗНО]** `app/layout.tsx:196` — Modal и OffscreenModal статически импортированы и отрендерены прямо в RootLayout — паттерн popupRegistry + PopupRoot отсутствует, весь код попапов попадает в начальный бандл
  - *Рек.:* Внедрить паттерн из правила: создать components/layout/popupRegistry.ts с лоадерами `Modal: () => import('@/components/layout/modal')` и `MobileMenu: () => import('@/components/layout/mobile-menu')` (mobile-menu — как drawer в DRAWER_POPUPS) и components/layout/PopupRoot.tsx, который подписан на OpenDrawerContext и монтирует через dynamic() только активный попап (component === 'MobileMenu' → OffscreenModal, любое имя формы → Modal). В app/layout.tsx заменить <Modal dict={dict} /> и <OffscreenModal menu={menu} /> на один <PopupRoot dict={dict} menu={menu} />.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/header/nav/NavItemProfile.tsx:43` — Ни один триггер попапов не префетчит чанк на onPointerEnter/onFocus — механизм prefetchPopup отсутствует
  - *Рек.:* Вместе с внедрением popupRegistry добавить на каждый триггер onPointerEnter={() => prefetchPopup('SignInForm')} и onFocus={() => prefetchPopup('SignInForm')} (для мобильного меню — 'MobileMenu'); prefetchPopup должен резолвить имена форм в чанк Modal через тот же реестр лоадеров.
- **[ИНФО]** `components/layout/modal/index.tsx:96` — Modal сам не проверяет open — гейтинг делегирован внутреннему ModalAnimations, что структурно повторяет ❌-пример правила
  - *Рек.:* Добавить в начало Modal явный гейт по контексту: `const { open, component } = useContext(OpenDrawerContext); if (!open || !Form) return <></>;` — тогда гейтинг не зависит от внутренностей ModalAnimations. OffscreenModal (mobile-menu/index.tsx:55) уже сделан правильно — взять его за образец.

### `rule:performance-rtk` — 7

- **[СЕРЬЁЗНО]** `app/store/providers/AuthContext.tsx:108` — pollingInterval для getMe равен 3000 мс — в 10 раз меньше минимума 30000 мс из правила, без обосновывающего комментария.
  - *Рек.:* Поднять интервал до 60000 мс (рекомендация правила для keepalive-сессии) или больше; рассмотреть refetchOnFocus: true на корневом API как более дешёвую альтернативу. Если 3с действительно нужны — добавить обосновывающий комментарий, но по правилу это «почти никогда не оправдано».
- **[НЕЗНАЧИТЕЛЬНО]** `app/store/providers/AuthContext.tsx:88` — Данные getMe из RTK Query дублируются в локальном состоянии контекста (useState user + setUser).
  - *Рек.:* Читать данные пользователя напрямую из состояния хука (второй элемент кортежа useLazyGetMeQuery содержит data) или из селектора кэша RTKApi.endpoints.getMe.select(), а локальный useState для user убрать — оставить только производные флаги isAuth/isLoading.
- **[НЕЗНАЧИТЕЛЬНО]** `app/api/api/RTKApi.ts:373` — Пишущая операция updateOrderByMarkerAndId объявлена как build.query с providesTags вместо build.mutation с invalidatesTags.
  - *Рек.:* Удалить query-вариант updateOrderByMarkerAndId (дубликат мутации updateOrder) или переоформить его в build.mutation с invalidatesTags: ['Orders'] — по правилу проекта «ничего не удалять без просьбы» согласовать удаление с пользователем.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/home/offers-feed/components/OfferCard.tsx:65` — useGetPageByIdQuery({ id: firstServiceParentId }) без опции skip — id может быть 0, а данные нужны только по клику Book.
  - *Рек.:* Добавить второй аргумент `{ skip: !firstServiceParentId }` во всех трёх местах; в идеале — загружать страницу лениво в момент клика (экспортировать useLazyGetPageByIdQuery и вызывать trigger в handleBook), раз данные нужны только для перехода в booking.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/header/search/SearchResultsList.tsx:62` — Страницы продуктов в поиске загружаются вручную в useEffect и дублируются в локальном useState в обход существующего RTK-эндпоинта getPageById.
  - *Рек.:* Резолвить страницы через кэш RTK: либо useGetPageByIdQuery в дочернем компоненте строки результата (по одному id на строку — кэш и дедупликация бесплатно), либо отдельный RTK-эндпоинт getPagesByIds. Локальный state pages убрать.
- **[ИНФО]** `app/api/hooks/useSearchProducts.ts:44` — Поиск-по-мере-набора реализован ручным useEffect + useState вне RTK Query, хотя правило прямо относит этот сценарий к домену RTK.
  - *Рек.:* Перенести поиск в RTK-эндпоинт searchProducts: build.query<IProductsEntity[], { name: string }> с keepUnusedDataFor ~300 и использовать useSearchProductsQuery({ name }, { skip: !name }) — кэш повторных запросов, дедупликация и isError бесплатно.
- **[ИНФО]** `components/layout/profile-page/components/ProfileHistory.tsx:46` — Список заказов профиля загружается вручную (useEffect + setRefetch-пропсы) вместо RTK-запроса с providesTags и инвалидации мутацией.
  - *Рек.:* Перевести список заказов на RTK-query (providesTags: ['Orders']) и отмену/перенос — на мутацию useUpdateOrderMutation (invalidatesTags: ['Orders']); прокидывание setRefetch через дерево пропсов исчезнет.

### `rule:performance-streaming` — 8

- **[СЕРЬЁЗНО]** `app/services/page.tsx:31` — Почти ни у одного route-сегмента с CMS-загрузкой нет соседнего loading.tsx — навигация «зависает» до разрешения всех запросов OneEntry.
  - *Рек.:* Добавить loading.tsx рядом с page.tsx каждого перечисленного сегмента; скелетон строить теми же grid/размерными классами, что и финальный лейаут страницы (hero-полоса, фильтры, сетка карточек), чтобы не было CLS.
- **[СЕРЬЁЗНО]** `app/booking/page.tsx:32` — Тяжёлые блоки страниц не вынесены в отдельные async-компоненты под локальный <Suspense> — вся страница блокируется самым медленным запросом.
  - *Рек.:* На каждой из этих страниц оставить в page.tsx только быстрые запросы (getPageByUrl, getDictionary), а тяжёлый блок (каталог, wizard-данные, галерея) вынести в отдельный async server-компонент и обернуть в <Suspense fallback={<Skeleton/>}> — по образцу app/masters/[handle]/page.tsx.
- **[СЕРЬЁЗНО]** `app/masters/[handle]/page.tsx:126` — getAdminsInfo не обёрнут в React cache() и выполняется 4 раза за один рендер /masters/{id} — это POST-запрос, который Next.js не мемоизирует.
  - *Рек.:* Создать разделяемый фетчер, например const getMastersList = cache(() => getAdminsInfo({ body: [], offset: 0, limit: 100 })), и использовать его в generateMetadata, page.tsx, MasterSingleLayout и PortfolioGridLayout — по образцу getHomePage в app/page.tsx:17.
- **[СЕРЬЁЗНО]** `app/gallery/[handle]/loading.tsx:17` — Единственный loading.tsx в проекте не совпадает с финальным лейаутом галереи — гарантированный CLS при подмене скелетона контентом.
  - *Рек.:* Переверстать loading.tsx под текущий дизайн: градиентная полоса + плейсхолдер фильтр-бара фиксированной высоты + сетка с теми же классами grid grid-cols-2 gap-3 px-3 sm:grid-cols-3 md:gap-4 md:px-6 lg:grid-cols-5 и ячейками aspect-4/5 rounded-2xl animate-pulse.
- **[СЕРЬЁЗНО]** `components/layout/master-single/components/MasterLoader.tsx:106` — Suspense-fallback профиля мастера (MasterLoader) рендерит лишнюю секцию портфолио-грида высотой min-h-[50vh], которой нет в реальном MasterSingleLayout, — крупный сдвиг лейаута.
  - *Рек.:* Удалить из MasterLoader секцию с гридом (строки 106-125) — оставить только скелетон профильной карточки, совпадающий по размерам с MasterSingleLayout; за скелетон портфолио отвечает PortfolioGridLoader.
- **[НЕЗНАЧИТЕЛЬНО]** `app/services/page.tsx:81` — getPageByUrl дублируется между generateMetadata и телом страницы без React cache() на ~10 роутах — паттерн cache() применён только на главной.
  - *Рек.:* По образцу app/page.tsx завести в каждом page.tsx const getXxxPage = cache(() => getPageByUrl('xxx')) (для динамических роутов — cache((url: string) => getPageByUrl(url))) и вызывать её и из generateMetadata, и из компонента страницы.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/portfolio-grid/components/PortfolioGridLoader.tsx:11` — Скелетон портфолио (PortfolioGridLoader) не совпадает с финальной сеткой PortfolioGallery — другое число колонок, гаттеры и высота ячеек.
  - *Рек.:* Переверстать PortfolioGridLoader теми же классами, что и PortfolioGallery (заголовок-плейсхолдер + grid-cols-2/sm:3/lg:5, gap-3/4, px, aspect-4/5 rounded-2xl animate-pulse).
- **[ИНФО]** `next.config.ts:5` — PPR не задействован вовсе, хотя проект на Next.js 16 и правило рекомендует инкрементальное включение.
  - *Рек.:* После вынесения тяжёлых блоков в Suspense (см. major-находку) рассмотреть experimental: { ppr: 'incremental' } и export const experimental_ppr = true на /services и /booking — статичный hero будет пререндерен, каталог достримится.

### `rule:playwright-e2e` — 4

- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/SignInForm.tsx:147` — Корневые контейнеры фич (формы, карточки, страницы) не имеют data-testid — конвенция правила выполнена только для поиска в шапке
  - *Рек.:* Добавить data-testid по конвенции правила: корневые контейнеры (auth-form, booking-wizard, products-table, master-card + data-master-id), интерактивные элементы (auth-submit, booking-continue), состояния (auth-error, booking-success), динамические поля data-testid={`auth-field-${field.marker}`}. Тесты переписать на getByTestId/скоуп по контейнеру.
- **[НЕЗНАЧИТЕЛЬНО]** `tests/e2e/booking.spec.ts:32` — Тесты обходят strict mode через .first() на неоднозначных текстовых/ролевых селекторах вместо скоупа по контейнеру с data-testid
  - *Рек.:* После добавления data-testid корневым контейнерам визарда (см. смежную находку) заменить .first() на скоуп: например page.getByTestId('booking-step').getByRole('button', { name: /continue/i }).
- **[НЕЗНАЧИТЕЛЬНО]** `playwright.config.ts:10` — В playwright.config.ts не подняты централизованные тайм-ауты (timeout, expect.timeout, actionTimeout, navigationTimeout); сетевые ожидания в спеках — 15s вместо 30s
  - *Рек.:* Добавить в defineConfig: timeout: 60_000, expect: { timeout: 15_000 }, use: { actionTimeout: 15_000, navigationTimeout: 30_000 }. В спеках поднять явные тайм-ауты сетевых ожиданий до 30_000.
- **[НЕЗНАЧИТЕЛЬНО]** `tests/e2e/smoke.spec.ts:24` — Тест not-found не проверяет UI страницы 404 — его ассерты проходят на любой странице
  - *Рек.:* Ассертить содержимое not-found UI: например await expect(page.getByRole('link', { name: /return home/i })).toBeVisible() или заголовок 404-страницы; ещё надёжнее — добавить data-testid="not-found" в app/not-found.tsx и проверять его видимость (плюс toHaveCount(0) для root-testid обычной страницы).

### `rule:product-statuses` — 3

- **[НЕЗНАЧИТЕЛЬНО]** `app/api/utils/getSearchParams.ts:36` — Захардкожен маркер статуса продукта 'in_stock' вместо получения реальных маркеров через ProductStatuses.getProductStatuses().
  - *Рек.:* Либо удалить/закомментировать мёртвую ветку in_stock до реальной потребности, либо перед использованием проверить фактические маркеры статусов проекта (getProductStatuses() или инспекционный скрипт .claude/temp/inspect-*.mjs) и брать маркер из полученного списка, а не из строкового литерала.
- **[НЕЗНАЧИТЕЛЬНО]** `app/api/utils/getSearchParams.ts:35` — Запись body, несущая statusMarker, не является catch-all по образцу правила: attributeMarker 'price' без conditionMarker и с conditionValue: null.
  - *Рек.:* Прикрепить statusMarker к существующей записи servicesFilter (spread: { ...servicesFilter, statusMarker }) вместо добавления второй записи с неопределённой семантикой; отдельный catch-all нужен только когда других фильтров в body нет.
- **[ИНФО]** `app/api/utils/getSearchParams.ts:17` — Избыточное расширение типа IFilterParams & { statusMarker?: string } — в установленном SDK 1.0.155 IFilterParams уже содержит statusMarker.
  - *Рек.:* Заменить тип на чистый IFilterParams[] в обоих местах (строки 17–18) — statusMarker типизирован самим SDK.

### `rule:server-actions` — 5

- **[СЕРЬЁЗНО]** `components/forms/VerificationForm.tsx:71` — Результаты checkCode/activateUser проверяются truthiness-проверкой `if (result)` вместо isError — объект IError истинный, при неверном OTP пользователь проходит дальше.
  - *Рек.:* Заменить truthiness-проверки на `if (isError(result)) { setError(result.message); return; }` для checkCode, activateUser и generateCode (isError уже импортирован в файле и используется для auth на строке 108).
- **[СЕРЬЁЗНО]** `components/forms/ForgotPasswordForm.tsx:55` — Результат AuthProvider.generateCode не проверяется через isError — форма ввода кода открывается даже если код не был отправлен.
  - *Рек.:* const res = await getApi().AuthProvider.generateCode(...); if (isError(res)) { setError(res.message); if (res.statusCode === 400) {...} return; } setComponent('VerificationForm').
- **[СЕРЬЁЗНО]** `components/forms/ContactUsForm.tsx:90` — Результат FormData.postFormsData не проверяется через isError — ошибка отправки формы молча проглатывается.
  - *Рек.:* Сохранить результат, добавить `if (isError(res)) { setError(res.message); return; }`, при успехе — явную индикацию отправки.
- **[НЕЗНАЧИТЕЛЬНО]** `app/api/server/users/logOutUser.ts:19` — User-authorized вызов AuthProvider.logout и работа с localStorage лежат в каталоге серверных обёрток app/api/server/ — вызов из Server Component (как подсказывает расположение) упадёт.
  - *Рек.:* Перенести файл из app/api/server/users/ в клиентский слой (например, app/api/hooks/ или app/api/client/users/) либо добавить директиву 'use client' / комментарий, фиксирующий клиентскую природу функции; экспорт в app/api/index.ts сохранить.
- **[ИНФО]** `app/api/server/users/updateUserState.ts:25` — User-authorized обёртки Users/Orders (updateUserState, getAllOrdersByMarker, updateOrderByMarkerAndId) размещены в app/api/server/, хотя по правилу это методы для Client Component.
  - *Рек.:* Переместить user-authorized обёртки из app/api/server/ в отдельный клиентский слой (app/api/client/ или hooks) или задокументировать в JSDoc, что функции предназначены только для клиентского исполнения после reDefine().

### `skill:create-auth` — 12

- **[КРИТИЧНО]** `components/forms/VerificationForm.tsx:139` — Устаревшее замыкание: handleVerification мемоизирован без otp в зависимостях — в activateUser/checkCode всегда уходит пустой/устаревший код
  - *Рек.:* Добавить otp (а также action, login, router, setComponent, setOpen) в зависимости useCallback либо передавать код аргументом: handleVerification(code) из onSubmitHandle. Убрать eslint-disable, который маскирует проблему.
- **[СЕРЬЁЗНО]** `components/forms/VerificationForm.tsx:74` — eventIdentifier захардкожены и не согласованы между generate и check: 'generate_otp' vs 'otp' vs 'generate_code'
  - *Рек.:* Проверить реальные маркеры событий в админке (раздел Events) инспекционным скриптом, вынести их в общие константы (например EVENT_PASSWORD_RESET) и использовать ОДИН и тот же маркер в generateCode, checkCode и changePassword; для resend — тот же маркер, что и при первичной генерации.
- **[СЕРЬЁЗНО]** `components/forms/VerificationForm.tsx:81` — Результаты checkCode/activateUser/generateCode не проверяются через isError — IError-объект truthy и трактуется как успех
  - *Рек.:* После каждого вызова checkCode/activateUser/generateCode проверять isError(result) и выводить result.message; для checkCode дополнительно обрабатывать result === false (неверный код) отдельным сообщением.
- **[СЕРЬЁЗНО]** `components/forms/ResetPasswordForm.tsx:82` — Результат changePassword не проверяется через isError: ошибка (IError truthy) показывается как успешная смена пароля
  - *Рек.:* Проверять isError(result) и показывать result.message; переключаться на SignInForm только при result === true, при false выводить понятную ошибку.
- **[СЕРЬЁЗНО]** `components/forms/ForgotPasswordForm.tsx:55` — Результат generateCode не проверяется: при ошибке пользователь всё равно попадает на форму ввода кода; catch — мёртвый код
  - *Рек.:* Сохранить результат generateCode, проверить isError(result); переходить к VerificationForm только при успехе, при ошибке показывать result.message (обработку statusCode перенести из catch в ветку isError).
- **[СЕРЬЁЗНО]** `components/forms/SignInForm.tsx:113` — Вкладка 'phone' нерабочая: маркер провайдера угадан, а authData всегда шлёт email_reg/password_reg независимо от вкладки
  - *Рек.:* Либо убрать вкладку 'phone' до появления соответствующего провайдера в админке, либо получать провайдеров через useGetAuthProvidersQuery и строить authData динамически из полей формы по флагам isLogin/isPassword (как уже сделано в SignUpForm).
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/SignUpForm.tsx:99` — В маршрутизации/видимости полей регистрации не учитывается флаг isSignUpRequired
  - *Рек.:* Добавить isSignUpRequired в тип FormField и в условие видимости: `f.isSignUp === true || f.isSignUpRequired === true`; учитывать его же при определении обязательности поля в режиме регистрации.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/VerificationForm.tsx:162` — Кнопка «Resend» без cooldown-таймера — скилл требует обязательный кулдаун (config.systemCodeTlsSec, по умолчанию 80 сек)
  - *Рек.:* Добавить состояние resendCooldown с интервал-таймером (по образцу startCooldown из скилла), блокировать кнопку на время кулдауна и запускать его после signUp и каждого resend.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/SignUpForm.tsx:180` — formIdentifier 'reg' и маркер провайдера 'email' захардкожены; getAuthProviders реализован в RTK, но нигде не используется
  - *Рек.:* Получать провайдеров через useGetAuthProvidersQuery, брать identifier/formIdentifier/isCheckCode из ответа (с фолбэком на 'email'/'reg'), а при пустом списке провайдеров скрывать формы авторизации (деградация без ошибок).
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/profile-page/components/SignOutButton.tsx:31` — logout вызывается с захардкоженным маркером 'email' — сохранённый authProviderMarker из localStorage не используется
  - *Рек.:* В обоих местах вызывать logOutUser({ marker: localStorage.getItem('authProviderMarker') || 'email' }) либо перенести чтение маркера внутрь logOutUser.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/inputs/FormInput.tsx:39` — Тип инпута и обязательность определяются по имени маркера и requiredValidator.strict, а не по флагам поля
  - *Рек.:* Пробрасывать в FormInput флаги isPassword/isLogin/isNotificationEmail (они уже типизированы в SignUpForm.FormField) и определять type/required по ним; маркерную эвристику оставить только как фолбэк для confirm-password.
- **[НЕЗНАЧИТЕЛЬНО]** `app/store/providers/AuthContext.tsx:108` — Поллинг getMe каждые 3 секунды вместо рекомендованных скиллом 30 секунд
  - *Рек.:* Увеличить pollingInterval до ~30000 мс (или отключить поллинг вовсе, если синхронизация состояния между устройствами не нужна для букинг-сценария).

### `skill:create-cart-manager` — 2

- **[НЕЗНАЧИТЕЛЬНО]** `app/store/providers/AuthContext.tsx:179` — Мёртвый недостроенный путь синхронизации корзины через user.state.cart: эффект «Load cart from user state» ничего не загружает, а пишущая сторона никем не вызывается
  - *Рек.:* Либо достроить путь (писать корзину мутацией useUpdateUserStateMutation в местах изменения CartSlice и реально гидрировать Redux из user.state.cart в эффекте; при этом сохранять исходные типы formData, а не 'string'), либо перейти на нативный cart API по рецепту, либо — минимум — исправить вводящий в заблуждение комментарий «Load cart from user state» и пометить updateUserState как незадействованный легаси (удалять без явной просьбы пользователя нельзя по конвенциям проекта).
- **[ИНФО] 🔧** `app/store/reducers/CartSlice.ts:84` — Корзина реализована по альтернативному паттерну Redux+redux-persist (клиентская), а не на нативном серверном cart API из рецепта
  - *Рек.:* Ничего менять не требуется. Если когда-нибудь понадобится кросс-девайс-корзина — SDK уже подходящей версии (oneentry ^1.0.155 ≥ 1.0.154), можно перейти на Users.getCart/addCartItem по рецепту; учесть, что addCartItem — upsert (ставит qty, не инкремент), а cart.total — количество позиций, не деньги.

### `skill:create-checkout` — 5

- **[СЕРЬЁЗНО]** `components/layout/booking-page/useBookingSubmit.ts:37` — Интервал записи создаётся в локальной таймзоне браузера, а профиль читает его через getUTC* — время визита в заказе смещается на смещение таймзоны клиента
  - *Рек.:* Строить интервал в UTC (например, `new Date(Date.UTC(y, m, d, hh, mm))` в toInterval), чтобы выбранный слот «14:00» хранился как 14:00Z и чтение через getUTC* в OrderDateTime возвращало ровно выбранное время — это конвенция рецепта. Либо согласовать чтение (локальные getHours) с записью, но тогда время будет зависеть от таймзоны просмотра.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/booking-page/useBookingSubmit.ts:131` — paymentAccountIdentifier захардкожен как 'cash', хотя в админке заведены 2 платёжных аккаунта (cash и stripe) — рецепт требует выбор способа оплаты при 2+
  - *Рек.:* Читать paymentAccountIdentifiers из order storage (getAllOrdersStorage / getOrdersStorageByMarker) и при 2+ аккаунтах показывать выбор оплаты в шаге подтверждения; для stripe после createOrder вызывать Payments.createSession и редиректить на paymentUrl (логика уже готова в useCreateOrder). Если cash-only — осознанное решение, зафиксировать это в плане/CLAUDE.md.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/booking-page/useBookingSubmit.ts:129` — Маркер storage 'orders', formIdentifier 'order' и маркеры полей формы ('master', 'order_salon', 'interval') захардкожены — рецепт предписывает брать formIdentifier из getAllOrdersStorage(), а поля из getFormByMarker
  - *Рек.:* Минимум — вынести маркеры в константы одного модуля; лучше — получать formIdentifier из Orders.getAllOrdersStorage() (или getOrdersStorageByMarker('orders'), эндпоинт уже есть в RTKApi:318) и сверять отправляемые маркеры полей с getFormByMarker(formIdentifier), когда форма 'order' будет наполнена полями в админке.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/booking-page/components/DateTimeStep.tsx:169` — Слоты времени — статический моковый массив TIMES, доступность слотов из timeInterval-атрибута формы не читается
  - *Рек.:* При наполнении формы 'order' атрибутом interval (timeInterval) читать слоты через getFormByMarker → localizeInfos.intervals[*].timeIntervals (парсинг/фильтрация — по утилитам из рецепта) и оставить TIMES как фолбэк на случай пустой формы.
- **[ИНФО]** `app/api/hooks/useCreateOrder.ts:56` — В useCreateOrder.createSession отсутствие session.paymentUrl проглатывается молча — рецепт требует явную ошибку; редирект на внешний paymentUrl сделан через router.push
  - *Рек.:* При подключении хука добавить ветку ошибки: если !session.paymentUrl — setError('Payment session has no paymentUrl') и return 'payment_error'; внешний редирект выполнять через window.location.href вместо router.push.

### `skill:create-form` — 9

- **[СЕРЬЁЗНО]** `components/layout/contacts-page/ContactFormCard.tsx:119` — Результат FormData.postFormsData не проверяется через isError — при ошибке API пользователь видит «Message sent!»
  - *Рек.:* Присвоить результат postFormsData переменной, проверить isError(result) и при ошибке ставить setError (по рецепту — с маппингом result.message через сообщения валидаторов полей), не вызывая setSent(true).
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/ContactUsForm.tsx:56` — Отправка ContactUsForm заблокирована навсегда: guard требует token, но FormCaptcha никогда его не устанавливает
  - *Рек.:* Блокировать сабмит только когда у формы реально есть spam-поле и капча не пройдена (по рецепту: isCaptcha && !isCaptchaValid); либо, раз компонент легаси и живая форма — ContactFormCard, явно пометить его как неиспользуемый.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/inputs/FormCaptcha.tsx:21` — FormCaptcha — нерабочая заглушка: hardcoded тестовый siteKey, проп captchaKey игнорируется, токен не выдаётся
  - *Рек.:* Заменить на рабочую реализацию FormReCaptcha из рецепта (execute + setToken/setIsCaptcha/setIsValid), брать siteKey из field.validators.siteKey и передавать его пропом вместо тестового ключа.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/ContactUsForm.tsx:67` — formData собирается switch'ем по marker вместо field.type; кнопка и spam отправляются с value 'test'
  - *Рек.:* Переписать маппинг по field.type (как в рецепте: mapValue по типу), исключить button-поля, фильтровать пустые значения и класть в spam-поле реальный captchaToken с type:'spam'.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/contacts-page/ContactFormCard.tsx:113` — Для type:'text' отправляются одновременно htmlValue и plainValue — рецепт требует ровно один ключ
  - *Рек.:* Оставить один ключ, как в рецепте: `[{ plainValue: value, params: { isImageCompressed: true, editorMode: 'plain' } }]` (или htmlValue с editorMode:'html', но не оба сразу).
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/contacts-page/ContactFormCard.tsx:122` — formModuleConfigId/moduleEntityIdentifier захардкожены 0/'' и status:'' вместо чтения из moduleFormConfigs и 'sent'
  - *Рек.:* Брать formModuleConfigId (`data?.moduleFormConfigs?.[0]?.id ?? 0`) и moduleEntityIdentifier (`…entityIdentifiers?.[0]?.id ?? ''`) из загруженной формы и отправлять status:'sent'.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/contacts-page/ContactFormCard.tsx:108` — В formData попадают пустые значения: несмапленные и незаполненные поля уходят пустой строкой
  - *Рек.:* Перед map отфильтровать поля с пустым значением (аналог notEmpty из рецепта); при расхождении маркеров CMS с локальными ключами — залогировать/деградировать осознанно.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/inputs/FormInput.tsx:54` — Доступ к field.validators без optional chaining — TypeError на поле без валидаторов
  - *Рек.:* Читать через optional chaining: `field.validators?.requiredValidator?.strict` (и аналогично для stringInspectionValidator), либо `const validators = field.validators ?? {}`.
- **[ИНФО] 🔧** `app/api/api/RTKApi.ts:271` — locale не передаётся в Forms.getFormByMarker — рецепт передаёт язык параметром
  - *Рек.:* Ничего не менять, пока проект одноязычный; при добавлении локалей — начать передавать langCode из params во все SDK-вызовы форм.

### `skill:create-menu` — 7

- **[СЕРЬЁЗНО]** `components/layout/header/nav/NavGroup.tsx:36` — При ошибке загрузки user_menu из шапки исчезает вся группа действий (Book Online, профиль, бургер), а вместо неё рендерится текст ошибки без английского фолбэка
  - *Рек.:* Убрать ранний return: всегда рендерить группу (Link на /booking, NavItemProfile, MenuButton), а userMenu передавать в NavItemProfile условно — `<NavItemProfile {...(menu && !isError ? { userMenu: menu } : {})} />`. Если текст ошибки всё же нужен — добавить английский фолбэк.
- **[СЕРЬЁЗНО]** `app/layout.tsx:137` — Любая ошибка загрузки меню 'main' (не только полная недоступность CMS) кладёт весь сайт — рендерится страница-заглушка вместо лейаута без навигации
  - *Рек.:* Оставить заглушку только для подтверждённого кейса «resource is closed» (403). Для остальных ошибок рендерить обычный лейаут, передавая в Header/OffscreenModal пустое меню ({ pages: [] } или undefined с обработкой внутри) — MainMenu уже умеет показывать MenuLoader при отсутствии pages.
- **[НЕЗНАЧИТЕЛЬНО] 🔧** `components/utils.ts:220` — flatMenuToNested строит дерево parentId-фильтром по плоскому списку и удаляет children — ровно тот паттерн, против которого предупреждает рецепт; при API-ответе в виде дерева заполненные children будут молча уничтожены
  - *Рек.:* Сделать flatMenuToNested устойчивой к обеим формам ответа: перед parentId-реконструкцией нормализовать element.children через Array.isArray (массив | одиночный объект | отсутствует) и, если он непуст, использовать его как children; удалять поле только когда и children из API, и parentId-поиск пусты.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/header/nav/user-menu/UserProfileMenu.tsx:32` — pages не нормализуются по рецепту «массив ИЛИ одиночный объект»: в UserProfileMenu каст без runtime-проверки уронит рендер, в трёх других местах одиночный объект молча теряется
  - *Рек.:* Единая нормализация по образцу рецепта: `Array.isArray(pages) ? pages : pages ? [pages] : []` — вынести в утилиту (рядом с flatMenuToNested) и использовать во всех четырёх местах.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/header/main-menu/components/NavigationMenu.tsx:34` — Nullable-поля пункта меню из рецепта не обработаны: pageUrl === null даёт href "/null", заголовок берётся только из menuTitle без фолбэка на title
  - *Рек.:* Добавить фолбэки: заголовок — `localizeInfos?.menuTitle || localizeInfos?.title || ''` (в проекте приоритет menuTitle оправдан); пункты с pageUrl == null либо пропускать, либо рендерить без Link.
- **[ИНФО] 🔧** `components/layout/bottom-menu/index.tsx:19` — Запрашивается маркер 'bottom_web', заведомо отсутствующий в админке — постоянный лишний запрос с 404 при каждом рендере корневого лейаута
  - *Рек.:* Либо завести меню 'bottom_web' в админке (в плане наполнения), либо до этого момента не вызывать API (ранний return по фиче-флагу/константе), чтобы не генерировать гарантированный 404 на каждый запрос.
- **[ИНФО] 🔧** `app/api/api/api.ts:11` — Локаль зафиксирована константой LANG_CODE в конфиге SDK, langCode в Menus.getMenusByMarker не передаётся, ссылки меню без префикса /{locale}/ — осознанное отклонение одноязычного проекта
  - *Рек.:* Изменений не требуется, пока проект одноязычный. При добавлении локалей — вводить сегмент [locale] и прокидывать locale в getMenuByMarker и в построение href по шаблону рецепта.

### `skill:create-orders-list` — 6

- **[СЕРЬЁЗНО]** `components/layout/profile-page/components/order-card/components/CancelOrderButton.tsx:52` — Результат отмены заказа не проверяется: тост «Order canceled!» показывается безусловно, провал отмены ложно выдаётся за успех
  - *Рек.:* Деструктурировать результат: const { isError, error } = await updateOrderByMarkerAndId(...); при isError показать error-тост (и не сбрасывать состояние), success-тост и setRefetch(true) — только в ветке успеха.
- **[СЕРЬЁЗНО]** `components/layout/profile-page/components/order-card/components/SaveOrderButton.tsx:54` — Результат сохранения заказа не проверяется: edit-режим сбрасывается и refetch запускается даже при ошибке обновления
  - *Рек.:* Проверять isError результата: при ошибке оставить edit-режим открытым и показать тост с ошибкой; сбрасывать editState и дергать setRefetch только при успехе.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/profile-page/components/order-card/components/CancelOrderButton.tsx:48` — Payload обновления собран спредом всего read-объекта заказа со statusIdentifier, тогда как рецепт предписывает минимальный payload со statusMarker
  - *Рек.:* Собрать минимальный payload по рецепту ({ formIdentifier, paymentAccountIdentifier, formData, products, ... }) и проверить на реальном API, какой ключ статуса реально применяется (statusMarker по рецепту vs statusIdentifier); зафиксировать проверенный вариант без каста as IOrderData.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/profile-page/components/ProfileHistory.tsx:50` — Нет допагинации по полю total: история визитов молча обрезается первой сотней заказов
  - *Рек.:* Дозагружать страницы циклом по total (как в loadAllOrders из рецепта) либо добавить реальную пагинацию/кнопку «Load more», использующую возвращаемый total.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/profile-page/components/ProfileHistory.tsx:74` — Заказы не сортируются по дате: бакеты и группы рендерятся в порядке выдачи API
  - *Рек.:* Перед разбиением на бакеты отсортировать массив: для Completed/Canceled — по createdDate desc (по рецепту), для Upcoming логично по дате визита (formData interval) asc; главное — задать детерминированный порядок явно.
- **[ИНФО]** `app/api/api/RTKApi.ts:373` — updateOrderByMarkerAndId в RTK Query оформлен как build.query (не mutation) — write-операция с кэшированием и providesTags
  - *Рек.:* Использовать исключительно mutation-вариант (useUpdateOrderMutation); query-вариант не подключать к компонентам (по конвенции проекта неиспользуемый код не удалять без явной просьбы, но стоит пометить его как deprecated в JSDoc).

### `skill:create-page` — 4

- **[НЕЗНАЧИТЕЛЬНО]** `app/page.tsx:139` — При ошибке getPageByUrl('home') главная страница рендерит отладочный текст «isError» вместо notFound() (рецепт) или тихого фолбэка (правило проекта)
  - *Рек.:* Заменить `return <>isError</>;` либо на `notFound()` (как в рецепте и на остальных страницах), либо на осмысленный фолбэк-рендер секций с мок-данными (в духе проектного правила «молча деградировать»).
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/home/offers-feed/index.tsx:23` — Дублирующий запрос getBlockByMarker за similarProducts, которые уже пришли в блоке из getBlocksByPageUrl (SDK 1.0.155 >= 1.0.153)
  - *Рек.:* Убрать вызов getBlockByMarker и читать офферы напрямую из пропса: `const products = (block?.similarProducts?.items ?? []).filter((p) => p.attributeSetIdentifier === 'offer')` (доступ только через optional chaining — при traficLimit поле отсутствует).
- **[НЕЗНАЧИТЕЛЬНО]** `app/[handle]/page.tsx:73` — Catch-all роут при успешно найденной CMS-странице с неизвестным templateIdentifier рендерит пустой контейнер вместо контента страницы или notFound()
  - *Рек.:* После сопоставления добавить фолбэк: если pageUrl не совпал ни с одним известным шаблоном — вызвать notFound() (или отрендерить generic-контент из localizeInfos по базовому шаблону рецепта), чтобы существующие в CMS, но не поддержанные роутом маркеры не отдавали пустую 200-страницу.
- **[ИНФО] 🔧** `app/api/api/api.ts:11` — Локаль захардкожена константой LANG_CODE='en_US'; locale не берётся из params и langCode не передаётся в SDK-вызовы — вопреки шаблону рецепта
  - *Рек.:* Ничего не менять, пока сайт одноязычный. При добавлении второй локали — ввести сегмент [locale], брать locale из params и передавать её в SDK-вызовы, как в рецепте.

### `skill:create-product-card` — 10

- **[СЕРЬЁЗНО]** `components/layout/offers-page/parseOfferDetail.ts:63` — Кнопка "Book Offer" на странице /offers — молчаливый no-op: угадан маркер services вместо offer_services и неверная форма entity-значения
  - *Рек.:* В parseOfferDetail.ts заменить маркер services на offer_services и читать parentId как servicesArr?.[0]?.value?.parentId (по образцу components/layout/home/offers-feed/components/parseOffer.ts:51–60,106).
- **[СЕРЬЁЗНО]** `components/layout/offers-page/parseOfferDetail.ts:84` — Фото оффера из CMS никогда не рендерится: угадан маркер image вместо offer_image и image-значение продукта читается как массив, хотя это объект
  - *Рек.:* Читать (product.attributeValues?.offer_image?.value as { downloadLink?: string } | undefined)?.downloadLink и оставить FALLBACK_IMAGES как фолбэк при отсутствии значения.
- **[СЕРЬЁЗНО]** `components/layout/offers-page/parseOfferDetail.ts:71` — Устаревшие маркеры sale/duration/description на детальной карточке оффера: скидка, старая цена, длительность и описание из CMS никогда не показываются
  - *Рек.:* Заменить маркеры: sale → offer_price (через Number(), т.к. real приходит строкой), duration → offer_time, description → offer_description; для price добавить фолбэк Number(offer_sale) || product.price, как в parseOffer.ts.
- **[СЕРЬЁЗНО]** `app/services/catalog-data.ts:53` — Описания услуг потеряны во всём каталоге: text-атрибут description читается как строка, хотя его value — массив [{htmlValue, plainValue}]
  - *Рек.:* Читать text-значение по его реальной форме: const d = attrs.description?.value; взять (Array.isArray(d) ? d[0]?.plainValue : typeof d === 'string' ? d : '') с фолбэком на localizeInfos.plainValue.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/offers-page/parseOfferDetail.ts:78` — Акцентный цвет оффера на /offers всегда розовый фолбэк: offer_type читается через extended.value, которого у entity-значения нет
  - *Рек.:* Переиспользовать логику выбора accentColor из parseOffer.ts (кандидаты + CATEGORY_ACCENT по offerType.title) или вынести её в общий хелпер для обеих карточек.
- **[НЕЗНАЧИТЕЛЬНО]** `app/api/hooks/useSearchProducts.ts:50` — useSearchProducts не проверяет ошибку SDK и не имеет try/catch: при сбое API — вечный спиннер и IError в состоянии products
  - *Рек.:* Обернуть вызов в try/catch/finally (setLoading(false) в finally), проверять isError(result) и класть в состояние только Array.isArray(result) ? result : [].
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/header/search/SearchResults.tsx:100` — Фильтр поиска отсеивает несуществующий набор 'service_product', а реальные offer-продукты просачиваются в выдачу как услуги
  - *Рек.:* Заменить мёртвую проверку на attributeSetIdentifier === 'offer' (либо, если офферы нужны в выдаче, рендерить для них отдельную строку со ссылкой на /offers).
- **[ИНФО]** `components/layout/services-page/ServiceCard.tsx:46` — Доступность услуги определяется только по price === null, statusIdentifier продукта не учитывается нигде в карточках
  - *Рек.:* При маппинге в toServiceItem учитывать product.statusIdentifier (например, unavailable = price === null || statusIdentifier !== 'in_stock'), сверив реальный маркер статуса инспекцией.
- **[ИНФО]** `components/layout/offers-table/components/PriceCell.tsx:22` — Неиспользуемые легаси-таблицы (offers-table, products-table) читают устаревшие маркеры sale и services
  - *Рек.:* Ничего не удалять, но при реанимации этих таблиц первым делом обновить маркеры на offer_price/offer_services и парсить real-значения через Number().
- **[ИНФО] 🔧** `app/api/api/api.ts:11` — Локаль en_US захардкожена одной константой LANG_CODE, карточки не получают locale и ссылки не префиксуются локалью
  - *Рек.:* Ничего не менять, пока сайт одноязычный; при добавлении второй локали — перейти на locale из params по рецепту.

### `skill:create-product-list` — 6

- **[СЕРЬЁЗНО]** `app/api/hooks/useSearchProducts.ts:50` — Результат Products.searchProduct не проверяется через isError и не обёрнут в try/catch — при ошибке API объект IError кастуется в массив продуктов
  - *Рек.:* Обернуть вызов в try/catch и добавить проверку: `const result = await getApi().Products.searchProduct(name); setProducts(isError(result) || !Array.isArray(result) ? [] : result);` — по аналогии с серверными обёртками app/api/server/products/*.
- **[НЕЗНАЧИТЕЛЬНО]** `app/api/api/RTKApi.ts:141` — Эндпоинт getProductsByIds делает N параллельных запросов getProductById вместо батч-метода SDK Products.getProductsByIds
  - *Рек.:* Заменить цикл на один вызов `getApi().Products.getProductsByIds(items.join(','))` с проверкой isError на реальном ответе SDK; мёртвую проверку isError на массиве убрать.
- **[НЕЗНАЧИТЕЛЬНО]** `app/services/catalog-data.ts:117` — Каталог услуг собирается одним запросом с limit: 100 без сверки с total — при росте каталога продукты сверх 100 на подкатегорию молча потеряются
  - *Рек.:* После первого запроса сверять products.length с total и дозапрашивать следующие страницы (либо цикл по offset до total), или как минимум логировать/ассертить ситуацию total > limit.
- **[ИНФО]** `app/api/api/RTKApi.ts:101` — RTK-эндпоинты getProducts и getProductsByPageUrl вызывают SDK без userQuery (offset/limit) — действует серверный дефолт limit 30, список молча усекается
  - *Рек.:* Добавить в аргументы эндпоинтов offset/limit и передавать userQuery в SDK-вызовы (как в серверных обёртках app/api/server/products/*); `{ error: null }` заменить на осмысленный объект ошибки.
- **[ИНФО] 🔧** `app/api/server/products/getProducts.ts:44` — langCode в SDK-вызовы каталога передаётся как undefined, локаль en_US зашита в конфиг defineOneEntry, locale из params не берётся
  - *Рек.:* Ничего не менять, пока сайт одноязычный. При добавлении второй локали — вернуть параметр langCode в серверные обёртки и брать locale из params, как в рецепте.
- **[ИНФО]** `app/api/server/products/getProductsByPageUrl.ts:54` — Сортировка каталога по sortKey 'date' (причём в двух обёртках разнонаправленная: DESC здесь и ASC в getProducts) вместо 'position' из рецепта
  - *Рек.:* Если порядок услуг должен управляться из админки — перейти на sortKey: 'position' в обеих обёртках; как минимум унифицировать sortOrder между getProducts и getProductsByPageUrl.

### `skill:create-profile` — 11

- **[СЕРЬЁЗНО]** `components/forms/UserForm.tsx:96` — updateUser вызывается со state: {} — при каждом сохранении профиля затирается user.state (корзина, избранное)
  - *Рек.:* Передавать state: user.state (объект user уже доступен из AuthContext в этом компоненте), как в рецепте и в updateUserState.ts.
- **[СЕРЬЁЗНО]** `components/forms/UserForm.tsx:82` — Результат Users.updateUser не проверяется — при ошибке (401, валидация) пользователь видит toast «Data saved!»
  - *Рек.:* Сохранить результат вызова, проверить через isError(result) / result !== true и показывать ошибку (setError) вместо success-тоста; при statusCode 401/403 — разлогинивать.
- **[СЕРЬЁЗНО]** `components/forms/UserForm.tsx:85` — Пароль обрабатывается вопреки рецепту: authData с password_reg отправляется всегда (в т.ч. с пустой строкой), маркер захардкожен, пароль дублируется и в formData
  - *Рек.:* Разделять поля по флагу attr.isPassword === true: в authData — только заполненные пароли, из formData пароли исключать; пустой пароль означает «не менять»; после успешного сохранения очищать password-поля.
- **[СЕРЬЁЗНО]** `app/store/providers/AuthContext.tsx:119` — checkToken удаляет refresh-token при ЛЮБОЙ ошибке getMe (в т.ч. сетевой), а не только при подтверждённых 401/403
  - *Рек.:* В checkToken удалять токен и сбрасывать isAuth только при statusCode 401/403 из ошибки (как в эффекте на строках 211-224); при прочих ошибках оставлять сессию — polling сам повторит запрос.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/UserForm.tsx:58` — В formData тип каждого поля захардкожен как 'string' вместо реального attr.type из формы
  - *Рек.:* Брать type из атрибута формы (field.type), полученного из getFormAttributes(data).
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/inputs/FormInput.tsx:39` — Тип инпута определяется только по подстроке в имени маркера, флаги isPassword/isLogin/isNotification* не используются
  - *Рек.:* Сначала проверять флаги атрибута (isPassword, isLogin, isNotification*), маркер оставить последним фолбэком, как в getInputType из рецепта.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/UserForm.tsx:133` — Поля формы профиля не сортируются по position
  - *Рек.:* Добавить .sort((a, b) => a.position - b.position) после getFormAttributes(data).
- **[НЕЗНАЧИТЕЛЬНО] 🔧** `components/utils.ts:24` — getFormAttributes отбрасывает attributes-объект целиком вместо Object.values — непустой объект с полями будет молча потерян
  - *Рек.:* Заменить ветку не-массива на Object.values(attributes ?? {}) — поведение для пустого {} не изменится, а непустой объект перестанет теряться.
- **[ИНФО]** `components/forms/UserForm.tsx:45` — Атрибуты формы профиля запрашиваются по захардкоженному маркеру 'reg', а не по user.formIdentifier
  - *Рек.:* Передавать в useGetFormByMarkerQuery маркер user.formIdentifier (с skip, пока user не загружен).
- **[ИНФО]** `app/profile/page.tsx:25` — Вся страница профиля рендерится пустым фрагментом при ошибке загрузки мастеров (второстепенных данных)
  - *Рек.:* При ошибке admins передавать в ProfilePage пустой массив мастеров (masters={[]}) и рендерить страницу; пустой фрагмент оставить только для действительно фатальных случаев.
- **[ИНФО] 🔧** `app/api/api/api.ts:11` — Локаль не берётся из useParams и не передаётся в SDK-вызовы профиля — единая константа LANG_CODE
  - *Рек.:* Изменений не требуется, пока сайт одноязычный; при добавлении локалей — вернуться к передаче locale из params.

### `skill:create-search` — 5

- **[СЕРЬЁЗНО]** `app/api/hooks/useSearchProducts.ts:50` — Результат Products.searchProduct не проверяется на IError и не обёрнут в try/catch — при ошибке API поиск падает, а не деградирует в пустой список
  - *Рек.:* В хуке обернуть вызов в try/catch/finally: `try { const result = await getApi().Products.searchProduct(name); setProducts(isError(result) ? [] : result); } catch { setProducts([]); } finally { setLoading(false); }` — импортировав isError из '@/app/api'.
- **[НЕЗНАЧИТЕЛЬНО]** `app/api/hooks/useSearchProducts.ts:45` — При опустевшем запросе хук делает ранний return, не очищая предыдущие результаты
  - *Рек.:* В ветке пустого `name` вызывать `setProducts([])` (и при необходимости `setLoading(false)`), а затем `return` — как предписывает рецепт: на пустой запрос очистить результаты и не делать запрос.
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/header/search/SearchResultsList.tsx:99` — Empty-state «Nothing found» на мгновение показывается до старта/завершения запроса
  - *Рек.:* Различать состояния «ещё не искали» и «искали, пусто»: например, инициализировать loading как true при непустом name, или хранить `products: IProductsEntity[] | null` и показывать empty-state только когда запрос завершён (products !== null).
- **[НЕЗНАЧИТЕЛЬНО]** `components/layout/header/search/SearchResultsList.tsx:132` — key={product.id + i} — арифметическая сумма двух чисел, возможны дубликаты React-ключей
  - *Рек.:* Использовать `key={product.id}` — id продукта уникален, индекс не нужен.
- **[ИНФО] 🔧** `app/api/hooks/useSearchProducts.ts:50` — locale/langCode не передаётся в searchProduct — осознанное отклонение одноязычного проекта
  - *Рек.:* Изменений не требуется, пока проект одноязычный. При добавлении второй локали — начать передавать langCode из params во все вызовы поиска.

### `skill:create-server-action` — 8

- **[СЕРЬЁЗНО]** `components/forms/VerificationForm.tsx:81` — Результат AuthProvider.checkCode не проверяется через isError() — объект IError (truthy) трактуется как успех, а false (неверный код) молча игнорируется
  - *Рек.:* Заменить truthy-проверку на явную: `if (isError(result)) { setError(result.message); return; } if (result === true) { setComponent('ResetPasswordForm'); } else { setError('Invalid code'); }`.
- **[СЕРЬЁЗНО]** `components/layout/contacts-page/ContactFormCard.tsx:119` — Результат FormData.postFormsData игнорируется — при ошибке отправки формы пользователю показывается экран успеха (setSent(true))
  - *Рек.:* Сохранить результат: `const res = await getApi().FormData.postFormsData({...}); if (isError(res)) { setError(res.message); return; }` — и только после этого setSent(true).
- **[СЕРЬЁЗНО]** `components/forms/ContactUsForm.tsx:90` — Результат FormData.postFormsData игнорируется — ошибка отправки контактной формы никогда не показывается пользователю
  - *Рек.:* Присвоить результат переменной и проверить: `const res = await getApi().FormData.postFormsData({...}); if (isError(res)) { setError(res.message); return; }` — плюс добавить видимое состояние успешной отправки.
- **[СЕРЬЁЗНО]** `components/forms/ForgotPasswordForm.tsx:55` — Результат AuthProvider.generateCode не проверяется — при ошибке генерации кода пользователь всё равно отправляется на форму ввода OTP; обработка statusCode в catch — мёртвый код
  - *Рек.:* Проверять возвращаемое значение: `const res = await getApi().AuthProvider.generateCode(...); if (isError(res)) { setError(res.message); return; } setComponent('VerificationForm');` — и убрать мёртвую обработку statusCode из catch.
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/VerificationForm.tsx:95` — Результат AuthProvider.activateUser проверяется truthy-проверкой `if (result)` — объект IError принимается за успешную активацию
  - *Рек.:* Явная проверка: `if (isError(result)) { setError(result.message); return; } if (result !== true) { throw new Error('Activation failed'); }` — и только потом вызывать auth().
- **[НЕЗНАЧИТЕЛЬНО]** `components/forms/VerificationForm.tsx:171` — Повторная отправка OTP (onResendHandle): результат generateCode не проверяется, ошибка пересылки кода не показывается
  - *Рек.:* Проверять результат: `const res = await getApi().AuthProvider.generateCode(...); if (isError(res)) { setError(res.message); }` — и сверить маркеры событий 'generate_code' / 'generate_otp' с реальными событиями в админке.
- **[НЕЗНАЧИТЕЛЬНО]** `app/store/providers/AuthContext.tsx:119` — checkToken удаляет refresh-token при ЛЮБОЙ ошибке getMe (включая транзиентные сетевые) — вопреки правилу «logout только при подтверждённых 401/403» из rules/tokens.md, на который ссылается рецепт
  - *Рек.:* В checkToken удалять токен только при подтверждённых 401/403 (проверять statusCode из res.error, как в эффекте на строках 211-224); при прочих ошибках оставлять токен и полагаться на ретрай/поллинг. Мёртвый .catch убрать или заменить на unwrap()-обработку.
- **[ИНФО] 🔧** `app/api/api/api.ts:11` — Локаль зашита константой LANG_CODE='en_US' в конфиге SDK, параметр locale через серверные обёртки и вызовы не протаскивается
  - *Рек.:* Ничего не менять, пока сайт одноязычный. При добавлении второй локали — протащить locale из params через все обёртки и reDefine, как в рецепте.

### `skill:setup-oneentry` — 2

- **[НЕЗНАЧИТЕЛЬНО]** `app/api/api/api.ts:26` — saveFunction обращается к localStorage без guard'а typeof window !== 'undefined', который есть в эталонном коде рецепта setup-oneentry
  - *Рек.:* Вернуть защиту из рецепта: в начале saveFunction добавить `if (typeof window === 'undefined') return;` (или обернуть setItem в проверку typeof window !== 'undefined').
- **[ИНФО] 🔧** `app/api/api/api.ts:106` — reDefine() не принимает параметр langCode, хелпер getLang() не портирован — упрощение под одноязычный сайт
  - *Рек.:* Ничего не менять, пока проект одноязычный. При добавлении локалей — расширить reDefine параметром langCode и добавить getLang() по рецепту setup-oneentry.

## 4. Опровергнутые и осознанные отклонения

**Опровергнуто проверкой (действий не требует):**

- ⛔ `app/api/api/api.ts:11` (rule:nextjs-pages) — Локаль не берётся из params роута: захардкожена константа LANG_CODE = 'en_US', сегмента [locale] в App Router нет.

**Осознанные отклонения (🔧) — оставлены как есть, зафиксированы:**

- ✅ `app/reviews/page.tsx:32` (rule:nextjs-pages) — Тело страницы /reviews целиком рендерится из локального мока (components/layout/reviews-page/data.ts), контент CMS-страницы 'reviews' в теле не используется (только в generateMetadata).
- ✅ `app/contacts/page.tsx:119` (rule:nextjs-pages) — Ряд UI-текстов и данных секций захардкожен в page-файлах без чтения из CMS/словаря: «Get in Touch», подзаголовок героя, статистика «Daily 10:00–22:00» и др.
- ⚠️ `app/api/utils/dictionaries.ts:29` (rule:localization) — Словарь UI-строк реализован на блоке system_content (getBlockByMarker) вместо предписанного правилом AttributeSet static_content (getAttributesByMarker), и без центрального хелпера t().
- ⚠️ `components/layout/contacts-page/BookCtaBanner.tsx:30` (rule:localization) — Часть UI-микрокопи захардкожена в JSX без словаря (BookCtaBanner «Ready to visit us?», PromoBanner и др.) — помечено в коде как переходное состояние до наполнения system_content.
- ⚠️ `app/api/index.ts:1` (rule:performance-bundle) — Баррель app/api/index.ts реэкспортирует SDK-синглтон, RTK Query и все 19 серверных обёрток одним файлом; из него импортируют ~80 файлов, включая клиентские компоненты.
- 🟡 `components/shared/Image.tsx:1` (rule:linting) — Системный обход @next/next/no-img-element: 16 вхождений <img> в 11 файлах через eslint-disable
- ✅ `app/store/providers/AuthContext.tsx:233` (rule:linting) — Осознанное подавление exhaustive-deps с задокументированным обоснованием (isAuth намеренно исключён из deps)
- ⚠️ `app/api/api/api.ts:106` (skill:setup-oneentry) — reDefine() не принимает параметр langCode, хелпер getLang() не портирован — упрощение под одноязычный сайт
- ⚠️ `components/data.js:1` (rule:mismatch-log) — MISMATCH-LOG.md отсутствует в корне проекта при множестве активных триггеров правила (фолбэки/моки для отсутствующих CMS-сущностей, пустые формы, открытые вопросы к клиенту).
- ⚠️ `app/store/reducers/CartSlice.ts:84` (skill:create-cart-manager) — Корзина реализована по альтернативному паттерну Redux+redux-persist (клиентская), а не на нативном серверном cart API из рецепта
- ⚠️ `app/api/api/api.ts:11` (skill:create-page) — Локаль захардкожена константой LANG_CODE='en_US'; locale не берётся из params и langCode не передаётся в SDK-вызовы — вопреки шаблону рецепта
- ⚠️ `components/utils.ts:24` (skill:create-profile) — getFormAttributes отбрасывает attributes-объект целиком вместо Object.values — непустой объект с полями будет молча потерян
- ⚠️ `app/api/api/api.ts:11` (skill:create-profile) — Локаль не берётся из useParams и не передаётся в SDK-вызовы профиля — единая константа LANG_CODE
- ⚠️ `app/api/server/products/getProducts.ts:44` (skill:create-product-list) — langCode в SDK-вызовы каталога передаётся как undefined, локаль en_US зашита в конфиг defineOneEntry, locale из params не берётся
- ⚠️ `app/api/api/RTKApi.ts:271` (skill:create-form) — locale не передаётся в Forms.getFormByMarker — рецепт передаёт язык параметром
- ⚠️ `app/api/hooks/useSearchProducts.ts:50` (skill:create-search) — locale/langCode не передаётся в searchProduct — осознанное отклонение одноязычного проекта
- ⚠️ `components/utils.ts:220` (skill:create-menu) — flatMenuToNested строит дерево parentId-фильтром по плоскому списку и удаляет children — ровно тот паттерн, против которого предупреждает рецепт; при API-ответе в виде дерева заполненные children будут молча уничтожены
- ⚠️ `components/layout/bottom-menu/index.tsx:19` (skill:create-menu) — Запрашивается маркер 'bottom_web', заведомо отсутствующий в админке — постоянный лишний запрос с 404 при каждом рендере корневого лейаута
- ⚠️ `app/api/api/api.ts:11` (skill:create-menu) — Локаль зафиксирована константой LANG_CODE в конфиге SDK, langCode в Menus.getMenusByMarker не передаётся, ссылки меню без префикса /{locale}/ — осознанное отклонение одноязычного проекта
- ⚠️ `app/api/api/api.ts:11` (skill:create-product-card) — Локаль en_US захардкожена одной константой LANG_CODE, карточки не получают locale и ссылки не префиксуются локалью
- ⚠️ `app/api/api/api.ts:11` (skill:create-server-action) — Локаль зашита константой LANG_CODE='en_US' в конфиге SDK, параметр locale через серверные обёртки и вызовы не протаскивается

## 5. Что осталось доделать в аудите

- Адверсариально верифицировать оставшиеся **191** находок (раздел 3) — прервано лимитом сессии.
- Запустить агента-критика полноты (сквозные аспекты: единообразие контракта `{ isError, error?, data? }` во всех обёртках `app/api/server/**`; env `NEXT_PUBLIC_ONEENTRY_URL/TOKEN` и легаси-имена; ISR/ревалидация SDK-фетчей; middleware; обработка ошибок SDK в RTK Query) — не успел стартовать.
- Возобновить прогон: `Workflow({scriptPath: '.../oneentry-compliance-audit-wf_ffe5e670-d76.js', resumeFromRunId: 'wf_ffe5e670-d76'})` — готовые агенты вернутся из кэша, доедут только верификация и критик.
