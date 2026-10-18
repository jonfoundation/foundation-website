(() => {
  'use strict';
  // Only the canonical production origin may load Google or send events.
  if (window.location.origin !== 'https://foundationrenovationcoaching.com' || window.foundationAnalyticsInitialized) return;
  window.foundationAnalyticsInitialized = true;

  const measurementId = 'G-2HFSPXJEJ8';
  const bookingUrl = 'https://calendar.app.google/AaKjGPcvFGHM815i9';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // Let the single config command send the normal initial page_view.
  window.gtag('config', measurementId);

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(tag);

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link || link.href !== bookingUrl) return;
    const location = link.closest('.site-header') ? 'header'
      : link.closest('.cta-band') ? 'contact_cta'
      : link.closest('.site-footer') ? 'footer'
      : link.closest('section[id]')?.id || 'article_body';
    window.gtag('event', 'discovery_call_click', {
      page_path: window.location.pathname,
      cta_location: location
    });
  });
})();
