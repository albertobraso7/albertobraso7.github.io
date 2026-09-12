# Verification — 2026-09-11

Chromium headless, isolated browser profile and static local preview. Actual
production-origin behavior tested through CDP response interception serving the
review files; Google endpoints were blocked. No production visitor data was sent.

- Localhost without debug: no analytics API, banner or Google tag.
- Different preview HTTPS origin: no analytics API or Google tag.
- Explicit local debug: in-memory records only; rejected consent creates zero events.
- Acceptance: one page_view; qualifying section/card/video views after two seconds.
- Withdrawal: subsequent filter actions produce no new records; production fixture
  reloads with consent rejected, no Google tag and no accessible GA cookie.
- Production fixture: exactly one tag and one page_view after duplicate module insertion.
- Config queue uses G-R8SZG8VFHS and sanitized canonical URL. Test query email was
  discarded; only allowed source=cv, medium=document, campaign=general retained.
- Native keyboard playback: manual video_resume; existing autoplay classified automatic.
- Accelerated actual HTML5 playback: milestones 25/50/75/100 once, completion once,
  loop events capped at two across repeated loops. No timeupdate event stream.
- Filter and anchor events carry stable IDs. Figure dialog and native controls
  retain normal functionality. No JS exception observed during these checks.
- All seven main routes: no broken images or missing local files; desktop/mobile
  layout, reduced motion and no-JavaScript content checked for redesign.

Evidence JSON is preserved with the private review backup. Real GA4 Realtime /
DebugView receipt, property settings, custom dimensions and account reports are
NOT verified or configured. They require the owner's account and approved release.
Safari/Firefox, screen-reader-specific native video behavior and field CWV
statistics were not measured. Blocking the tag was explicitly tested; the page
remained usable. No legal compliance guarantee is implied.

The owner explicitly approved publication after review on 2026-09-11.
