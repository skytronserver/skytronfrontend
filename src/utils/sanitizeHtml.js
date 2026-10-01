// Minimal allow-list HTML sanitizer for messages that intentionally contain
// simple formatting (<br>, <strong>, links). Anything else - <script>, <img>,
// <svg>, event handlers (onerror=...), javascript: URLs - is removed, so a
// value echoed back from the server can't execute in the page (VAPT: XSS).
import { toCspHtml } from './cspNonce';

const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'P', 'DIV', 'SPAN', 'UL', 'OL', 'LI', 'A']);
const SAFE_HREF = /^(https?:\/\/|\/(?!\/)|#|mailto:)/i;

const cleanNode = (node) => {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) return;
    if (child.nodeType !== Node.ELEMENT_NODE || !ALLOWED_TAGS.has(child.tagName)) {
      // Drop disallowed elements but keep their text content
      child.replaceWith(document.createTextNode(child.nodeType === Node.ELEMENT_NODE ? child.textContent : ''));
      return;
    }
    [...child.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      // Inline styles arrive as data-csp-style (see toCspHtml); the caller
      // applies them with applyInlineStyles after rendering.
      const keep =
        (name === 'href' && child.tagName === 'A' && SAFE_HREF.test(attr.value.trim())) ||
        (name === 'data-csp-style' && !/url\s*\(|expression\s*\(/i.test(attr.value));
      if (!keep) child.removeAttribute(attr.name);
    });
    if (child.tagName === 'A') child.setAttribute('rel', 'noopener noreferrer');
    cleanNode(child);
  });
};

export const sanitizeHtml = (html) => {
  if (html === null || html === undefined) return '';
  // style="" -> data-csp-style before parsing: the CSP flags inline style
  // attributes even inside DOMParser documents.
  const doc = new DOMParser().parseFromString(`<div>${toCspHtml(html)}</div>`, 'text/html');
  const root = doc.body.firstChild;
  cleanNode(root);
  return root.innerHTML;
};

export default sanitizeHtml;
