'use client';

import { createContext } from 'react';

/**
 * VisitOpenContext carries the expanded/collapsed state of the enclosing
 * visit-history section (`VisitSection`) down to the cards inside it.
 *
 * The section itself collapses with the CSS `grid-template-rows: 0fr → 1fr`
 * technique, which keeps its children mounted — so the cards cannot learn about
 * the toggle from a re-mount. `VisitCardAnimations` reads this flag instead and
 * plays its entrance/exit on every toggle. Defaults to `true` so a card used
 * outside a section still animates in normally.
 */
const VisitOpenContext = createContext<boolean>(true);

export default VisitOpenContext;
