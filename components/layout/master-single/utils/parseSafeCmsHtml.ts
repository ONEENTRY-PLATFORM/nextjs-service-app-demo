import type { DOMNode, HTMLReactParserOptions } from 'html-react-parser';
import parse, { domToReact, Element } from 'html-react-parser';
import type { ReactElement, ReactNode } from 'react';
import { createElement, Fragment } from 'react';

/**
 * Tags rendered as themselves (with every attribute stripped — see the `<a>`
 * exception in {@link parseSafeCmsHtml}). Formatting and structure the admin's
 * rich-text editor legitimately produces.
 */
const ALLOWED_TAGS = new Set([
  'p',
  'div',
  'span',
  'br',
  'hr',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'sub',
  'sup',
]);

/**
 * Tags removed together with their content: either executable/embedding
 * surfaces (script, iframe, object, svg) or elements whose inner text is
 * garbage outside its native context (style, form controls, head metadata).
 * Anything not listed in either set is unwrapped — the tag goes, its children
 * stay, so prose inside an exotic wrapper is not lost.
 */
const DROPPED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'frame',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'link',
  'meta',
  'base',
  'svg',
  'math',
  'template',
  'noscript',
  'audio',
  'video',
  'source',
  'track',
]);

/**
 * isSafeHref — may this link target be rendered into an `href`?
 *
 * Resolved against a dummy base so scheme tricks (`java\tscript:`, mixed case,
 * leading control characters) collapse to their real protocol before the
 * check; a relative path resolves to the base's `https:` and passes.
 * @param   {string}  href - Raw `href` attribute from admin HTML
 * @returns {boolean}      `true` for http(s)/mailto/tel and relative targets
 */
const isSafeHref = (href: string): boolean => {
  try {
    const { protocol } = new URL(href, 'https://relative.invalid');
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol);
  } catch {
    return false;
  }
};

/**
 * Rebuild one element node from the allowlist, dropping every attribute.
 * @param   {Element}      node - Parsed element node
 * @returns {ReactElement}      Sanitized replacement (element, children or nothing)
 */
const sanitizeElement = (node: Element): ReactElement => {
  const name = node.name.toLowerCase();
  if (DROPPED_TAGS.has(name)) {
    return createElement(Fragment);
  }

  const children = node.children as DOMNode[];
  if (!ALLOWED_TAGS.has(name)) {
    /** Unknown wrapper: keep the prose, lose the tag. */
    return createElement(Fragment, null, domToReact(children, sanitizeOptions));
  }

  /** The one attribute that survives: a safe `href` (links keep working). */
  const props: Record<string, string> = {};
  if (name === 'a') {
    const href = node.attribs?.href;
    if (href && isSafeHref(href)) {
      props.href = href;
      if (node.attribs?.target === '_blank') {
        props.target = '_blank';
        props.rel = 'noopener noreferrer';
      }
    }
  }

  return children.length > 0
    ? createElement(name, props, domToReact(children, sanitizeOptions))
    : createElement(name, props);
};

/** Parser options applied recursively to every node of the admin HTML. */
const sanitizeOptions: HTMLReactParserOptions = {
  replace: (node) =>
    node instanceof Element ? sanitizeElement(node) : undefined,
};

/**
 * parseSafeCmsHtml — admin-panel rich text (`master_description` and friends)
 * turned into React nodes through an allowlist.
 *
 * `html-react-parser` alone converts arbitrary HTML on an allow-all basis, so
 * a compromised admin account is a stored-XSS vector (audit 2026-07-26):
 * React neutralises string event handlers, but `<a href="javascript:...">`,
 * embeds and style/script payloads pass straight through. Here every element
 * is rebuilt: unlisted tags are unwrapped to their children, executable
 * surfaces are dropped with their content, and all attributes are discarded
 * except a scheme-checked `href` (plus `rel` hardening for `target="_blank"`).
 * @param   {string}    html - Raw `htmlValue` of a rich-text CMS attribute
 * @returns {ReactNode}      Sanitized React tree, safe to render as-is
 */
export const parseSafeCmsHtml = (html: string): ReactNode =>
  parse(html, sanitizeOptions);
