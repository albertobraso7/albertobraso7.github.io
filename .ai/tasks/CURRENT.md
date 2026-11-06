# Capability-map thumbnails and GitHub profile link

Status: COMPLETE
Last Agent: Claude
Date: 2026-11-06

Objective: restore the capability-map thumbnail size the author preferred (62×38) while keeping the throttle/engine column split, and link the GitHub profile from the portfolio.

Acceptance: thumbnails 62×38, header padding and row-header width as before the split; Total column never squeezed (table `min-width:max-content`, column hint 70 px); homepage Contact shows LinkedIn · GitHub · Email and the footer shows Certifications · GitHub · Blog; GitHub link opens the profile in a new tab.

Changed: `capability-map.css`, `index.html`, `recruiter-layout.css` (GitHub/Email links share 15 px), `.ai/DECISIONS.md`.

Checks: local Chrome iframes at 1280/1366/1920/390/320 px; table fits from 1366 px and scrolls sideways at 1280 and on phones; contact links wrap cleanly at 390/320.

Next: when the engine/injection project exists, add `img` and `pub` to the `eng` area in `capability-map.js`.
