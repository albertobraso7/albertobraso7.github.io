# Certifications discoverability and Amesim dates

Status: COMPLETE
Last Agent: Claude
Date: 2026-11-06

Objective: make `/credentials/` reachable from the homepage, and stop showing the Amesim PDF download date (2025-10-29) as if it were the completion date.

Acceptance: homepage header nav has "Certifications" (between Capabilities and Profile); hero actions have "Certifications and training ↗"; existing Industrial-experience and footer links kept; Amesim rows show "2025" and the group text says "completed during 2025"; no invented day-level dates; PDFs unchanged; no horizontal overflow at 1280/390/320 px.

Changed: `index.html`; `credentials/index.html` (generated). In the private `credentials-archive` repo: `credentials.json` (Amesim `display_date: "2025"` plus note; `date` keeps the PDF-printed value), `scripts/build_public_page.py` (`display_date` precedence, Amesim blurb), `LINKS.md` (regenerated).

Follow-up: course durations removed from the page (author: irrelevant).

Checks: iframe layout at 1280/390/320 px (nav wraps to two rows on mobile, no overflow); regenerated page shows 2025 for the ten Amesim rows; only `credentials/index.html` changed under `credentials/`.

Open: real Amesim completion dates (Siemens learning transcript) can replace `display_date` when the author provides them. Do not substitute estimated days.
