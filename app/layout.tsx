import './globals.css';
import type { Metadata } from 'next';
import CartButton from '@/components/CartButton';
import DevtoolsListenersDebug from '@/app/debug/devtools-listeners';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Catálogo ALTOCONCEPTO',
  description: 'Catálogo mayorista ALTOCONCEPTO - Sistema de gestión de productos',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script id="anti-reload" strategy="beforeInteractive">
          {`
(function() {
  try {
    var search = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
    var enabled = !!(search && search.get('antiReload') === '1');
    try { if (!enabled && typeof localStorage !== 'undefined') enabled = localStorage.getItem('antiReload') === '1'; } catch (e) {}

    if (!enabled) return;

    // Pequeño HUD de diagnóstico
    var hud = document.createElement('div');
    hud.style.cssText = "position:fixed;z-index:2147483647;right:8px;top:8px;background:#111;color:#fff;padding:6px 10px;border-radius:8px;font:12px/1.4 system-ui, -apple-system, Segoe UI, Roboto;opacity:.9;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,.3)";
    hud.textContent = "antiReload ON";
    document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(hud); });

    function stamp(msg) {
      if (!hud) return;
      hud.textContent = "antiReload: " + msg;
    }

    // Log helper
    function logReload(kind, extra) {
      var err = new Error("reload/redirect blocked");
      // stack visible en consola → te muestra archivo/línea del caller
      console.warn("⚠️ Blocked " + kind, extra || "", err.stack);
      stamp(kind);
    }

    // Parchear location.* (reload/replace/assign)
    var loc = window.location;
    var origReload  = loc.reload.bind(loc);
    var origReplace = loc.replace.bind(loc);
    var origAssign  = loc.assign.bind(loc);

    loc.reload = function() {
      logReload("location.reload()");
      // descomentar para permitir manualmente:
      // if (window.__allowReloadManually) return origReload();
    };
    loc.replace = function(url) {
      logReload("location.replace()", url);
      // if (window.__allowReloadManually) return origReplace(url);
    };
    loc.assign = function(url) {
      logReload("location.assign()", url);
      // if (window.__allowReloadManually) return origAssign(url);
    };

    // Señaladores de eventos sospechosos
    var suspects = ["resize","visibilitychange","focus","blur","orientationchange","controllerchange","beforeunload"];
    suspects.forEach(function(ev){
      var tgt = (ev === "controllerchange" && navigator.serviceWorker) ? navigator.serviceWorker : window;
      try {
        (tgt || window).addEventListener(ev, function() {
          console.log("[antiReload] event:", ev, new Date().toISOString());
          stamp(ev);
        });
      } catch(e){}
    });

    // Si algún SW intenta forzar reload al actualizarse, no lo hagas.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', function() {
        console.log("[antiReload] SW controllerchange (update) → recarga bloqueada");
      });
    }

    // Wrap genérico de addEventListener para detectar callbacks que intentan recargar
    var origAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (["resize","visibilitychange","focus","blur","orientationchange","beforeunload"].includes(type) && typeof listener === "function") {
        var wrapped = function() {
          try { return listener.apply(this, arguments); }
          catch (e) { console.error("[antiReload] handler error", e); }
          finally {
            // Tras ejecutar el handler, chequeo si intentaron tocar location
            // (los parches de arriba loguean stack si se llamó reload/replace/assign)
          }
        };
        return origAdd.call(this, type, wrapped, options);
      }
      return origAdd.call(this, type, listener, options);
    };

    console.log("%cantiReload enabled","background:#111;color:#0f0;padding:2px 6px;border-radius:4px");
    // Tip: para permitir una recarga manualmente en consola:
    // window.__allowReloadManually = true; location.reload();
  } catch (e) {
    console.error("[antiReload] init error", e);
  }
})();
          `}
        </Script>
      </head>
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased">
        <div id="root">{children}</div>
        <CartButton />
        {process.env.NODE_ENV !== "production" ? <DevtoolsListenersDebug /> : null}
      </body>
    </html>
  );
}