<img src="https://oneentry.cloud/img/git/oneenrty_light.png" alt="OneEntry Headless CMS" width="200" />

# Thalia Beauty Studio — OneEntry Next.js example

Thalia Beauty Studio is a beauty-salon website for a Dubai studio, built with **Next.js** and fully powered by **OneEntry Headless CMS**. Everything on the site — services and prices, special offers, the specialists roster, the gallery, salon locations, opening hours and all UI copy — is managed from the OneEntry admin panel.

The project doubles as a free, ready-to-use front-end template that shows how to drive a real, content-heavy site entirely from OneEntry.

## Demo

[https://demo-beauty.1entry.cloud](https://demo-beauty.1entry.cloud 'DEMO')

## Project Goals

1. **Showcase OneEntry's capabilities** on a real-world site: a service catalogue, appointment booking, offers, a specialists directory and a CMS-driven UI-text dictionary.

2. **Simplify development for front-end developers**: use the code as-is or adapt the design and add features, cutting front-end setup time.

3. **Ready-to-use starting point**: a fully functional codebase already wired to OneEntry — tailor it to a specific salon or service business.

## Key Features

- **Full control via the admin panel** — pages, service cards, categories, offers, specialists and blocks are all editable in OneEntry, no code changes required.
- **Appointment booking** — clients pick a service and specialist and book an appointment; orders and their statuses (`upcoming` / `completed` / `canceled`) are managed in the CMS.
- **Service catalogue** — the full price list (services grouped by category: hair, face, body, nails) with durations and prices, driven from OneEntry products.
- **Special offers** — curated promotions with sale prices and bundled services.
- **Specialists directory** — masters (OneEntry admins) with ratings, experience, portfolios and the services they perform.
- **Gallery & salon locations** — image galleries and multiple salon branches with addresses, phones and opening hours.
- **CMS-editable UI copy** — every interface string (labels, headings, empty states, messages) lives in the `system_content` dictionary, with English fallbacks in code (see [UI Text Dictionary](docs/Dictionary.md)).
- **Feedback & contact forms** — customizable forms with captcha protection to prevent spam.
- **Payments** — secure checkout via [Stripe].
- **Auth & user accounts** — registration and activation via email/phone (and Google OAuth), with a private profile and order history.
- **State management** — Redux Toolkit plus server state.
- **Modern stack** — Next.js 16, React 19, TypeScript, Tailwind CSS v4, GSAP animations, `lucide-react` icons.

## Project Documentation

This is a [Next.js](https://nextjs.org/) project.

[Ready-to-use backend and Admin panel](https://doc.oneentry.cloud/ 'Documentations OneEntry Headless CMS')

[NPM SDK](https://oneentry.cloud/instructions/npm 'NPM SDK OneEntry Headless CMS')

For detailed information about specific aspects of the project, please refer to the documentation files:

- [Animations](docs/Animations.md) - Details about the GSAP animation system and components
- [Authorization](docs/Authorization.md) - Information about JWT tokens and AuthContext
- [Error Handling](docs/ErrorHandling.md) - Guide to the centralized error handling system
- [Events](docs/Events.md) - Explanation of event notifications and WebSocket usage
- [Appointment Booking Flow](docs/OrderFlow.md) - How the appointment booking process works
- [State Management](docs/StateManagement.md) - Redux Toolkit and state management approach
- [User State](docs/UserState.md) - How user state is implemented and synchronized
- [UI Text Dictionary](docs/Dictionary.md) - How UI copy is stored in the `system_content` attribute set and read via `getDictionary` / `useDict`

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file.

1. Copy `.env.example` to `.env`
2. Add the following environment variables:

```dotenv
NEXT_PUBLIC_ONEENTRY_URL=https://xxx-xxx-xxx.oneentry.cloud
NEXT_PUBLIC_ONEENTRY_TOKEN=xxxxxGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

## Run Locally

Requires **Node.js ≥ 22.14.0**.

Clone the project

```bash
git clone https://github.com/kvasss/oneentry-next-beauty-v2.git
```

Go to the project directory

```bash
cd oneentry-next-beauty-v2
```

Install dependencies

```bash
npm install
```

Start the dev server

```bash
npm run dev
```

Open [http://localhost:3700](http://localhost:3700) with your browser to see the result.

## Build

```bash
npm run build
npm run start
```

## Quality Checks

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit (app + jest configs)
npm test            # Jest unit tests
npm run test:e2e    # Playwright end-to-end tests
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

### Important files and folders

| File(s) / Folder(s)               | Description                                   |
| --------------------------------- | --------------------------------------------- |
| `.env`                            | OneEntry project configuration                |
|                                   |                                               |
| `@/app`                           | Next.js app entry points                      |
| `@/app/layout.tsx`                | Main layout                                   |
| `@/app/api/utils/dictionaries.ts` | UI-text dictionary reader (`system_content`)  |
| `@/app/animations`                | GSAP animations & transition providers        |
| `@/app/api`                       | API, methods and hooks definition             |
| `@/app/store`                     | Redux-Toolkit management and core reducers    |
| `@/app/store/providers`           | React contexts and providers                  |
| `@/app/types`                     | Types for TypeScript                          |
|                                   |                                               |
| `@/components`                    | All app components                            |
| `@/components/forms`              | All app forms                                 |
| `@/components/icons`              | Svg icons with additional props               |
| `@/components/layout`             | All app layouts                               |
| `@/components/pages`              | Simple app pages                              |
| `@/components/shared`             | Shared between layouts components             |
|                                   |                                               |
| `/public`                         | Public content folder                         |
