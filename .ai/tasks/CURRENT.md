# Certifications page and links

Status: COMPLETE
Last Agent: Claude
Date: 2026-10-31

Objective: publish the author's public training records at `/credentials/` and link them from the homepage, footer and GitHub profile README.

Acceptance: 41 public credentials with byte-identical PDFs (SHA-256 checked at build); private-only records (8 scanned constancias, 1 employer-internal record) absent and returning 404; page reachable from homepage experience intro and footer; analytics allowlist includes `/credentials/` as a non-project page.

Changed: `credentials/` (generated; do not edit by hand), `index.html` (experience intro + footer link), `analytics/config.js`, `analytics/analytics.js`.

Source of record: private repo `albertobraso7/credentials-archive` (`credentials.json`; regenerate with `scripts/build_public_page.py <this clone>`). Author decisions 2026-10-31: CSWA and Coursera verification URLs may be public; scanned constancias stay private; degree titles deferred.

Limitation: Amesim PDFs show 2025-10-29 (printed date); real completion dates pending from the author. No in-browser visual check was run for this change (no browser tool in session); HTTP and byte checks only.
