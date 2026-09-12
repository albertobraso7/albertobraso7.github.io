# Portfolio analytics

Direct GA4, no Tag Manager, no paid service. The central configuration is
`config.js`: G-R8SZG8VFHS, enabled only on the exact HTTPS production origin and
the allowlisted page paths. A valid ID is public configuration, not a credential.
The owner approved production publication on 2026-09-11. Implementation does not establish receipt
in the owner's GA account. See VERIFICATION.md for actual test results.

## Integration and release

Load one module before the closing body tag on each public HTML page:
`<script type="module" src="/analytics/analytics.js"></script>`.
Keep privacy.html, analytics/config.js, analytics/analytics.js, privacy.css and the
vendored library together. No build is required. Unknown paths, localhost,
file:// and preview origins cannot send GA events. The module is idempotent.

The owner reviewed the implementation and approved publication. Review the
property settings below before interpreting statistics. Keep the ID and production allowlist
in one place; do not add a second tag in HTML or a hosting integration.

## Consent and data boundaries

This uses basic consent: no Google script, request or cookieless analytics ping
before acceptance. Rejection does not affect content. Preferences expire after
180 days and carry a version; increment the version for material policy changes.
Storage failures are caught: consent can apply to the current page but will be
asked again on the next. Withdrawal stops the local dispatcher, disables the
property, updates consent, clears accessible _ga cookies and reloads to remove
the loaded tag. Previous server-side records are not deleted by withdrawal.

Owner review is still needed for applicable privacy requirements, retention and
Google's processing terms. This implementation is not a legal compliance claim.
Do not enable ads, Google Signals, user-provided data or session recording.

Custom events use the allowlisted schema in config.js. Strings are controlled
site identifiers, not link text or visitor input. Page locations exclude queries
and hashes. Referrers retain external origins only. GA itself processes request
metadata and cookie identifiers after consent; this is not anonymous collection.

## Property setup (manual, not performed by code)

1. In GA4, select this property. Admin → Data collection and modification →
   Data streams → Web → the portfolio stream. Verify G-R8SZG8VFHS and its URL.
2. Turn OFF Enhanced measurement for this stream. Custom scroll, outbound,
   downloads and HTML5 video events are already defined here. Disable automatic
   history/page-change measurement too; page_view is explicitly sent once.
   GA automatic session_start, first_visit and user_engagement remain distinct.
3. Admin → Data retention: choose 2 months unless a longer justified period is
   needed; review the setting and update public privacy wording if appropriate.
4. Keep Google Signals, advertising features and user-provided data OFF.
5. Admin → Custom definitions: add event-scoped dimensions page_id, project_id,
   card_id, card_position, section_id, link_position, destination_type,
   video_id, location, playback_mode, percent, cv_version, language, filter_id,
   metric and rating. Register visible_seconds (standard units) and value
   (standard units) as custom metrics only if needed. Numeric event parameters
   can otherwise be inspected in BigQuery if a separate free export is desired;
   no export was enabled here. Do not add visitor IDs or high-cardinality text.
6. Mark cv_click and contact_click as candidate key events. These are intent,
   not successful recruitment outcomes. Never mark autoplay, scroll or each
   video progress event as a key event.

GA interfaces and availability can vary by account. No dashboards, custom
definitions, filters or key events have been created in the account by this task.

## Local and production verification

Append `?analytics_debug=1` on a local preview or production page. The consent
UI appears and window.portfolioAnalytics.events contains sanitized records.
This explicit review mode NEVER loads Google, including on production. Inspect
it in DevTools; refreshing clears the records, not the stored consent choice.
Use a separate browser profile or clear only portfolio-analytics-consent to
repeat the consent scenario. No magic query/storage switch enables local sends.

To verify actual receipt after an approved deployment, use the production URL
without analytics_debug, accept analytics, open GA Reports → Realtime and look
for page_view and a deliberate cv_click. For DebugView, use Google's supported
Analytics Debugger extension in a separate test browser (normal production URL).
Check Admin → DebugView. The in-memory debug recorder is not GA DebugView.
Ad blockers and consent rejection legitimately produce no GA data.

For owner traffic, start with explicit local debug for development. If excluding
production testing by IP, Admin → Data streams → Configure tag settings → Define
internal traffic, then Admin → Data filters: leave the Internal traffic filter
in Testing first and inspect test data before making it Active. Active filters
discard new incoming data permanently; no active filter is created automatically.

## Reports and definitions

| Question | Where and what to compare |
| --- | --- |
| Visits and return visits | Reports → Acquisition and Engagement: users, new/returning users, sessions, engaged sessions, views and engagement time. GA's engagement time differs from custom visible section time. |
| How people arrive | Traffic acquisition: session source/medium/campaign; User acquisition for first-user source. Landing page report for entry path. |
| Approximate audience | Demographic details and Tech details: country/region/city, device, browser, OS and screen resolution where available. Small samples may be withheld. These cannot identify people, employers or recruiters. |
| Most-read projects | Exploration → Free form: project_id/page_id, project_view event count and total users filtered to that event. Compare section_time visible_seconds separately. |
| Card effectiveness | Funnel exploration: project_card_view → project_card_click → project_view, with the same card mapped to its destination. Use users completing each step / users at previous step, in one chosen session/window; feature Debubbler is its own card. Event CTR (click events / view events) is a separate frequency ratio and may exceed 100% because repeat clicks are allowed. |
| CV and contact paths | Path exploration ending at cv_click or contact_click. Intent rate = sessions with the selected action / eligible consenting sessions, using one consistent date/filter set. Split destination_type for email vs LinkedIn. |
| Deliberate video interest | Filter playback_mode=manual; video_start/video_resume, video_id and video_progress. Retention by users at a milestone / users with a manual start or resume for that video in the same analysis scope. Position milestones are approximate and seeking can skip them. Do not mix autoplay counts into the denominator. |
| Technical experience | web_vital by metric, page_id and device. LCP/INP value is milliseconds; CLS value is unitless. Use rating or a percentile-capable export for p75; an average is not p75. site_error shows only sampled categories. |

These are instructions and report designs, not pre-created dashboards. Registered
custom definitions may need 24–48 hours and do not retroactively populate all
reports. Use matching dates, consent population and attribution scope; avoid
event-count / user-count ratios presented as conversion rates.

## UTM convention

Only these literal values are accepted: source=cv/linkedin/application;
medium=document/social/referral; campaign=general/portfolio/engineering/cfd/
thermal/automation. Others are dropped. Use a broad role family, never a
person's name, employer, email, application ID or confidential vacancy name.

- CV: https://albertobraso7.github.io/?utm_source=cv&utm_medium=document&utm_campaign=general
- LinkedIn: https://albertobraso7.github.io/?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio
- Application: https://albertobraso7.github.io/?utm_source=application&utm_medium=referral&utm_campaign=cfd

## Sources

- [GA4 page views](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Consent implementation](https://developers.google.com/tag-platform/security/guides/consent)
- [GA4 configuration](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
- [GA4 debugging](https://developers.google.com/analytics/devguides/collection/ga4/debugview)
- [Official web-vitals library](https://github.com/GoogleChrome/web-vitals)

See EVENTS.md for precise event semantics and known limits.
