# Event catalog

Every custom event includes page_id and project_id (none outside case pages).
Only fields declared in config.js are sent. Parameters below are additional.

| Event | Trigger / fields | Deduplication and purpose |
| --- | --- | --- |
| page_view | Consent accepted on an allowlisted page | Once per document; no query or anchor in location |
| project_view | Same, on a case page | Once per document, independent of card click |
| navigation_click | Internal link; section_id, link_position, destination_type | Each click; an anchor click is not proof that a section was read |
| section_view | Most visible eligible main section for >=2 s; section_id | Once per section/document; >=25% of viewport-capped section area |
| section_time | Exclusive visible section; section_id, visible_seconds | Deltas flushed at 30 s, tab hidden and pagehide; only sections that passed the view threshold |
| scroll_depth | 25/50/75/90/100 percent of available scrolling | Each threshold once/document; 100 uses a 0.5% bottom tolerance |
| project_card_view | >=50% viewport-capped card visible for >=2 s; card_id, card_position | Once per card/document |
| project_card_click | Card link activated; card_id, card_position, link_position | Each activation; a click need not follow a qualified impression |
| cv_click | Selected CV link; cv_version, language, link_position | Intent only; no claim of completed download |
| contact_click | Email/LinkedIn/GitHub link; destination_type, link_position | Intent only; email value and full destination omitted |
| document_click | Publication or selected file link; destination_type, file_type, link_position | Each click; PDF/CSV/ZIP/Python/notebook/office types when present |
| figure_open / figure_zoom | Figure link / full-size button; figure_id, link_position for open | Each deliberate action, no image URL |
| accordion_toggle | Existing details opens/closes; section_id, state | Native toggle, no free text |
| filter_change | Existing capability filter; filter_id | Each activation, predefined values |
| video_view | >=50% visible for >=2 s; video_id, location, duration | Once/video/document |
| video_start / video_resume | HTML5 play; common video fields + playback_mode | Start once, then resumes; recent pointer/key action distinguishes manual from automatic |
| video_pause | HTML5 pause; common video fields + playback_mode | Manual only with recent direct input; visibility/script pauses are automatic |
| video_progress | 25/50/75/100 playback-position milestone; common video fields + mode, percent | Once/milestone/video/document; 25–75 only while visible and playing, seeking excluded |
| video_complete | Ended or inferred loop boundary; common video fields + mode | Once/video/document, not a key event |
| video_repeat | Inferred loop boundary; common video fields + mode, loop_number | Maximum two per video/document |
| video_time | Visible unpaused playback; common video fields + mode, visible_seconds | Accumulated with visibility/seeking checks, flushed in deltas |
| video_fullscreen / video_rate / video_sound | Fullscreen entry / input-associated rate or volume change | Common video fields plus rate or muted/audible state as applicable |
| video_error | Native media error | Common video fields + numeric browser error_code |
| web_vital | Official web-vitals final reports | metric=LCP/INP/CLS, value, rating; library lifecycle handles visibility/BFCache |
| site_error | JS/resource/rejected promise error | 10% document sample, maximum three; category/tag only, no message/stack/URL |

No contact form, site search, email-copy button or external video player exists,
so no fictitious form success, search, copy or external-player events are added.
The privacy page contains external informational links but their URLs are not sent.

## Interpretation limits

Visibility is an estimate, not eye tracking. Geometry is sampled every 500 ms;
another window covering the page cannot be reliably detected. One winning main
section receives time, so overlapping/nested sections do not double-count. A
large section may include several subsections; the home Profile anchor remains
part of the hero's visible-time estimate. Abrupt process termination can lose
the last unflushed interval. Dwell is not the GA automatic engagement metric.

Video input attribution is a browser heuristic: native-control interactions
normally reach the video element, but browser/assistive-technology behavior can
vary. Script-driven offscreen resumes remain automatic. Position milestones do
not prove every intervening frame was watched; seeking can skip milestones.
Milestones are deduplicated for the whole document, so watching first on autoplay
and later manually can undercount deliberate retention. Use manual starts/time
as the primary deliberate-interest measures. Loop detection is inferred from a
near-end time reset; loop telemetry may vary by browser. It never defines a key
event. Only HTML5 players are currently present.

Blocked analytics, rejected consent and previews intentionally leave gaps.
Browser cookie restrictions, retention choices and GA thresholds affect counts.
No claim is made about an identified visitor, recruiter, company or hiring outcome.
