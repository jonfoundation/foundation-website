# Coordinated SEO, analytics and navigation batch

Prepared for review October 18, 2026. Not merged or deployed.

## Baseline and scope

Starting main: `d47013eaa7c186e01cec6a036d83809f2532597e`. Fetch completed; main, origin/main and HEAD matched with a clean tree before branching. Branch: `codex/seo-analytics-navigation-batch`.

Published authoritative sources: **119 → 119**. Generated article pages: **119 → 119**. Sitemap article URLs: **119 → 119**. Highest hub_order: **119 → 119**. The resource index is an additional sitemap URL, excluded from the article count.

All three reviewed Git blobs matched the packet exactly: KB-2526 `67687cc07875537ae7ce0201d5a64661fcf96a29`, KB-2707 `dd34c85f70b1564643a8b48df4f9e3d6643a7df5`, KB-2211 `a1c0dd0bfb6a9b5806c90613e1332d66c266a323`. No newer source reconciliation was needed. No ancestor or repository AGENTS.md was found. README publishing guidance, both generators/libraries, validators, resource templates, site configuration, CSS and existing JavaScript were inspected. No pre-existing GA, Google tag, GTM or analytics events were found.

1. Applied the packet's precise structural, prefab and renovation-coach edits to authoritative sources. Preserved titles, routes, publication dates, existing qualifications, images, metadata and CTAs. Changed structural related IDs to KB-2210, KB-2501, KB-2519. Added the exact five-row prefab comparison with scoped row/column headers and a keyboard-focusable scrolling region.
2. Added one shared, deferred analytics loader to homepage, Services, and both resource templates. Regenerated all 119 articles and the hub so future builds inherit analytics.
3. Added global 130px scroll-margin-top for main-content IDs. Kept existing smooth scrolling and navigation. Actual measured header bottom: approximately 106px desktop and 79px mobile.
4. Added three contextual internal links in the requested sections. All six edited articles use updated_date 2026-10-18; original publication dates are unchanged. Confirm this editorial date against the actual release if merge is delayed.

## Analytics

Measurement ID: **G-2HFSPXJEJ8**. Account: Foundation Renovation Coaching; property/stream: Foundation Website; stream ID: 16129843243. Enhanced measurement is configured externally as enabled; it was not changed here.

The loader returns before creating a tag, queue or listener unless location.origin exactly equals https://foundationrenovationcoaching.com. Localhost, 127.0.0.1, Pages previews, branch hosts, www and HTTP are excluded. A global initialization guard prevents reconfiguration and listener duplication. One config command supplies the standard initial page view; there is no manual page_view event or competing installation.

One delegated document click listener sends discovery_call_click for the exact existing booking destination https://calendar.app.google/AaKjGPcvFGHM815i9. Parameters: page_path (originating pathname) and cta_location (header, section ID, contact_cta, footer or article_body). No booking URL, target, rel, default action or appointment state is changed. A click is not a confirmed booking.

Coverage checks: exactly one loader on **122 pages** (homepage, Services, hub and 119 articles). Repeated-execution VM checks passed for production plus seven excluded origins. Browser checks with intercepted Google/booking requests verified one tag and exactly four events from four homepage booking clicks on the production origin, with header/top/about/contact_cta locations; excluded Pages, localhost and 127.0.0.1 origins produced zero tag requests and zero events. No test events were sent to GA4.

**Live production collection is not verified.** After merge, verify Realtime/DebugView, single page views, page/CTA parameters, preview exclusion and real booking-link behavior. Keep events separate from actual appointments.

## Contextual link counts

| Source | Destination | Source before/after | HTML before/after |
| --- | --- | --- | --- |
| /resources/adu-planning-guide (KB-2700) | /resources/financing-an-adu | 0 → 1 | 0 → 1 |
| /resources/how-to-build-an-adu-budget (KB-2726) | /resources/financing-an-adu | 0 → 1 | 0 → 1 |
| /resources/how-to-compare-contractor-bids (KB-2206) | /resources/what-should-be-included-in-a-construction-contract | 0 → 1 | 0 → 1 |

