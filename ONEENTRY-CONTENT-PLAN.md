# План наполнения админки OneEntry — осталось

> **Источник контента:** верстка салона «Thalia» (Dubai) в [static-html/](static-html/) (React-экспорт из Figma, `http://localhost:5173/`).
> **Потребитель:** Next.js-шаблон в корне (`app/`, `components/`), читающий конкретные маркеры из OneEntry.
> Обозначения: ✅ выполнено · 🟡 частично · ❌ не сделано.
>
> **Вычищено 2026-07-17:** детальные Статус-простыни по завершённым этапам удалены (полная история — в git). Справочник сущностей (маркеры, наборы атрибутов, id) живёт в **`CLAUDE.md` → «Известные сущности»** и в памяти проекта; ниже — только незакрытое.

---

## ✅ Сделано (свёрнуто)

- **Фундамент:** локаль `en_US`; наборы атрибутов (`salon`, `gallery`, `offer`, `master`, `service`); медиа залиты (32 портрета, галерея — 32 фото-страницы/228 фото, баннеры офферов).
- **Страницы:** системные + `salons` + `reviews` + `payment_success/canceled`; текст `404` (встроенное поле страницы). Категории услуг (4 главные + 15 подкатегорий). Салоны (адрес/телефон/`salon_time` у всех трёх).
- **Каталог:** 77 услуг-продуктов (`price` числом, `currency`, `duration`, `specialist_grade`, `description`) + 4 оффера `offer`.
- **Блоки:** 7 блоков главной привязаны к `home`; `home_discounts` заполнен (набор 19); `system_content` (34 UI-текста). `home_hero` — 4 слайда. **`opening_time`** (2026-07-20) — `common_block`, ни к какой странице не привязан (читается по маркеру), атрибут `opening_time` (**timeInterval**), 7 групп Пн–Вс 10:00–22:00; фронт разбирает его через `app/utils/parseOpeningTime.ts` (футер + «Opening Hours» на контактах); мок-фолбэка нет — без блока эти секции просто не рендерятся.
- **Меню:** `main`, `services`, `about_us`, `user_menu`.
- **Формы/заказы:** `reg` и `order` заполнены; заказы создаются и отменяются (сквозь UI); auth `google`+`email`; события заведены; оплата `cash`+`stripe` активна и привязана к storage; **выбор оплаты и онлайн-оплата Stripe работают**.
- **Форма `contact_us`:** работает end-to-end (проверено живым сабмитом 2026-07-19). Поля `name`/`phone`/`email`/`contact_text`(text)/`spam`/`button`; reCAPTCHA v3 **Enterprise** (ключ в `spam.settings.captcha.key`, значение атрибута `spam` = объект `{event:{token,siteKey}}`); привязан module config `content`/`contacts` (id 2). Код — `ContactFormCard` + `components/forms/inputs/FormReCaptcha.tsx`; грабли и рецепт — в памяти (`oneentry-spam-captcha-mechanics`) и скиле `.claude/temp/create-captcha.md`. reCAPTCHA не проходится из headless (ботоскор) — e2e проверяет только рендер.
- **Бронирование:** покрытие `master_services` — **77/77 услуг, 0 тупиковых пар**; слоты берутся из расписания (`master_schedule`/`salon_time` через `expandAttributeTimeIntervals`), прошедшие слоты дизейблятся.

> **Грабли (детали — в памяти проекта и CLAUDE.md), чтобы не наступить снова:**
>
> - маркер поля салона в форме `order` — **`salon`**, не `order_salon` (последнего нет нигде);
> - `getFormByMarker('order')` показывает лишние `price`/`currency` — набор формы их не содержит, `createOrder` отвергает; **сверять состав боевым POST, не листингом**;
> - верхнее `product.price` производно от `isPrice`-атрибута и пересчитывается **асинхронно** — GET сразу после PUT врёт (0/null);
> - `getAdminsInfo()` без аргументов отдаёт только **30 из 32** мастеров (сигнатура позиционная `(body, langCode, offset, limit)`);
> - четырёхзначные цены обнулялись при ручном вводе с разделителем тысяч («1 100» → 0) — после заливки цен прогонять `inspect-zero-prices.mjs`.

---

## ❌ Осталось

### 1. Карточки контактов (`contactInfoData`)

Часы работы ✅ переехали в CMS (см. ниже). Остаётся мок `contactInfoData` в `components/data.js` — карточки контактной информации на странице контактов (телефон/почта/адрес общего вида) пока не читаются из CMS.

