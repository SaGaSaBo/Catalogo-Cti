// lib/scroll-lock.ts
let prevBodyCss = "";
let prevHtmlCss = "";
let savedY = 0;

function getScrollbarWidth() {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

export function lockBodyScroll() {
  if (typeof window === "undefined") return;

  const body = document.body;
  const html = document.documentElement;
  savedY = window.scrollY || window.pageYOffset || 0;

  const sbw = getScrollbarWidth();

  prevBodyCss = body.getAttribute("style") || "";
  prevHtmlCss = html.getAttribute("style") || "";

  // Evita layout shift compensando el ancho de la scrollbar
  body.style.position = "fixed";
  body.style.top = `-${savedY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  if (sbw > 0) body.style.paddingRight = `${sbw}px`;

  // Evita "scroll chaining" en navegadores que lo soportan
  (html.style as any).overscrollBehaviorY = "none";

  // iOS fix: evitamos que los toques fuera del modal arrastren el body
  // -> Este handler se registra en el paso 3 dentro del modal
}

export function unlockBodyScroll() {
  if (typeof window === "undefined") return;

  const body = document.body;
  const html = document.documentElement;

  body.setAttribute("style", prevBodyCss);
  html.setAttribute("style", prevHtmlCss);

  // Restaurar la posición exacta
  window.scrollTo(0, savedY);
}
