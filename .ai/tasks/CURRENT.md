# Certifications page redesign

Status: COMPLETE
Last Agent: Claude
Date: 2026-11-05

Objective: the author found `/credentials/` hard to read (narrow centered column, oversized collapsible headings, plain header). Redesign it in the site's identity without changing any record, PDF or link.

Acceptance: site header/footer and AB identity; hero with intro and stats strip (41 records, 1 certification, 3 instructor-led, 37 online, 5 issuers); jump chips per group; each group as a two-column block (issuer · kind eyebrow, title, count, description | record rows with date, hours, PDF/Verify buttons); groups always open; group anchors (`#avl`, …) and per-record anchors unchanged; 41 PDFs byte-identical; LINKS.md URLs unchanged (only group order); no overflow at 320/390 px.

Changed: `credentials/index.html` (generated). Generator lives in the private `credentials-archive` repo (`scripts/build_public_page.py`, inline CSS with `cr-` prefix); regenerate with `python -I scripts/build_public_page.py <this clone>`; never edit the page by hand.

Checks: Chrome at desktop, 1280, 390 and 320 px (iframes); all 41 PDF links resolve locally; group and record anchors present.

Previous task (2026-11-05, capability map) is complete; see DECISIONS "Capability map after the project lists".
