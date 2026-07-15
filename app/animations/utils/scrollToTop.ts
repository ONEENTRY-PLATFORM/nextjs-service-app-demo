import { gsap } from 'gsap';

/** Whether ScrollToPlugin has already been registered with GSAP. */
let registered = false;
/** In-flight import promise, so concurrent calls load the chunk once. */
let loading: Promise<void> | null = null;

/**
 * Lazily import and register GSAP's ScrollToPlugin.
 *
 * Private helper: idempotent and deduplicated, so repeated navigations reuse
 * the already-loaded chunk. Failures reset the promise so a later navigation
 * can retry (the caller always has the native fallback).
 * @returns {Promise<void>} Resolves once the plugin is registered.
 */
const ensureScrollToPlugin = (): Promise<void> => {
  if (registered) {
    return Promise.resolve();
  }
  if (!loading) {
    loading = import('gsap/dist/ScrollToPlugin')
      .then((mod) => {
        gsap.registerPlugin(mod.ScrollToPlugin);
        registered = true;
      })
      .catch(() => {
        loading = null;
      });
  }
  return loading;
};

/**
 * scrollToTop — reset the window scroll as part of a route-transition timeline.
 *
 * ScrollToPlugin is only needed while navigating, so it is loaded on demand
 * rather than registered eagerly at app start. The very first navigation may
 * happen before the chunk resolves — that case falls back to a native
 * `window.scrollTo`, and subsequent navigations use the GSAP tween.
 * @param {gsap.core.Timeline} timeline - Transition timeline to attach the scroll to.
 */
export const scrollToTop = (timeline: gsap.core.Timeline): void => {
  /** Fire-and-forget: warms the plugin for the next navigation. */
  void ensureScrollToPlugin();

  if (registered) {
    timeline.set(window, { scrollTo: 0 });
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
};
