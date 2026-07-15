/**
 * prefetchPopup — warm a popup's chunk before the user opens it.
 *
 * Popups are mounted lazily by PopupRoot, so the first click pays for
 * downloading the chunk. Calling this on `onPointerEnter` / `onFocus` of a
 * trigger starts that download during the hover, making the popup appear
 * instantly on click. It is safe to call repeatedly: the bundler resolves each
 * chunk once and later calls hit the module cache.
 *
 * The import paths are static literals — a dynamic path cannot be code-split.
 * @param {'MobileMenu' | 'SignInForm'} popup - Which popup trigger was hovered
 */
export const prefetchPopup = (popup: 'MobileMenu' | 'SignInForm'): void => {
  if (popup === 'MobileMenu') {
    void import('@/components/layout/mobile-menu').catch(() => {});
    return;
  }
  /** The forms modal shell plus the form it will render. */
  void import('@/components/layout/modal').catch(() => {});
  void import('@/components/forms/SignInForm').catch(() => {});
};