### 2. Отзывы (требует решения)

В шаблоне отзывы захардкожены (`components/data.js` `reviewsData`, `components/layout/reviews-page/data.ts` — 17 отзывов с маппингами мастер→салон/категория), в верстке — полноценный раздел с фильтрами и модалкой «Leave a review».

🟡 Первый шаг к CMS сделан: страница `reviews` (id 38) создана и в меню `about_us`, блок `reviews_carousel` создан и привязан к `home`. ❌ Но контента нет: у `reviews` **нет детей-отзывов**, у `reviews_carousel` **нет ни атрибутов, ни слайдов**.

Для переноса: (1) завести атрибуты отзыва `author`/`master_id`/`rating`/`date`/`text`, (2) наполнить детей `reviews`, (3) переключить `ReviewsCarousel` и `reviews-page` на CMS (по образцу `getCmsGalleryItems`).

---

## Открытые вопросы / несоответствия

1. **Цены по салонам и тарифам** (premium/mid/budget × 3 салона) — шаблон поддерживает одну цену. Сейчас залита цена уровня Downtown/Premium; расширение — отдельной задачей. ⚠️ Четырёхзначные значения вводить без пробелов/запятых (см. грабли выше), после — `inspect-zero-prices.mjs`.
2. **Тарифный переключатель Hair (Top/Senior/Stylist)** на странице цен — на фронте отсутствует; в админке отражается грейдом `specialist_grade` (бейдж).
3. **Домен e-mail**: в верстке `@beautystudio.com` при бренде «Thalia» — уточнить перед заведением контактов.
4. **Промо «First Visit 15%» / «10% off online»** — есть только контентный блок `home_discounts`, логика скидки на фронте не реализована.
5. **Соцсети** (Instagram/Facebook/Twitter) — в верстке ссылки-заглушки; реальные URL завести в `system_content`.
6. **Фото салонов — ✅ переведены на CMS (2026-07-20).** Привязки «фото → салон» в CMS нет и не нужна: салон берётся **через мастера** — `master_id` (list) у страницы-фото → админ → `master_salon` (entity → страница салона). Разбор — `app/gallery/masterSalonsById.ts`; `GalleryItem.salon` теперь `string[]` (мастер может работать в нескольких салонах — фото попадает во все), `/salons/[handle]` фильтрует по нему с CMS-приоритетом и локальным сканером как фолбэком. Фото без салона **скрываются** (прежний фолбэк «показать любые» убран). Покрытие на 2026-07-20: 32/32 страницы-фото с `master_id`, 32/32 мастера с `master_salon`, 228/228 изображений раскладываются (Downtown 76 / Marina 68 / JBR 84) — аудит `node .claude/temp/audit-gallery-salon-link.mjs`. Локальный сканер `getLocalGalleryItems` оставлен фолбэком — пока жив, держать сегменты пути литералами (спред const-массива ломает трассировку Turbopack, см. комментарий в файле). Фото салонов — в `public/images/Beauty content/Contacts/<Salon>/`.
7. **Блокировка занятых слотов брони** (`busyTimes`) — публичный SDK отдаёт заказы только текущего юзера, занятость других клиентов оттуда не видна; нужен серверный эндпоинт доступности. Хук `busyTimes` в `DateTimeStep` оставлен под это.
8. **Stripe `successUrl`/`cancelUrl`** сейчас оба = `https://beauty.oneentry.cloud/` (CMS-хост) — после оплаты клиент вернётся на хост CMS, а не на страницы сайта `payment_success` (id 120) / `payment_canceled` (id 121). Наш код URL-ы в `createSession` не передаёт — они берутся из настроек аккаунта. **Поправить в админке Stripe-аккаунта.**

---

## Словарь UI-текстов (`system_content`) — инвентарь хардкодов для переноса в CMS

