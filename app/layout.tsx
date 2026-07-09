import '@/app/globals.css';
import '@/app/styles/nav-menu.scss';
import 'react-toastify/dist/ReactToastify.css';

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Lato } from 'next/font/google';
import type { JSX, ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

import { getMenuByMarker, LANG_CODE } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { AuthProvider } from '@/app/store/providers/AuthContext';
import { OpenDrawerProvider } from '@/app/store/providers/OpenDrawerContext';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import StoreProvider from '@/app/store/providers/StoreProvider';
import OffscreenModal from '@/components/layout/mobile-menu';
import Modal from '@/components/layout/modal';

import RegisterGSAP from './animations/RegisterGSAP';
import TransitionProvider from './animations/TransitionProvider';

const BottomMenu = dynamic(() => import('@/components/layout/bottom-menu'), {
  ssr: true,
});
const Header = dynamic(() => import('@/components/layout/header'), {
  ssr: true,
});
const Footer = dynamic(() => import('@/components/layout/footer'), {
  ssr: true,
});
const IntroAnimations = dynamic(() => import('./animations/IntroAnimations'), {
  ssr: true,
});

// export const revalidate = 10;
// export const dynamicParams = true;

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-lato',
});

const oneentryUrl =
  process.env.NEXT_PUBLIC_ONEENTRY_URL || 'https://oneentry.cloud';

/**
 * Homepage static metadata
 * @see {@link https://nextjs.org/docs/app/building-your-application/optimizing/metadata Next.js docs}
 * @param params page params
 */
export const metadata: Metadata = {
  title: {
    default: 'OneEntry Beauty',
    template: '%s | OneEntry Beauty',
  },
  description: 'OneEntry next-js Beauty description',
  openGraph: {
    type: 'website',
    locale: LANG_CODE,
    url: oneentryUrl,
  },
};

/** BCP-47 language tag for `<html lang>` — derived from the SDK's `lang_TERRITORY` `LANG_CODE`. */
const HTML_LANG = LANG_CODE.replace('_', '-');

/**
 * Generate structured data for the website
 * @returns {object} Structured data in JSON-LD format
 */
const generateStructuredData = (): object => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OneEntry Beauty',
    url: oneentryUrl,
    logo: `${oneentryUrl}/logo.png`,
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
  /** Get dictionary and set to server provider */
  const [dict] = ServerProvider('dict', await getDictionary());
  const { error, isError, menu } = await getMenuByMarker('main');

  if (isError || !menu) {
    // Root layout MUST always render <html>/<body> — otherwise Next.js
    // throws "Missing <html> and <body> tags in the root layout".
    const isClosed =
      error?.statusCode === 403 &&
      /resource is closed/i.test(error?.message ?? '');
    const heading = isClosed
      ? 'Site temporarily unavailable'
      : 'Something went wrong';
    const details = isClosed
      ? 'The content service is currently unavailable. Please try again later.'
      : (error?.message ?? 'Unable to load site navigation.');

    return (
      <html lang={HTML_LANG}>
        <body className={`${lato.variable} flex min-h-screen flex-col`}>
          <main className="flex grow flex-col items-center justify-center gap-3 p-8 text-center">
            <h1 className="text-2xl font-bold">{heading}</h1>
            <p className="text-base text-neutral-600">{details}</p>
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang={HTML_LANG}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData()),
          }}
        />
      </head>
      <body className={`${lato.variable} flex min-h-screen flex-col`}>
        <RegisterGSAP />
        <StoreProvider>
          <AuthProvider>
            <OpenDrawerProvider>
              <Header menu={menu} />
              <TransitionProvider>
                <div className="h-32.5 max-xl:h-27.5 max-lg:h-27.5 max-md:h-22.5 max-sm:h-18.75"></div>
                <main className="flex grow flex-col overflow-hidden">
                  {children}
                </main>
                <Footer dict={dict} />
              </TransitionProvider>
              <BottomMenu />
              <Modal dict={dict} />
              <OffscreenModal menu={menu} />
            </OpenDrawerProvider>
          </AuthProvider>
          <IntroAnimations />
        </StoreProvider>
        <ToastContainer position="bottom-right" autoClose={2000} />
      </body>
    </html>
  );
}
