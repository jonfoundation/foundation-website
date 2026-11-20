(() => {
  'use strict';
  if (window.location.origin !== 'https://foundationrenovationcoaching.com' || window.foundationMetaInitialized) return;
  window.foundationMetaInitialized = true;
  const key = 'foundation-meta-consent-v1';
  const bookingUrl = 'https://calendar.app.google/AaKjGPcvFGHM815i9';
  let enabled = false;
  const blocked = () => navigator.globalPrivacyControl === true;
  const stored = () => { try { return localStorage.getItem(key); } catch { return null; } };
  function enable() {
    if (enabled || blocked()) return;
    enabled = true;
    if (window.fbq) { window.fbq('consent', 'grant'); return; }
    // Meta base queue; no advanced matching or automatic event configuration.
    const fbq = window.fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    window._fbq = fbq;
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    fbq('set', 'autoConfig', false, '4653762358201114');
    fbq('init', '4653762358201114');
    fbq('consent', 'grant');
    fbq('track', 'PageView');
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
  function choose(value) {
    try { localStorage.setItem(key, value); } catch { /* Choice applies to this page only. */ }
    if (value === 'accepted' && !blocked()) enable();
    else {
      enabled = false;
      if (window.fbq) window.fbq('consent', 'revoke');
      // Remove first-party Meta cookies after withdrawal.
      for (const name of ['_fbp', '_fbc']) {
        for (const domain of ['', '; domain=foundationrenovationcoaching.com', '; domain=.foundationrenovationcoaching.com']) {
          document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax; Secure`;
        }
      }
    }
  }
  function controls() {
    const panel = document.createElement('aside');
    panel.setAttribute('aria-label', 'Meta advertising privacy choices');
    panel.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:560px;z-index:10000;background:#fff;color:#182b36;padding:20px;border:1px solid #637570;border-radius:8px;box-shadow:0 4px 24px #0003;font:16px/1.5 system-ui;';
    const message = document.createElement('p');
    message.textContent = blocked()
      ? 'Your browser’s Global Privacy Control is enabled. Meta advertising tracking is disabled.'
      : 'Allow Meta advertising tracking? If you accept, we share page visits and Discovery Call link clicks with Meta to measure our Facebook and Instagram ads. Meta may use this activity to personalize ads. This choice controls Meta tracking only; the site also uses Google Analytics.';
    panel.appendChild(message);
    const settings = document.createElement('button');
    settings.type = 'button'; settings.textContent = 'Ad privacy choices';
    settings.style.cssText = 'position:static;padding:0;background:none;color:inherit;border:0;border-radius:0;font:inherit;text-decoration:underline;cursor:pointer;';
    const dismiss = () => { panel.hidden = true; settings.hidden = false; };
    for (const [label, value] of blocked() ? [['Close', 'rejected']] : [['Reject Meta tracking', 'rejected'], ['Accept Meta tracking', 'accepted']]) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label;
      button.style.cssText = 'padding:10px;margin:4px;border:1px solid #637570;border-radius:4px;background:#fff;color:#182b36;cursor:pointer;';
      button.addEventListener('click', () => { choose(value); dismiss(); settings.focus(); });
      panel.appendChild(button);
    }
    settings.addEventListener('click', () => { panel.hidden = false; settings.hidden = true; panel.querySelector('button').focus(); });
    panel.hidden = blocked() || stored() !== null;
    settings.hidden = !panel.hidden;
    document.body.appendChild(panel);
    const footer = document.querySelector?.('.site-footer .legal') || document.body;
    footer.appendChild(settings);
  }
  if (stored() === 'accepted' && !blocked()) enable();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', controls, { once: true });
  else controls();
  window.addEventListener('storage', (event) => {
    if (event.key === key) {
      // Reload to apply a changed choice without reinitializing an existing Pixel.
      window.location.reload();
    }
  });
  document.addEventListener('click', (event) => {
    if (!enabled || blocked()) return;
    if (event.target.closest?.('a[href]')?.href !== bookingUrl) return;
    window.fbq('trackCustom', 'DiscoveryCallClick');
  });
})();
