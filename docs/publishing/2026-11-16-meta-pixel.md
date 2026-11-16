# Meta website tracking

Pixel/dataset: Foundation Website, ID 4653762358201114.

The existing production-only analytics loader loads /js/meta-pixel.js. No Meta request is made until explicit acceptance. This choice covers Meta only, not the existing Google Analytics integration; the notice states this distinction. Global Privacy Control blocks Meta even after a previously saved acceptance. The persistent Ad privacy choices button allows withdrawal. Withdrawal revokes consent and clears first-party _fbp/_fbc cookies, but cannot undo information already sent. With unavailable storage the choice lasts only for the page.

Automatic Advanced Matching and automatic event configuration are off. No Conversions API is included. There is deliberately no unconditional noscript tracking image, which would bypass the choice. Meta receives its normal browser/network information and page URL after acceptance; do not put private client information in public page URLs.

Events:
- PageView: once when the Pixel first initializes on an accepted page visit.
- DiscoveryCallClick: custom event for the exact existing Google Calendar booking link. This is a click, not a confirmed lead or booking.
- Existing GA4 discovery_call_click and sample-download events remain unchanged.

No Lead or Schedule event is sent. Confirmed bookings remain independently verified through Calendar and the lead tracker until a reliable booking confirmation integration exists.

## Checks before merge

Run npm run test:meta-pixel, npm run test:analytics, npm run validate:resource-site, and git diff --check. Tests use mocked browser APIs and send no analytics traffic.

## After deployment

In a real browser on the canonical production site, verify reject sends no requests to connect.facebook.net or facebook.com/tr; accept loads the correct Pixel once and emits PageView; unrelated clicks emit no custom event; the booking link emits only DiscoveryCallClick without submitting a booking. Confirm receipt in Events Manager Test events. Reopen Ad privacy choices and reject; verify further click events stop. Test a fresh GPC-enabled browser and a preview hostname for no Meta requests. Do not count these controlled checks as actual inquiries. Review the privacy notice alongside the tracking change. No ad campaign is launched by this code.

Rollback: remove the Meta loader block from js/analytics.js. Existing Google Analytics remains intact.