> Составлено 2026-07-23 сплошным аудитом всего проекта (`app/`, `components/`). Цель — вынести все захардкоженные англ. UI-строки в блок **`system_content`** (набор атрибутов id 2), чтобы их можно было править из админки. В коде строка заменяется на `(dict?.<marker>?.value as string | undefined) || 'Fallback'` — англ. фолбэк ОСТАЁТСЯ в коде (словарь опционален).
>
> **Тип всех атрибутов ниже — `string`** (кроме помеченных `(text)` — длинная многострочная копия). Заполнять как в `.claude/temp/fill-system-content.mjs` (позиционные `string_id{N}`) — при добавлении маркеров дописать их в массив `DICT` этого скрипта и перезалить.
>
> Механизм чтения: **серверные** компоненты — `const [dict] = ServerProvider<IAttributeValues>('dict')` локально; **клиентские** — `useDict()` из `@/app/store/providers/useDict` (провайдер `DictProvider` подключён в `app/layout.tsx`).
>
> **✅ Статус 2026-07-23:** все **285 значений заведены** и читаются публично (залито `.claude/temp/fill-system-content.mjs`, бэкап `backup-system-content-2026-07-23.json`). Реконсиляция: `UserForm` → `edit_text`/`cancel_text`; добавлены `auth_required_text`/`verification`/`cancel_booking_text`/`reschedule_text`.
>
> **📍 Где хранятся значения (важно):** значения словаря — это **`initialValue` (значение по умолчанию) каждого атрибута набора `system_content`** (id 2), а НЕ значения блока. Правятся в админке: **Settings → Attributes → «System content»** (шестерёнка на атрибуте → поле значения). `getDictionary()` читает их публично через `AttributesSets.getAttributesByMarker('system_content')` → `marker → initialValue` (см. `app/api/utils/dictionaries.ts`). Так правка в редакторе набора **сразу отражается на сайте**. Блок `system_content` (id 9) для словаря больше НЕ используется (значения там остались, но не читаются). Раньше сайт читал блок — из-за этого правки в редакторе набора не долетали; исправлено 2026-07-23.
>
> **⚠️ ГОЧА OneEntry (критично):** значение атрибута блока **не должно содержать `{` или `}`** — публичный API отдаёт **500 «invalid input syntax for type json»** (PostgreSQL-каст) и роняет чтение ВСЕГО блока (и SDK, и админка показывают пусто; сырой admin-эндпоинт/Postman при этом отдаёт данные). Поэтому шаблонные плейсхолдеры — **`%token%`**, не `{token}` (напр. `Step %x% of %y%`, `No %cat% specialists match…`, `%n% more step(s)…`); код делает `.replace('%token%', …)`. Метки-названия атрибутов (в наборе) скобки терпят — ломаются только ЗНАЧЕНИЯ блока.

### A. Уже заведено в CMS (34 маркера) — переиспользовать

`site_name`, `company_name`, `book_text` (Book Online), `book_online_text`, `book_again_text`, `menu_not_found_text`, `opening_time_text`, `follow_us_text`, `check_profile_text` (Check Profile), `select_txt` (Select), `select_master_text`, `search_placeholder`, `history_of_visits_text`, `sign_out_text`, `edit_text` (Edit), `cancel_text` (Cancel), `save_button_text`, `sign_in_text` (Sign In), `sign_up_text` (Create an Account), `log_in_text`, `create_account_text`, `create_account_desc`, `forgot_password_text`, `reset_password_text`, `reset_descr`, `send_text`, `new_password_desc`, `change_password_text`, `enter_otp_code`, `receive_otp_text`, `resend_text`, `verify_now_text`, `email_text`, `phone_text`.

**Расхождения код↔CMS (устранить при замене):**
- `UserForm.tsx` читает `edit_button_text` / `cancel_button_text` — в наборе их нет. → перевести код на существующие `edit_text` / `cancel_text`.
- Код читает, но в наборе НЕТ (добавить — см. ниже): `auth_required_text`, `verification`, `cancel_booking_text`, `reschedule_text`.

### B. Общие маркеры (shared) — новые, переиспользуются в нескольких местах

