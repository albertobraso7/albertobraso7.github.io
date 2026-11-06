# Capability map: separate throttle bodies from engines

Status: COMPLETE
Last Agent: Claude
Date: 2026-11-06

Objective: show throttle-body work and engine/fuel-injection work as separate application areas in the homepage capability map.

Acceptance: 13 areas; "Engines & fuel injection" holds the seven injection/mixture studies with no case link; "Throttle bodies" holds the virtual characterization study with the throttle-body image and case link; totals unchanged (40 studies, 16 rows, 8 public cases); no squeezed Total column or horizontal scroll at 1280 px desktop.

Changed: `capability-map.js` (areas, one study re-tagged), `capability-map.css` (min-width 1130, thumbnails 56×34, tighter header padding), `.ai/DECISIONS.md`.

Checks: local Chrome; iframe widths 1280/1366/1920 fit without table scroll, 390 scrolls horizontally as designed; 59 cells, no broken images.

Next: when the author adds the engine/injection portfolio project, add `img` and `pub` to the `eng` area.

Previous task (2026-11-06, certifications discoverability and year-only dates) is complete and published.