## Validation

Passed repository commands (Node entry points used because npm is absent from PATH):

- node scripts/validate-resources.mjs
- node scripts/build-resources.mjs
- node scripts/build-resources.mjs --drafts --output .preview
- node scripts/validate-generated-resources.mjs
- node scripts/verify-resources-deterministic.mjs (120 generated files)
- git diff --check

Additional checks passed: all 122 public pages have canonicals and allow indexing; Article/Breadcrumb/other JSON-LD parses; hub order, related cards, TOCs, dates and sitemap match sources. **5,673 local references** resolve, including fragments and assets. Public emails and booking URLs match configured destinations. Forbidden legacy domains, editorial/packet notes, TODO/TBD/lorem ipsum and placeholder markers are absent from public HTML. The existing educational word “placeholders” describes budget allowances and is retained. No unintended body/metadata changes in the other 113 articles; their only HTML change is the analytics loader.

Browser review: Microsoft Edge headless, desktop **1440×844** and mobile **390×844**, homepage, Services, hub, all three SEO articles, all three contextual-link sources and representative KB-1001. Screenshots and QA scripts/results are retained in ignored .preview/. The new table initially exposed the mobile grid's intrinsic minimum width; setting article-body min-width:0 fixes it. Final mobile wrapper width 348px, table scroll width 540px, document width **390px**; horizontal scrolling stays inside the accessible table wrapper. Desktop table fits its article column.

Final browser rerun passed all 20 page/viewport combinations: no document overflow, broken images, runtime errors or console errors. Visible headings, cards, callouts and CTAs have no clipped content. The hub's intentionally screen-reader-only resource-library heading is correctly visually clipped by its existing accessibility class.

| Homepage anchor | Desktop heading top / header bottom | Mobile heading top / header bottom |
| --- | --- | --- |
| How It Works | 278 / 106px | 255 / 79px |
| Services | 278 / 106px | 254 / 79px |
| About | 278 / 106px | 347 / 79px |
| FAQ | 278 / 106px | 300 / 79px |

All complete headings clear the sticky header with space. Existing homepage Services navigation goes to /services/, not #services; preserved that route and tested the homepage fragment directly. Other navigation tests click actual links, including opening/closing the mobile menu.

## Priority URL verification

All five URLs were checked on live production before publishing and against local final output. Each live response returned **200** at its exact self-referencing canonical, readable H1/content, no noindex, no X-Robots-Tag restriction, and sitemap inclusion. Production robots.txt allows / and references the canonical-domain sitemap. All four resource URLs appear as crawlable links in the resource index. The whole-home planning guide links to its budget guide; /resources/home-additions-planning-guide links to the home-addition budget guide. The structural article's live render also returned 200 with its title and definition present.

- https://foundationrenovationcoaching.com/services/
- https://foundationrenovationcoaching.com/resources/what-should-be-included-in-a-construction-contract
- https://foundationrenovationcoaching.com/resources/how-to-build-whole-home-renovation-budget
- https://foundationrenovationcoaching.com/resources/how-to-build-home-addition-budget
- https://foundationrenovationcoaching.com/resources/financing-an-adu

Local final-output canonical/indexability/internal-link checks passed. Recheck production after merge because this batch is not live yet. The old-domain referring sitemap observation is not evidence of a broken sitemap. Search Console requests remain **Indexing requested**, not confirmed indexed; no requests were resubmitted. Review indexing around **October 21, 2026**.

## Editorial workflow and post-merge work

The user approved these website adaptations in the coordinated request. The repository exposes no separate editorial approval/version workflow beyond authoritative Markdown, metadata and generated output. Master-source follow-up: reconcile the six website adaptations with the corresponding master documents after approval/publication; this batch does not edit masters or Drive trackers. Record actual deployment only after publication. Update trackers only after merge and production verification, including release date, exact changes, page-specific queries, equal 28-day pre/post windows, and an early 14-day discovery/regression check. Avoid attributing lift to this small simultaneous batch without supporting evidence.