| marker | value | где (примеры) |
|---|---|---|
| continue_text | Continue | booking (index, EntryScreen) |
| back_text | Back | booking/index, reviews-page/index |
| close_text | Close | SuccessModal, modal/CloseModal, lightbox, review-modal, CancelErrorModal |
| done_text | Done | Cancel/RefundSuccessModal |
| reset_text | Reset | BookingSummary |
| total_text | Total | BookingSummary, order-card/OrderTotal |
| from_text | from | MasterCard, AnySpecialistCard |
| all_text | All | ServiceStep, reviews CategoryChips/MasterFilter |
| all_studios_text | All studios | services SalonSelector, reviews/masters SalonFilter |
| payment_text | Payment | PaymentMethodPicker |
| studio_text | Studio | booking StepBar/EntryScreen/BookingSummary |
| service_text | Service | booking StepBar/BookingSummary, home catalog title |
| services_text | Services | header SearchResultsList, footer MenuSection |
| specialist_text | Specialist | booking, masters/home role fallback, profile master-card |
| specialists_text | Specialists | header SearchResultsList |
| date_text | Date | BookingSummary |
| book_now_text | Book Now | services PromoBanner |
| book_offer_text | Book Offer | home OfferCardFooter, offers OfferDetailPanel |
| book_short_text | Book | services ServiceCard |
| book_appointment_text | Book Appointment | BookingSummary |
| sign_in_to_book_text | Sign in to book | BookingSummary |
| leave_review_text | Leave a review | master-single RatingCluster, profile LeaveReviewButton |
| clear_search_text | Clear search | services/gallery/masters (aria) |
| clear_all_text | Clear all | gallery/masters |
| clear_filters_text | Clear filters | gallery/index, masters SpecialistSections |
| search_specialist_placeholder | Search specialist | masters MobileSpecialistList, reviews MasterFilter |
| guest_text | Guest | profile getUserDisplayName |
| min_text | min | ServiceCard, offers parseOfferDetail, formatMinutes |
| discover_more_text | Discover More | home HeroSlider (+ mobile overlay) |
| previous_text | Previous | salon SalonLightbox |
| next_text | Next | salon SalonLightbox |
| you_signed_in_text | You signed in! | SignInForm, google CallbackClient (toast) |
| try_again_text | Try again | error.tsx, global-error.tsx |
| site_unavailable_title | Site temporarily unavailable | layout.tsx, global-error.tsx |

### C. Booking (`components/layout/booking-page/**` — всё client, dict тянуть от `app/booking/page.tsx`)

| marker | value | где |
|---|---|---|
| booking_entry_kicker | Start your booking | EntryScreen |
| booking_entry_heading | How would you like to start? | EntryScreen |
| booking_entry_hint | Both paths take you to the same booking — pick whichever feels natural. | EntryScreen |
| booking_entry_studio_title | Browse the studio | EntryScreen OPTIONS |
| booking_entry_studio_desc | Pick a location, choose your service, then a specialist | EntryScreen OPTIONS |
| booking_entry_specialist_title | Choose a specialist | EntryScreen OPTIONS |
| booking_entry_specialist_desc | Browse our specialists by category — the studio and time come with them | EntryScreen OPTIONS |
| booking_change_start_text | Change start | index.tsx |
| booking_choose_studio_text | Choose your studio | SalonStep |
| booking_choose_services_text | Choose services | ServiceStep |
| booking_selected_suffix | selected | ServiceStep (`{n} selected`) |
| booking_no_services_text | No services available yet — please check back soon. | ServiceStep |
| booking_choose_specialist_text | Choose your specialist | SpecialistStep |
| booking_search_specialist_placeholder | Search specialist by name | SpecialistStep |
| booking_services_suffix | services | SpecialistStep (`{n} services`) |
| change_text | Change | SpecialistStep |
| booking_no_specialists_text | No specialists match the previous selections. Try a different studio or service. | SpecialistStep |
| booking_no_cat_specialists_text | No {cat} specialists match. Try another category. | SpecialistStep (ТЕМПЛЕЙТ {cat}) |
| booking_no_search_specialists_text | No specialists match “{q}”. | SpecialistStep (ТЕМПЛЕЙТ {q}) |
| booking_pick_datetime_text | Pick date & time | DateTimeStep |
| booking_available_times_text | Available times | TimeSlotGrid |
| booking_visit_hint | Your visit takes {d} — later starts are unavailable | TimeSlotGrid (ТЕМПЛЕЙТ {d}) |
| booking_no_times_text | No available times on this day. Please pick another date. | TimeSlotGrid |
| booking_no_fitting_slots_text | No start on this day leaves enough time for the whole {d} visit before closing. Please pick another date or fewer services. | TimeSlotGrid (ТЕМПЛЕЙТ {d}) |
| booking_summary_title | Booking Summary | BookingSummary |
| booking_your_appointment_text | Your Appointment | BookingSummary |
| booking_flow_specialist_text | Choose-a-specialist flow | BookingSummary |
| booking_flow_studio_text | Studio-first flow | BookingSummary |
| booking_choose_start_hint | Choose how to start to see your booking details | BookingSummary |
| booking_complete_steps_hint | Complete the steps to see your booking details | BookingSummary |
| booking_any_specialist_text | Any specialist | BookingSummary, AnySpecialistCard |
| booking_best_match_text | Best available match | BookingSummary |
| booking_at_prefix | at | BookingSummary (`at {time}`) |
| booking_time_not_selected_text | Time not selected | BookingSummary |
| booking_more_steps_text | {n} more step(s) to complete | BookingSummary (ТЕМПЛЕЙТ {n}) |
| booking_progress_text | Booking… | BookingSummary |
| booking_step_of_text | Step {x} of {y} | BookingSummary (ТЕМПЛЕЙТ) |
| booking_step_datetime_label | Date & Time | StepBar |
| booking_any_specialist_desc | We'll assign the first available master who can perform this service. Soonest available slot included. | AnySpecialistCard |
| booking_success_title | Booked! | SuccessModal |
| booking_success_desc | Your appointment has been confirmed. We'll send you a reminder. | SuccessModal |

