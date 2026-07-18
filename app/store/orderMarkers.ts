/**
 * Order storage and status markers configured in the OneEntry admin panel.
 *
 * These identifiers are scattered across the booking and profile code as string
 * literals; keeping them in one module means a rename in the admin panel is a
 * one-line change here instead of a hunt through six call sites.
 */

/** Marker of the orders storage object (`Orders.*` API). */
export const ORDERS_STORAGE_MARKER = 'orders';

/** Form identifier used to create an order. */
export const ORDERS_FORM_IDENTIFIER = 'order';

/**
 * Field markers of the `order` form's attribute set: `master` (list), `salon`
 * (entity → salon page) and `interval` (timeInterval) — the three fields
 * `createOrder` actually accepts. Verified against a real POST (the form's
 * public attribute listing disagrees; the set wins — see `useBookingSubmit`).
 * Centralised here so an admin-panel rename stays a one-line change.
 */
export const ORDER_FIELD_MASTER = 'master';
export const ORDER_FIELD_SALON = 'salon';
export const ORDER_FIELD_INTERVAL = 'interval';

/** Status of an appointment that has not happened yet. */
export const ORDERS_STATUS_UPCOMING = 'upcoming';

/** Status of an appointment that took place. */
export const ORDERS_STATUS_COMPLETED = 'completed';

/** Status of an appointment cancelled by the client. */
export const ORDERS_STATUS_CANCELED = 'canceled';

/** Identifier of the offline "pay at the salon" payment account. */
export const PAYMENT_ACCOUNT_CASH = 'cash';

/**
 * Payment accounts that redirect the client to an external gateway.
 *
 * A whitelist, not `!== 'cash'`: with a blacklist any future OFFLINE provider
 * (bank transfer, gift card) would be mistaken for an online one, sent through
 * `createSession` and would never reach the success screen. Extend this list
 * when a new gateway is connected in the admin panel.
 */
export const ONLINE_PAYMENT_ACCOUNTS: readonly string[] = ['stripe'];
