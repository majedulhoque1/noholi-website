import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/noholi-logo.png";

type BootState = "loading" | "ready" | "error";
declare global {
  interface Window {
    __noholiLoading?: {
      state: BootState;
      ready: () => void;
      fail: () => void;
      /** The app is running: cancel a bundle-wait timeout and start the settle guard. */
      hydrated: () => void;
    };
  }
}

// How long the page may sit in the HTML before the application bundle starts running (hydration).
// A cold dev server compiles on first request and can take 30s+, so dev gets a much longer budget;
// production fails sooner because a bundle that has not arrived after a minute is not coming.
const BUNDLE_WAIT_MS = import.meta.env.DEV ? 180_000 : 60_000;
// Once the app is running, how long the first route may take to settle before we call it stuck.
const SETTLE_WAIT_MS = 30_000;

// Delivered in the HTML, independent of the application bundle: recovery still
// works when that bundle cannot download or hydration never starts.
//
// The script never touches DOM that React renders: it flags the failure on <html>
// (`data-noholi-boot`, see `suppressHydrationWarning` in the root shell) and CSS does the rest.
// Changing the loading screen itself before hydration would be a hydration mismatch.
//
// The watchdog only fires while the bundle has not started. A timeout error is undone as soon as
// the app does start (`hydrated`), so a slow-but-working load never ends on the error screen. A
// failed <script> download or a route error is a real failure and stays.
export const initialLoadingScript = `(function(){
var timer,boot,reason='';
function flag(state){
 if(state==='error')document.documentElement.setAttribute('data-noholi-boot','error');
 else document.documentElement.removeAttribute('data-noholi-boot');
}
function change(state,why){
 if(boot.state!=='loading')return;
 boot.state=state;reason=why||'';clearTimeout(timer);flag(state);
 window.dispatchEvent(new Event('noholi-loading-change'));
}
boot=window.__noholiLoading={
 state:'loading',
 ready:function(){change('ready')},
 fail:function(){change('error','fail')},
 hydrated:function(){
  clearTimeout(timer);
  if(boot.state==='error'&&reason==='timeout'){boot.state='loading';reason='';flag('loading');window.dispatchEvent(new Event('noholi-loading-change'))}
  if(boot.state==='loading')timer=setTimeout(function(){change('error','timeout')},${SETTLE_WAIT_MS});
 }
};
timer=setTimeout(function(){change('error','timeout')},${BUNDLE_WAIT_MS});
window.addEventListener('error',function(event){
 if(event.target && event.target.tagName==='SCRIPT')change('error','fail');
},true);
})();`;

// Critical styles must be available before the external stylesheet arrives.
// These tokens are intentionally isolated from the site's day/night theme.
export const initialLoadingCss = `
:root{--loading-paper:oklch(0.975 0.008 85);--loading-ink:oklch(0.21 0.015 60);--loading-muted:oklch(0.48 0.018 65)}
#noholi-initial-loading{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;background:var(--loading-paper);color:var(--loading-ink);font-family:"Open Sans","Noto Sans Bengali",sans-serif;padding:24px;box-sizing:border-box}
.noholi-loading-inner{width:100%;max-width:360px;text-align:center}
.noholi-loading-logo{display:block;width:180px;height:auto;aspect-ratio:294/192;object-fit:contain;margin:0 auto 24px;animation:noholi-loading-pulse 2s ease-in-out infinite}
@keyframes noholi-loading-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.97)}}
@media (prefers-reduced-motion:reduce){.noholi-loading-logo{animation:none}}
.noholi-loading-status{font-size:14px;line-height:1.6;color:var(--loading-muted)}
.noholi-loading-recovery{display:none}
#noholi-initial-loading[data-state=error] .noholi-loading-status{display:none}
#noholi-initial-loading[data-state=error] .noholi-loading-recovery{display:block}
.noholi-loading-recovery h1{font-family:Georgia,"Noto Serif Bengali",serif;font-size:24px;font-weight:400;line-height:1.3;margin:0 0 12px}
.noholi-loading-recovery p{font-size:14px;line-height:1.6;margin:0 0 20px}
.noholi-loading-retry{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;background:var(--loading-ink);color:var(--loading-paper);text-decoration:none;border-radius:4px;font-size:14px}
.noholi-loading-retry:focus-visible{outline:2px solid var(--loading-ink);outline-offset:4px}
html[data-noholi-boot=error] .noholi-loading-status{display:none}
html[data-noholi-boot=error] .noholi-loading-recovery{display:block}
.noholi-loading-content[data-loading=true]{visibility:hidden}
`;

export function InitialLoading({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BootState>("loading");
  useEffect(() => {
    const sync = () => setState(window.__noholiLoading?.state ?? "ready");
    sync();
    window.addEventListener("noholi-loading-change", sync);
    return () => window.removeEventListener("noholi-loading-change", sync);
  }, []);

  return (
    <>
      {state !== "ready" && (
        <div id="noholi-initial-loading" data-state={state} aria-label="Noholi initial loading">
          <div className="noholi-loading-inner">
            {/* TODO: the original animated loading GIF is awaited from the client; until it arrives the static logo pulses gently (CSS only, disabled for prefers-reduced-motion). */}
            <img className="noholi-loading-logo" src={logo} alt="Noholi" width={294} height={192} />
            <div className="noholi-loading-status" role="status" aria-live="polite">
              Loading Noholi…
            </div>
            <div className="noholi-loading-recovery" role="alert">
              <h1>Noholi couldn’t finish loading</h1>
              <p>Please check your connection and reload to try again.</p>
              <Button asChild className="noholi-loading-retry">
                <a href="">Reload page</a>
              </Button>
            </div>
          </div>
        </div>
      )}
      <div
        className="noholi-loading-content"
        data-loading={state !== "ready"}
        inert={state !== "ready"}
      >
        {children}
      </div>
    </>
  );
}

/** Called only once the initial route has mounted and its styles/fonts settled. */
export function InitialReady({ pending }: { pending: boolean }) {
  // Runs once on mount and before the effect below: tells the boot script the app is alive.
  useEffect(() => {
    window.__noholiLoading?.hydrated();
  }, []);
  useEffect(() => {
    if (pending || window.__noholiLoading?.state !== "loading") return;
    let cancelled = false;
    let frame = 0;
    // Font delivery must not strand an otherwise usable page. This is a maximum
    // budget, never a minimum display duration.
    let fontTimer: ReturnType<typeof setTimeout> | undefined;
    const fontBudget = new Promise<void>((resolve) => {
      fontTimer = setTimeout(resolve, 4000);
    });
    void Promise.race([document.fonts?.ready ?? Promise.resolve(), fontBudget]).then(() => {
      if (cancelled) return;
      if (fontTimer) clearTimeout(fontTimer);
      frame = requestAnimationFrame(() => window.__noholiLoading?.ready());
    });
    return () => {
      cancelled = true;
      if (fontTimer) clearTimeout(fontTimer);
      cancelAnimationFrame(frame);
    };
  }, [pending]);
  return null;
}