### D. Home (`components/layout/home/**`)

| marker | value | где |
|---|---|---|
| home_catalog_title | Service | catalog-grid (fallback заголовка блока) |
| home_offers_title | Best Offers | offers-feed |
| home_gallery_title | Gallery | gallery-feed |
| home_masters_title | Our Specialists | masters-feed |
| home_reviews_title | Reviews | reviews-carousel/index (чистый литерал) |
| no_title_text | No Title Available | catalog CatalogCardTitle |
| error_loading_pages_text | Error loading pages. | catalog CatalogGrid |
| view_all_reviews_text | View all reviews | reviews-carousel |
| previous_review_aria | Previous review | ReviewsCarousel (aria) |
| next_review_aria | Next review | ReviewsCarousel (aria) |
| go_to_review_aria | Go to review | ReviewsCarousel (aria, `{n}`) |
| promotions_aria | Promotions | HeroSlider (aria) |
| previous_slide_aria | Previous slide | HeroSlider (aria) |
| next_slide_aria | Next slide | HeroSlider (aria) |
| go_to_slide_aria | Go to slide | HeroSlider (aria, `{n}`) |

_«Beauty»/«Studio» (декоративный watermark) — не переносить._

### E. Header / Footer / Nav / Search

| marker | value | где |
|---|---|---|
| open_menu_aria | Open menu | header MenuButton |
| close_menu_aria | Close menu | header MenuButton, mobile-menu CloseModal |
| mobile_menu_aria | Mobile menu | header MobileNavPanel |
| profile_aria | Profile | header NavItemProfile |
| logout_text | Logout | header LogoutMenuItem |
| close_search_aria | Close search | header SearchModal |
| search_start_typing_text | Start typing to find a service or a specialist. | header SearchModal |
| search_nothing_found_text | Nothing found for “{q}”. | header SearchResultsList (ТЕМПЛЕЙТ) |
| footer_services_title | Services | footer MenuSection (fallback меню) |
| footer_about_title | About us | footer MenuSection (fallback меню) |

### F. Auth / Forms / Modal (`components/forms/**`, `components/layout/modal/**`)

| marker | value | где |
|---|---|---|
| calendar_text | Calendar | modal useTitleData |
| verification | Verification | modal useTitleData (добавить в CMS) |
| or_continue_with_text | or continue with | forms AuthDivider |
| google_sign_in_text | Sign in with Google | forms GoogleSignInButton |
| terms_agree_prefix | I agree to the | forms TermsConsent |
| terms_text | Terms | forms TermsConsent |
| privacy_policy_text | Privacy Policy | forms TermsConsent |
| password_label | Password | ResetPasswordForm (fallback-лейбл) |
| confirm_password_label | Confirm password | ResetPasswordForm |
| already_have_account_text | Already have an account? | SignUpForm |
| err_auth_failed | Authentication failed | SignInForm |
| err_passwords_no_match | Passwords do not match | SignUpForm |
| err_send_code_failed | Could not send the verification code | ForgotPasswordForm |
| err_change_password_failed | Could not change the password. Please try again. | ResetPasswordForm |
| err_email_missing | E-mail is missing — please start over | VerificationForm |
| err_verify_failed | Verification failed | VerificationForm |
| err_invalid_code | Invalid verification code | VerificationForm |
| err_activation_failed | Activation failed | VerificationForm |
| err_password_missing | Password is missing — please sign up again | VerificationForm |
| err_sign_in_failed | Sign-in failed | VerificationForm |
| err_resend_failed | Could not resend the code | VerificationForm |
| err_no_email_on_file | Your account has no e-mail on file — cannot save. | UserForm |
| toast_data_saved | Data saved! | UserForm |
| error_prefix | Error | SignUpForm/UserForm (`Error {code}: {msg}`) |

