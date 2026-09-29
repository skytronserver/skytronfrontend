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

// Inline style="" attributes in HTML strings (innerHTML) are blocked by the
// CSP, but setting the same declarations through the CSSOM is allowed. Call
// this after putting one of our own HTML templates into the page.
export const applyInlineStyles = (root) => {
  if (!root) return;
  const nodes = root.querySelectorAll ? [root, ...root.querySelectorAll("[style]")] : [];
  nodes.forEach((el) => {
    const css = el.getAttribute && el.getAttribute("style");
    if (css) el.style.cssText = css;
  });
};

// Add the nonce to <style> blocks of an HTML document we write ourselves
// (e.g. print windows opened with window.open, which inherit this CSP).
export const withStyleNonce = (html) =>
  cspNonce ? html.replace(/<style>/g, `<style nonce="${cspNonce}">`) : html;