No new articles, images, FAQ schema, prices, claims, deployments or indexing submissions. No material packet conflicts or scope deviations. Implementation details: added the absent CSS for existing table-wrap convention; constrained grid minimum width to contain table overflow; used direct Node package-script entry points. Initial shell TLS checks failed; Node --use-system-ca resolved trusted-certificate verification without disabling TLS checks.

## Exact changed-file inventory (134)

- `content/resources/kb-2206.md`
- `content/resources/kb-2211.md`
- `content/resources/kb-2526.md`
- `content/resources/kb-2700.md`
- `content/resources/kb-2707.md`
- `content/resources/kb-2726.md`
- `css/style.css`
- `docs/publishing/2026-10-18-seo-analytics-navigation.md`
- `index.html`
- `js/analytics.js`
- `resources/adu-design-permit-process.html`
- `resources/adu-feasibility-study.html`
- `resources/adu-planning-guide.html`
- `resources/adu-rental-income-property-value-financial-expectations.html`
- `resources/adu-surveys-engineering-technical-reports.html`
- `resources/adu-vs-home-addition.html`
- `resources/architect-led-design-vs-design-build-whole-home-renovation.html`
- `resources/architect-vs-residential-designer-vs-interior-designer.html`
- `resources/avoid-over-improving-your-home.html`
- `resources/balance-wants-needs-whole-home-renovation.html`
- `resources/bring-more-natural-light-into-your-home.html`
- `resources/choose-kitchen-appliances-for-renovation.html`
- `resources/choose-kitchen-layout-for-your-home.html`
- `resources/choose-right-team-whole-home-renovation.html`
- `resources/common-adu-cost-drivers-budget-surprises.html`
- `resources/common-adu-planning-mistakes.html`
- `resources/common-home-addition-planning-mistakes.html`
- `resources/complete-renovation-closeout.html`
- `resources/create-better-sight-lines-in-your-home.html`
- `resources/create-long-term-renovation-master-plan.html`
- `resources/design-build-vs-design-then-build.html`
- `resources/design-renovation-decisions.html`
- `resources/design-whole-home-renovation-around-how-you-live.html`
- `resources/detached-vs-attached-adu.html`
- `resources/discover-renovation-goals.html`
- `resources/finance-major-home-renovation.html`
- `resources/financing-an-adu.html`
- `resources/fixed-price-vs-cost-plus-contracts.html`
- `resources/foundation-renovation-knowledge-hub.html`
- `resources/foundation-renovation-roadmap.html`
- `resources/future-proof-your-home-during-renovation.html`
- `resources/garage-conversion-vs-new-adu.html`
- `resources/handle-unexpected-conditions-during-renovation.html`
- `resources/home-addition-feasibility-study.html`
- `resources/home-additions-planning-guide.html`
- `resources/homeowner-role-during-renovation.html`
- `resources/how-good-renovation-planning-saves-money.html`
- `resources/how-long-do-design-and-preconstruction-take.html`
- `resources/how-long-does-a-bathroom-remodel-take.html`
- `resources/how-long-does-a-home-addition-take.html`
- `resources/how-long-does-a-home-renovation-take.html`
- `resources/how-long-does-a-kitchen-remodel-take.html`
- `resources/how-long-does-a-whole-home-renovation-take.html`
- `resources/how-long-does-it-take-to-build-an-adu.html`
- `resources/how-much-does-a-home-addition-cost.html`
- `resources/how-much-does-a-home-renovation-cost.html`
- `resources/how-much-does-an-adu-cost.html`
- `resources/how-much-does-kitchen-renovation-cost.html`
- `resources/how-renovation-team-should-communicate.html`
- `resources/how-to-build-an-adu-budget.html`
- `resources/how-to-build-home-addition-budget.html`
- `resources/how-to-build-whole-home-renovation-budget.html`
- `resources/how-to-choose-a-renovation-contractor.html`
- `resources/how-to-choose-kitchen-countertops.html`
- `resources/how-to-choose-kitchen-flooring.html`
- `resources/how-to-compare-adu-designers-builders.html`
- `resources/how-to-compare-contractor-bids.html`
- `resources/how-to-create-a-renovation-budget.html`
- `resources/how-to-define-home-addition-scope.html`
- `resources/how-to-define-whole-home-renovation-goals-priorities.html`
- `resources/how-to-define-whole-home-renovation-scope.html`
- `resources/how-to-evaluate-property-for-an-adu.html`
- `resources/how-to-make-renovation-decisions-in-right-order.html`
- `resources/how-to-plan-a-bathroom-renovation.html`
- `resources/how-to-plan-a-kitchen-renovation.html`
- `resources/how-to-plan-a-whole-home-renovation.html`
- `resources/how-to-plan-home-renovation.html`
- `resources/improve-energy-efficiency-whole-home-renovation.html`
- `resources/improve-traffic-flow-whole-home-renovation.html`
- `resources/index.html`
- `resources/is-a-home-addition-right-for-you.html`
- `resources/is-an-adu-right-for-your-property-and-goals.html`
- `resources/is-open-concept-layout-right-for-your-home.html`
- `resources/is-your-home-a-good-candidate-for-whole-home-renovation.html`
- `resources/kitchen-cabinets-custom-vs-semi-custom-vs-stock.html`
- `resources/kitchen-lighting-function-before-fixtures.html`
- `resources/kitchen-plumbing-fixtures-sinks-faucets-pot-fillers.html`
- `resources/kitchen-storage-design-for-how-you-live.html`
- `resources/living-through-whole-home-remodel.html`
- `resources/manage-change-orders-whole-home-renovation.html`
- `resources/manage-renovation-construction.html`
- `resources/moving-back-in-after-whole-home-renovation.html`
- `resources/plan-realistic-renovation-project.html`
- `resources/plan-storage-throughout-your-home.html`
- `resources/plan-whole-home-renovation-aging-in-place.html`
- `resources/planning-hvac-plumbing-electrical-whole-home-renovation.html`
- `resources/prefab-vs-site-built-adu.html`
- `resources/prepare-final-renovation-walkthrough.html`
- `resources/prepare-for-renovation-construction.html`
- `resources/prepare-home-whole-home-renovation-construction.html`
- `resources/prioritize-renovation-wish-list.html`
- `resources/quality-control-whole-home-renovation.html`
- `resources/renovate-at-once-or-in-phases.html`
- `resources/renovation-budget-scope-priorities.html`
- `resources/renovation-contingency-budget.html`
- `resources/renovation-punch-lists-project-closeout.html`
- `resources/renovation-roi-vs-quality-of-life.html`
- `resources/renovation-warranties-maintenance.html`
- `resources/san-diego-adu-requirements-approval-process.html`
- `resources/should-you-live-at-home-during-whole-home-renovation.html`
- `resources/should-you-renovate-home-in-phases.html`
- `resources/should-you-renovate-or-move.html`
- `resources/types-of-home-additions.html`
- `resources/understanding-structural-changes-whole-home-renovation.html`
- `resources/understanding-whole-home-renovation-contracts.html`
- `resources/universal-design-home-every-stage-of-life.html`
- `resources/utility-fees-taxes-ongoing-adu-expenses.html`
- `resources/what-causes-home-renovation-delays.html`
- `resources/what-does-a-general-contractor-do.html`
- `resources/what-is-a-change-order.html`
- `resources/what-is-a-renovation-coach.html`
- `resources/what-should-be-included-in-a-construction-contract.html`
- `resources/when-home-renovation-needs-structural-engineer.html`
- `resources/when-to-hire-a-general-contractor.html`
- `resources/who-to-hire-for-home-renovation.html`
- `resources/whole-home-renovation-permits-code-requirements.html`
- `resources/whole-home-renovation-project-milestones.html`
- `resources/why-contractor-bids-are-different.html`
- `resources/why-kitchen-ventilation-matters.html`
- `resources/why-renovation-planning-matters.html`
- `services/index.html`
- `sitemap.xml`
- `templates/resources/article.html`
- `templates/resources/index.html`