### G. Services / Offers / Gallery / Salon / Reviews (страницы)

| marker | value | где |
|---|---|---|
| services_hero_kicker | Beauty Studio | services ServicesHero, contacts ContactsHero |
| services_title | Services & Prices | services/index (fallback) |
| services_stat_services | Services | services StatsStrip |
| services_stat_locations | Locations | services/contacts stats |
| services_stat_categories | Categories | services StatsStrip |
| studio_label_prefix | Studio | services SalonSelector (`Studio {i} — {name}`) |
| salon_label_prefix | Salon | reviews/masters SalonFilter (`Salon {i} — {name}`) |
| search_by_service_placeholder | Search by service… | services ServicesCatalog, gallery GalleryFilterBar |
| results_word_singular | result | services ServicesCatalog (`{n} result(s)`) |
| results_word_plural | results | services ServicesCatalog |
| for_word | for | services ServicesCatalog (`results for "{q}"`) |
| no_services_match_text | No services match “{q}”. | services ServicesCatalog (ТЕМПЛЕЙТ) |
| no_services_section_text | No services in this section. | services ServicesCatalog |
| not_available_text | Not available | services ServiceCard |
| promo_limited_offer_text | Limited Offer | services PromoBanner |
| promo_first_visit_title | First Visit? Get 15% Off | services PromoBanner |
| promo_first_visit_desc | Book any service for your first visit and enjoy an exclusive welcome discount. | services PromoBanner |
| offer_included_text | What's included | offers OfferDetailPanel |
| back_to_home_text | Back to Home | offers/index |
| no_offers_text | No special offers available right now — check back soon. | offers/index |
| offer_good_to_know_text | Good to know | offers/index |
| open_photo_aria | Open photo | gallery GalleryGridCell (aria, `{title}`) |
| check_a_profile_text | Check a profile | gallery GalleryGridCell, home SpecialistCard, masters MasterCard |
| add_to_favorites_aria | Add to favorites | gallery GalleryGridCell (aria) |
| remove_from_favorites_aria | Remove from favorites | gallery GalleryGridCell (aria) |
| gallery_unavailable_text | The gallery is currently unavailable. | gallery GalleryUnavailable |
| try_again_later_text | Please try again later. | gallery GalleryUnavailable |
| photo_word | Photo | gallery/salon Lightbox (aria, `{n}`) |
| previous_photo_aria | Previous photo | gallery GalleryLightbox |
| next_photo_aria | Next photo | gallery GalleryLightbox |
| share_aria | Share | gallery GalleryLightbox |
| no_portfolio_text | No portfolio yet for this combination. | gallery/index |
| gallery_tab_service | Service | gallery GalleryFilterBar (tab) |
| gallery_tab_specialist | Specialist | gallery GalleryFilterBar (tab) |
| no_specialists_category_text | No specialists in this category yet. | gallery GalleryFilterBar, masters SpecialistQuickLinks |
| photos_word_singular | photo | gallery GalleryFilterBar (`{n} photo(s)`) |
| photos_word_plural | photos | gallery GalleryFilterBar |
| salon_address_label | Address | salon SalonSidebar |
| salon_phone_label | Phone | salon SalonSidebar |
| salon_hours_label | Hours | salon SalonSidebar |
| salon_hours_value | Daily 10:00–22:00 | salon SalonSidebar, contacts SalonCard (пока хардкод; в CMS есть `opening_time`) |
| back_to_contacts_text | Back to Contacts | salon/index |
| salon_no_photos_text | This salon has no photos yet. | salon/index |
| about_studio_text | About this studio | salon/index |
| open_salon_photo_aria | Open salon photo | salon SalonPhotoGallery (aria, `{n}`) |
| view_more_photos_aria | View {n} more salon photos | salon SalonPhotoGallery (aria, ТЕМПЛЕЙТ) |
| salon_photo_viewer_aria | Salon photo viewer | salon SalonLightbox |
| reviews_title | Reviews | reviews/index (h1) |
| reviews_word_singular | review | reviews/index (`{n} review(s)`) |
| reviews_word_plural | reviews | reviews/index |
| no_reviews_specialist_text | No reviews for this specialist yet. | reviews/index |

### H. Masters / Contacts / Profile

