import { createRoot } from "react-dom/client";
import { ChatWidget } from "./ChatWidget";
import "./styles/widget.css";

// Inject color vars as a JS-managed <style> tag and keep it at the end of <head>.
// Shopify themes can inject new CSS after our widget loads; when two !important rules
// share the same specificity, the last one in source order wins. By moving our tag to
// the end of <head> every time a new stylesheet appears, we always win.
const COLORS_STYLE_ID = "__ovr-widget-colors__";

const COLOR_VARS_CSS = `
.aui-root,
[data-radix-popper-content-wrapper] {
  --color-background: oklch(1 0 0) !important;
  --color-foreground: oklch(0.14 0.005 285.82) !important;
  --color-card: oklch(1 0 0) !important;
  --color-card-foreground: oklch(0.14 0.005 285.82) !important;
  --color-popover: oklch(1 0 0) !important;
  --color-popover-foreground: oklch(0.14 0.005 285.82) !important;
  --color-primary: oklch(0.58 0.185 295) !important;
  --color-primary-foreground: oklch(1 0 0) !important;
  --color-secondary: oklch(0.97 0.018 295) !important;
  --color-secondary-foreground: oklch(0.38 0.09 295) !important;
  --color-muted: oklch(0.97 0.018 295) !important;
  --color-muted-foreground: oklch(0.52 0.018 290) !important;
  --color-accent: oklch(0.94 0.030 295) !important;
  --color-accent-foreground: oklch(0.38 0.09 295) !important;
  --color-destructive: oklch(0.577 0.245 27.325) !important;
  --color-border: oklch(0.92 0.012 295) !important;
  --color-input: oklch(0.92 0.012 295) !important;
  --color-ring: oklch(0.70 0.13 295) !important;
}
`;

function pinColorVars() {
  let el = document.getElementById(COLORS_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = COLORS_STYLE_ID;
    el.textContent = COLOR_VARS_CSS;
  }
  // appendChild moves the element to the end if it already exists in <head>,
  // ensuring our vars are always the last !important declaration in source order.
  document.head.appendChild(el);
}

pinColorVars();

// Load Recoleta Bold via @font-face served from our own server
if (!document.getElementById("__ovr-recoleta-font__")) {
  const style = document.createElement("style");
  style.id = "__ovr-recoleta-font__";
  style.textContent = `@font-face {
    font-family: 'Recoleta';
    font-style: normal;
    font-weight: 700;
    src: url('https://api.ovrai.co/frontend/recoleta-bold.woff') format('woff');
    font-display: swap;
  }`;
  document.head.appendChild(style);
}

// Re-pin whenever Shopify (or anything else) appends a new stylesheet to <head>.
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (
        node instanceof HTMLStyleElement ||
        (node instanceof HTMLLinkElement && node.rel === "stylesheet")
      ) {
        pinColorVars();
        return;
      }
    }
  }
});
observer.observe(document.head, { childList: true });

const container = document.createElement("div");
container.id = "__chat-widget-root__";
document.body.appendChild(container);

createRoot(container).render(<ChatWidget />);
