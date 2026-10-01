// Content-Security-Policy nonce support (VAPT: unsafe CSP directive).
//
// The CSP has no 'unsafe-inline' for styles. nginx replaces __CSP_NONCE__ in
// index.html with a fresh random value per page load and sends the same value
// in the CSP header, so only <style> elements carrying it are applied.

const PLACEHOLDER = "__CSP_NONCE__";

const readNonce = () => {
  const meta = document.querySelector('meta[property="csp-nonce"]');
  const value = meta?.getAttribute("content");
  // Unreplaced placeholder (e.g. `npm start`, no nginx in front): no nonce.
  return value && value !== PLACEHOLDER ? value : undefined;
};

export const cspNonce = readNonce();

// Create a <style> element the CSP will accept.
export const createStyleElement = () => {
  const style = document.createElement("style");
  if (cspNonce) style.nonce = cspNonce;
  return style;
};

const CSP_STYLE_ATTR = "data-csp-style";

// Inline style="" attributes in HTML strings are blocked by the CSP (and the
// browser logs a violation as soon as the HTML is parsed - even by DOMParser).
// Setting the same declarations through the CSSOM is allowed. So our own HTML
// templates go through two steps:
//   el.innerHTML = toCspHtml(html);   // style="..." -> data-csp-style="..."
//   applyInlineStyles(el);            // data-csp-style -> el.style.cssText
// toCspHtml only rewrites attribute names inside tags, never visible text.
export const toCspHtml = (html) =>
  String(html ?? "").replace(/<[a-zA-Z][^<>]*>/g, (tag) =>
    tag.replace(/(\s)style(\s*=)/gi, `$1${CSP_STYLE_ATTR}$2`)
  );

export const applyInlineStyles = (root) => {
  if (!root || !root.querySelectorAll) return;
  [root, ...root.querySelectorAll(`[${CSP_STYLE_ATTR}], [style]`)].forEach((el) => {
    if (!el.getAttribute) return;
    const css = el.getAttribute(CSP_STYLE_ATTR) ?? el.getAttribute("style");
    if (css) el.style.cssText = css;
    el.removeAttribute(CSP_STYLE_ATTR);
  });
};

// Add the nonce to <style> blocks of an HTML document we write ourselves
// (e.g. print windows opened with window.open, which inherit this CSP).
export const withStyleNonce = (html) =>
  cspNonce ? html.replace(/<style>/g, `<style nonce="${cspNonce}">`) : html;
