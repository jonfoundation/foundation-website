# Resource hub architecture and performance

Starting main: fde6e666379f6d9d45cfda1a33c3d0710ab80db2. Fetched origin/main and confirmed a clean synchronized main before branching. Branch: codex/resource-hub-architecture. All six packet files were read and all four Markdown SHA-256 hashes matched the manifest. No material architecture conflict was found.

The resource landing page now has accessible on-demand text search, the three approved Start Here guides, five project topics, three decision topics, six recent guides and the existing discovery-call CTA. One explicit configuration owns all topic metadata, pillars and primary assignments. Shared Nunjucks templates generate all eight hubs, each with one existing optimized pillar image and a complete server-rendered text list. The 51,650-byte search JSON contains only title, summary, URL, topic and KB ID for published articles. Search uses textContent and fetches only on interaction; no prefetch or catalog embedding.

## Publication and preservation

| Measure | Before | After |
| --- | ---: | ---: |
| Published authoritative sources | 166 | 166 |
| Generated article pages | 166 | 166 |
| Article sitemap URLs | 166 | 166 |
| Resource landing sitemap URLs | 1 | 1 |
| Topic sitemap URLs | 0 | 8 |
| Total sitemap URLs | 169 | 177 |
| Unique continuous hub_order | 1–166 | 1–166 |

Every existing source and generated article remains unchanged in Git, including prose, route, canonical, metadata, schema and hub_order. All 166 generated article files were compared with starting main; only checkout line endings differed after generation. Those non-substantive changes were restored, and the generator now skips unchanged HTML to prevent further churn. Shared header/footer prefixes are configurable for nested topic directories and retain identical article output. Analytics code and events are unchanged. No new images were created.

## Primary assignments

- Kitchen Renovations: **25**
- Bathroom Renovations: **26**
- Whole-Home Renovations: **41**
- Home Additions: **9**
- Accessory Dwelling Units (ADUs): **30**
- Planning & Priorities: **10**
- Budgeting & Financing: **7**
- Teams, Contracts & Construction: **18**

Total: 166, exactly once each. Initial explicit assignments follow existing KB families and categories; future published IDs must be explicitly classified. KB-2200, “Who Should Be on Your Renovation Team?”, is the teams pillar because it introduces the general team structure before specialized hiring, contracts and construction decisions. Other pillars match the packet.

## Performance evidence

Edge headless, fresh contexts, local HTTP, 1440×844 and 390×844, no scrolling or search interaction. Resource entries sampled 1.5 seconds after fonts were ready. Image bytes sum existing asset payload sizes for initial img requests, including shared logos; requests include document, fonts, styles, scripts and images. Browser lazy-loading proximity can vary by viewport. Content-image count is the initial main HTML count.

| Viewport | HTML bytes before → after | Content images before → after | Initial image bytes before → after | Initial requests before → after |
| --- | ---: | ---: | ---: | ---: |
| 1440×844 | 121434 → 12240 | 166 → 3 | 26039726 → 241166 | 175 → 13 |
| 390×844 | 121434 → 12240 | 166 → 3 | 26039726 → 342334 | 175 → 13 |

Only three content thumbnails appear in initial HTML, below the maximum of 12; the full article catalog is absent. All new below-fold images are lazy-loaded, async-decoded and explicitly dimensioned.

Additional local browser indicators: desktop LCP 484 → 352 ms, CLS 0.02972 → 0.00300; mobile LCP 448 → 276 ms, CLS 0.02413 → 0.00019. Long-task blocking time was zero before and after. These are unthrottled lab samples, not field Core Web Vitals or an INP certification. No material regression was observed.

## Validation

Passed before commit:

- node scripts/validate-resources.mjs — all 166 sources, images, metadata and hub orders.
- node scripts/build-resources.mjs — published production output.
- node scripts/build-resources.mjs --drafts --output .preview — draft preview; hubs and search remain published-only.
- node scripts/validate-generated-resources.mjs — article schemas, related links, dates, topic collections/breadcrumbs, published-only search, main thumbnail/catalog limits and exact sitemap comparison.
- node scripts/verify-resources-deterministic.mjs — two clean byte-identical production builds (177 files) and two clean draft-preview builds (176 files).
- node scripts/test-resource-topics.mjs — missing, duplicate, unknown/unpublished and invalid topic failure cases, future-publication requirement and draft exclusion.
- node scripts/validate-resource-site.mjs — 177 public pages, metadata, self-canonicals, JSON-LD, one analytics loader per page and 7,704 local link/fragment/asset references.
- node scripts/test-analytics.mjs — production-only loading, duplicate initialization guard, discovery_call_click parameters and excluded origins, without network events.
- Existing browser analytics regression suite — one intercepted Google tag, one config and four expected booking click events on production origin; zero tags/events on Pages preview, localhost and 127.0.0.1. No events sent to Google.
- git diff --check.

All nine hub pages passed browser checks at desktop and 390×844: zero broken images, horizontal overflow, clipped elements, console errors, runtime errors or analytics requests. Screenshots of every page were visually reviewed. Mouse and keyboard search passed including mixed case, Enter, Tab to results, actual result navigation, empty query, no results and HTML-like query text. Search JSON made zero initial requests and one request on first focus. With JavaScript disabled at mobile width, actual topic and article links were clicked and the union of server-rendered lists reached all 166 articles. An initial sticky expanded no-JavaScript menu obstruction was fixed by making that fallback header static.

Evidence scripts, JSON and screenshots are retained in ignored .preview/hub-* files. Hosted HTTP, Cloudflare preview and final synchronization evidence are added to the pull request after normal preview deployment. No merge or manual production deployment is authorized or performed.

## Implementation details

Production --output builds now place their sitemap in the selected output directory, allowing deterministic production checks without mutating root sitemap state. The preview server serves JSON with the correct MIME type. Existing responsive CSS is preserved; additions are scoped to compact hubs. No repository Cloudflare build configuration was present; generated static output continues through the existing Git integration. Node entry points were used for the package workflows. Browser execution required elevation because sandboxed Edge failed to launch; the successful runs used the existing bundled Playwright and Edge.

## Exact changed files (34)

- css/style.css
- data/resource-topics.json
- docs/publishing/2026-10-25-resource-hub-architecture.md
- js/resource-search.js
- package.json
- resources/adus/index.html
- resources/bathroom-renovations/index.html
- resources/budgeting-financing/index.html
- resources/home-additions/index.html
- resources/index.html
- resources/kitchen-renovations/index.html
- resources/planning-priorities/index.html
- resources/resource-index.json
- resources/teams-contracts-construction/index.html
- resources/whole-home-renovations/index.html
- scripts/build-resources.mjs
- scripts/lib/generation.mjs
- scripts/lib/topics.mjs
- scripts/serve-preview.mjs
- scripts/test-analytics.mjs
- scripts/test-resource-topics.mjs
- scripts/validate-generated-resources.mjs
- scripts/validate-resource-site.mjs
- scripts/validate-resources.mjs
- scripts/verify-resources-deterministic.mjs
- sitemap.xml
- templates/resources/hub-layout.html
- templates/resources/index.html
- templates/resources/partials/footer.html
- templates/resources/partials/header.html
- templates/resources/partials/hub-cta.html
- templates/resources/partials/hub-guide.html
- templates/resources/partials/topic-link.html
- templates/resources/topic.html