| marker | value | где |
|---|---|---|
| specialists_word_singular | specialist | masters/index (`{n} specialist(s)`) |
| specialists_word_plural | specialists | masters/index |
| no_specialists_found_text | No specialists found. | masters MobileSpecialistList |
| no_specialists_filter_text | No specialists match the current filter. | masters SpecialistSections |
| working_experience_label | Working experience: | master-single MasterExperience |
| back_to_specialist_text | Back to Specialist | master-single BackLink |
| reviews_label | Reviews | master-single RatingCluster |
| opening_hours_title | Opening Hours | contacts OpeningHours |
| our_locations_title | Our Locations | contacts SalonLocations |
| no_locations_text | No salon locations available at the moment. | contacts SalonLocations |
| today_text | Today | contacts OpeningHoursDayCard |
| call_us_text | Call us | contacts SalonCard |
| directions_text | Directions | contacts SalonCard |
| view_studio_text | View studio | contacts SalonCard |
| reach_out_text | Reach out | contacts ContactInfoCard |
| write_to_us_text | Write to us | contacts ContactFormCard |
| contact_success_sub_text | We'll get back to you within 24 hours. | contacts ContactFormCard |
| contact_name_label | Your name | contacts ContactFormCard |
| contact_name_placeholder | Jane Doe | contacts ContactFormCard |
| contact_phone_placeholder | +971 50 123 4567 | contacts ContactFormCard |
| contact_email_label | E-mail | contacts ContactFormCard |
| contact_email_placeholder | you@example.com | contacts ContactFormCard |
| contact_message_label | Message | contacts ContactFormCard |
| contact_message_placeholder | How can we help you? | contacts ContactFormCard |
| sending_text | Sending… | contacts ContactFormCard, RefundRequestModal |
| send_message_text | Send Message | contacts ContactFormCard |
| ready_to_visit_title | Ready to visit us? | contacts BookCtaBanner |
| ready_to_visit_desc | Book your appointment online in just a few taps — choose your studio, service and master. | contacts BookCtaBanner |
| get_in_touch_title | Get in Touch | app/contacts/page.tsx SectionHeading |
| profile_history_tab | History | profile MobileTabs |
| profile_upcoming_text | Upcoming | profile ProfileHistory |
| profile_completed_text | Completed | profile ProfileHistory |
| profile_canceled_text | Canceled | profile ProfileHistory |
| no_visits_text | No visits yet | profile VisitGroups |
| profile_title | Profile | profile/index, ProfileCard (fallback) |
| pay_text | Pay | profile PayOrderButton |
| opening_checkout_text | Opening checkout… | profile PayOrderButton |
| err_open_checkout | Could not open the checkout. Please try again. | profile PayOrderButton |
| cancel_this_appointment_title | Cancel this appointment? | profile CancelConfirmModal |
| free_cancellation_text | Free cancellation up to 24 hours before your appointment. | profile CancelConfirmModal |
| keep_appointment_text | Keep appointment | profile CancelConfirmModal |
| yes_cancel_text | Yes, cancel | profile CancelConfirmModal |
| cancelling_text | Cancelling… | profile CancelConfirmModal |
| appointment_not_cancelled_title | Appointment not cancelled | profile CancelOrderButton/CancelErrorModal |
| appointment_cancelled_title | Appointment cancelled | profile CancelSuccessModal |
| appointment_cancelled_desc | Your appointment has been cancelled and moved to “Canceled”. | profile CancelSuccessModal |
| refund_not_requested_title | Refund not requested | profile CancelOrderButton |
| request_refund_title | Request a refund | profile RefundRequestModal |
| refund_explain_text | This appointment has already been paid, so it can't be cancelled online. We can send the salon a refund request — they confirm it and return the money to your payment method. | profile RefundRequestModal (text) |
| request_refund_button | Request refund | profile RefundRequestModal |
| not_now_text | Not now | profile RefundRequestModal |
| refund_requested_title | Refund requested | profile RefundSuccessModal |
| refund_requested_desc | The salon has received your refund request. They will confirm it and return the money to your payment method — the appointment stays in your list until then. | profile RefundSuccessModal (text) |
| err_save_order | Could not save the order | profile SaveOrderButton (осиротевший файл) |
| auth_required_text | Authorization required | AuthError (добавить в CMS) |
| cancel_booking_text | Cancel booking | profile CancelOrderButton (добавить в CMS) |
| reschedule_text | Reschedule | profile RescheduleOrderButton (добавить в CMS) |

