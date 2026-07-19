import '@/app/globals.css';
import '@/app/styles/nav-menu.scss';

import type { Metadata } from 'next';
import { Lato, League_Gothic } from 'next/font/google';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX, ReactNode } from 'react';

import { getMenuByMarker, LANG_CODE } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { AuthProvider } from '@/app/store/providers/AuthContext';
import { OpenDrawerProvider } from '@/app/store/providers/OpenDrawerContext';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import StoreProvider from '@/app/store/providers/StoreProvider';
import { getSiteUrl } from '@/app/utils/getSiteUrl';
import { serializeJsonLd } from '@/app/utils/serializeJsonLd';
import BottomMenu from '@/components/layout/bottom-menu';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import PopupRoot from '@/components/layout/PopupRoot';
import ResponsiveToastContainer from '@/components/shared/ResponsiveToastContainer';

import IntroAnimations from './animations/IntroAnimations';
import RegisterGSAP from './animations/RegisterGSAP';
import TransitionProvider from './animations/TransitionProvider';

// export const revalidate = 10;
// export const dynamicParams = true;

/*
 * Header / Footer / BottomMenu are server components and IntroAnimations SSRs
 * (`ssr: true`); all four render unconditionally on every page. `dynamic()`
 * bought nothing here — no code-splitting for server components, no deferral
 * for an always-rendered SSR'd client component — just extra chunk boundaries,
 * so they are imported statically.
 */

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-lato',
});

/**
 * Condensed display face for the hero banner titles — the font baked into the
 * promo artwork. Exposed as the `--font-league-gothic` CSS variable and applied
 * to the hero / CTA overlays via `style={{ fontFamily: 'var(--font-league-gothic)' }}`.
 *
 * Single weight by design: League Gothic ships only 400 (its variable axis is
 * `wdth`, not `wght`). Do not put `font-medium`/`font-semibold` on text using
 * it — there is no heavier cut to select, so the browser fakes one.
 */
const leagueGothic = League_Gothic({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-league-gothic',
});

/** This site's public origin (NOT the CMS host) — for OG/canonical/JSON-LD. */
const siteUrl = getSiteUrl();

/** Site name fallback when the `system_content` dictionary is unavailable. */
const SITE_NAME_FALLBACK = 'Thalia Beauty Studio';

/**
 * Resolve the public site name from the `system_content` dictionary
 * (`site_name`), falling back to the hardcoded brand name.
 * @returns {Promise<string>} Site name for metadata and structured data
 */
const getSiteName = async (): Promise<string> => {
  const dict = await getDictionary();
  return (dict?.site_name?.value as string | undefined) || SITE_NAME_FALLBACK;
};

/**
 * Site metadata driven by the CMS: the title (and og:siteName) come from the
 * `site_name` UI-text of the `system_content` block. `getDictionary()` is
 * cached, so the extra call is free.
 * @returns {Promise<Metadata>} Root metadata object
 * @see {@link https://nextjs.org/docs/app/building-your-application/optimizing/metadata Next.js docs}
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return {
    // Absolute base for every relative URL in metadata (OG images, canonical,
    // alternates) across all pages — child `generateMetadata` inherits it, so
    // relative paths resolve against THIS site's origin instead of being
    // emitted relative (which crawlers reject). Also silences Next's
    // "metadataBase is not set" build warning.
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: 'Beauty salon in Dubai — hair, face, body and nail services',
    openGraph: {
      type: 'website',
      locale: LANG_CODE,
      url: siteUrl,
      siteName,
    },
  };
}

/** BCP-47 language tag for `<html lang>` — derived from the SDK's `lang_TERRITORY` `LANG_CODE`. */
const HTML_LANG = LANG_CODE.replace('_', '-');

/**
 * Generate structured data for the website
 * @param   {string} siteName - Public site name (from `system_content`)
 * @returns {object}          Structured data in JSON-LD format
 */
const generateStructuredData = (siteName: string): object => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/icons/thalia_logo.svg`,
    sameAs: [
      'https://www.facebook.com/OneEntry',
      'https://twitter.com/OneEntry',
      'https://www.instagram.com/OneEntry',
    ],
  };
};

/**
 * Root layout.
 * @param   {object}               params          - page params.
 * @param   {ReactNode}            params.children - Child components to render within the layout
 * @returns {Promise<JSX.Element>}                 Root layout JSX.Element.
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/layout Next.js docs}
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<JSX.Element> {
  /**
   * The dictionary and the main menu are independent — fetch them in parallel
   * so the whole tree is not serialized behind two sequential round trips.
   */
  const [dictData, { error, isError, menu }] = await Promise.all([
    getDictionary(),
    getMenuByMarker('main'),
  ]);
  /** Get dictionary and set to server provider */
  const [dict] = ServerProvider('dict', dictData);

  /**
   * Only a confirmed "resource is closed" (403) is fatal enough to replace the
   * whole site with a notice. Any other menu error (transient/network/5xx)
   * degrades to a normal layout with an empty menu — MainMenu and the mobile
   * drawer already handle a menu without pages gracefully.
   */
  const isClosed =
    isError &&
    error?.statusCode === 403 &&
    /resource is closed/i.test(error?.message ?? '');

  if (isClosed) {
    // Root layout MUST always render <html>/<body> — otherwise Next.js
    // throws "Missing <html> and <body> tags in the root layout".
    return (
      <html lang={HTML_LANG}>
        <body
          className={`${lato.variable} ${leagueGothic.variable} flex min-h-screen flex-col`}
        >
          <main className="flex grow flex-col items-center justify-center gap-3 p-8 text-center">
            <h1 className="text-2xl font-bold">Site temporarily unavailable</h1>
            <p className="text-base text-neutral-600">
              The content service is currently unavailable. Please try again
              later.
            </p>
          </main>
        </body>
      </html>
    );
  }

  /** Fall back to an empty menu when it failed to load for a non-fatal reason. */
  const safeMenu = (menu ?? { pages: [] }) as IMenusEntity;

  return (
    <html lang={HTML_LANG}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              generateStructuredData(
                (dict?.site_name?.value as string | undefined) ||
                  SITE_NAME_FALLBACK,
              ),
            ),
          }}
        />
      </head>
      <body
        className={`${lato.variable} ${leagueGothic.variable} flex min-h-screen flex-col`}
      >
        <RegisterGSAP />
        <StoreProvider>
          <AuthProvider>
            <OpenDrawerProvider>
              <Header menu={safeMenu} />
              <TransitionProvider>
                {/* Spacer matching the fixed header height (h-20) */}
                <div className="h-20"></div>
                <main className="flex grow flex-col overflow-hidden">
                  {children}
                </main>
                <Footer dict={dict} />
              </TransitionProvider>
              <BottomMenu />
              {/* Mounts (and downloads) only the popup that is actually open. */}
              <PopupRoot dict={dict} />
            </OpenDrawerProvider>
          </AuthProvider>
          <IntroAnimations />
        </StoreProvider>
        <ResponsiveToastContainer />
      </body>
    </html>
  );
}
