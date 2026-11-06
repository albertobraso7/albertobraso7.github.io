# Homepage capability map

Status: COMPLETE
Last Agent: Claude
Date: 2026-11-05

Objective: show the breadth of the author's work as one interactive matrix (physics/methods × application areas) on the homepage, without repeating the case cards.

Acceptance: new `02 / CAPABILITY MAP` section between Industrial experience and Engineering approach (approach → 03, contact → 04); nav link "Capabilities"; 40 studies (37 industrial from the NDA-free log + PhD, MSc, consulting) counted by cell, select-to-list panel; areas with a public case link to it; no project IDs, customer names, operating data or results; hero count 30 → 37 to match the log; no page overflow at 390/320 px (table scrolls inside its frame); no console errors.

Changed: `capability-map.js` (data + render), `capability-map.css` (`capx-` prefix; avoids research-depth `.capability-map`), `index.html` (section, nav link, stylesheet/script, eyebrow numbers, hero count).

Checks: Chrome at desktop width (rendering, hover cross-highlight, cell click/keyboard focus, panel, thumbnails load, console clean); 390/320 px through same-origin iframes (no document overflow, sticky row labels, 4 nav links visible). Thumbnails reuse images already loaded by the homepage cards.

Author decisions 2026-11-05: the classification and generic study labels shown in the prototype were approved as they are ("Me agrada así como está"). P28 counted as VOF per the earlier author correction, although `career-materials/evidence/projects.json` still says Eulerian-Eulerian.

Limitation: classification of each study into physics/areas was derived from the method text in the private log; update `capability-map.js` when new projects are added there.
