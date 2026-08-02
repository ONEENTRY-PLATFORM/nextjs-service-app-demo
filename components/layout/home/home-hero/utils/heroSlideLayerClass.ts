/**
 * heroSlideLayerClass — classes of one stacked carousel item: it fills the layer
 * and crossfades with its neighbours, the current one on top. Shared by the
 * background and the text layer so both stacks fade in lockstep.
 * @param   {boolean} isCurrent - Whether this item is the slide on screen
 * @returns {string}            Class list for the stacked item wrapper
 */
export const heroSlideLayerClass = (isCurrent: boolean): string =>
  'absolute inset-0 transition-opacity duration-700 ' +
  (isCurrent ? 'opacity-100' : 'pointer-events-none opacity-0');