### I. App-level (страницы ошибок, 404, метаданные, утилиты) + Shared

| marker | value | где |
|---|---|---|
| site_unavailable_desc | The content service is currently unavailable. Please try again later. | layout.tsx |
| something_went_wrong_title | Something went wrong | error.tsx |
| error_load_page_desc | We couldn't load this page. Please try again in a moment. | error.tsx |
| global_error_desc | Something went wrong on our end. Please try again in a moment. | global-error.tsx |
| not_found_desc | The page you are looking for does not exist or has been moved. | not-found.tsx |
| return_home_text | Return home | not-found.tsx |
| logging_in_text | Logging in… | google auth callback |
| redirecting_text | Redirecting… | google CallbackClient |
| err_auth_canceled | Authorization was canceled | google CallbackClient |
| err_no_auth_code | No authorization code | google CallbackClient |
| err_google_sign_in | Google sign-in failed | google CallbackClient |
| review_thank_you_toast | Thank you for your review! | shared review-modal |
| review_prompt_text | Please leave a review about your visit | shared review-modal |
| review_placeholder | Tell us about your visit… | shared review-modal |
| confirm_text | Confirm | shared review-modal |
| rate_star_aria | Rate {n} star(s) | shared StarPicker (aria, ТЕМПЛЕЙТ) |
| add_photo_aria | Add photo | shared review-modal PhotoRow |
| remove_photo_aria | Remove photo | shared review-modal PhotoRow |
| rating_aria | Rating of {r} out of {t} | shared StarsGroup (aria, ТЕМПЛЕЙТ) |

**Утилиты `app/utils/*` (server, dict недоступен напрямую — фолбэки оставить; в CMS завести на будущее):** `errorHandler.ts` (`An error occurred`, `Bad Request…`, `Unauthorized…`, `Forbidden…`, `Not Found…`, `Internal Server Error…`), `toErrorMessage.ts` (`An unexpected error occurred`), `formatOrderCancelError.ts` / `formatRefundError.ts` (тексты диалогов отмены/возврата), `parseOpeningTime.ts` (`Sunday..Saturday`, `Closed`), `formatMinutes.ts` (`min`/`h`). Метаданные (SEO): `OneEntry Beauty`, `Default Title/Description`, `Special Offers`, `Contacts`/`Contact information` — фолбэки `cmsPageMetadata`, приходят из CMS `page.title`.

### J. НЕ в `system_content` — отдельные CMS-сущности (данные, не UI-чром)

Эти строки — **контент**, а не подписи интерфейса; уедут в свои сущности CMS (уже в плане — см. «Открытые вопросы» §1, §2, §5). **Кодом не трогать** (лежат в `components/data/*` и локальных `*.ts` как временный стейджинг):
- **Отзывы:** `components/data/reviewsData.ts` (4), `components/layout/reviews-page/data.ts` (17 отзывов + имена мастеров + названия/адреса салонов) → сущность отзывов (`reviews` / `reviews_carousel`).
- **Условия офферов:** `components/data/offerTermsData.ts` (4 пункта) → атрибут оффера/страницы offers.
- **Карточки контактов:** `components/data/contactInfoData.ts` (`General phone`/`E-mail us`/`Head office`/`Working hours` + адрес/телефон/e-mail) → сущность контактов.
- **Соцсети:** `components/data/socialData.ts` (`Instagram`/`Facebook`/`Twitter` + URL) → `system_content` или отдельная сущность (план §5).
- **Копирайт:** `components/data/copyrightsData.ts` (`Thalia Beauty Studio`, год).
- **Проза салонов:** `components/layout/salon-page/salonContent.ts` (About-абзацы + highlights по 3 салонам) → атрибут страницы салона.
- **Таксономия:** `components/layout/gallery-page/taxonomy.ts`, `masters-page/taxonomy.ts`, `reviews-page` cats — названия категорий/подкатегорий/ролей `Hair/Face/Body/Nails/...` совпадают с категориями каталога CMS (брать из CMS, не из словаря).

### K. Исключено из локализации (осознанно)

Декоративный watermark (`Beauty`/`Studio` фон catalog), `aria-roledescription` `carousel`/`slide` (стандарт a11y), числовые коды `404`/`401` (h1), одиночные глифы (`U` инициал, `✕`, `dirham` — имя символа AED), календарные `MONTHS`/`DAYS` (booking constants), dev-дашборд `app/api-test/**` (не пользовательский UI).
