# Reactor hero image swap

Status: COMPLETE
Last Agent: Claude
Date: 2026-09-18

Objective: replace the reactor streamline image with the author-selected `view_centrado_3.png` on the reactor case hero and homepage card.

Acceptance: byte-identical original on the case page, 2:1 WebP card preview, provenance recorded, production routes return HTTP 200.

Changed: `reactor/index.html` (hero + enlarge links -> `assets/streamlines-centered.png`), `index.html` (card -> `reactor/assets/streamlines-centered-preview.webp`), `.ai/ASSET_PROVENANCE.json` (two entries). Previous `streamlines.png` / `streamlines-preview.webp` retained, now unreferenced.

Source: cvd-tubular-reactor-cfd `figures/source_exports/view_centrado_3.png` (private repo; commit f984873). Alt text and caption unchanged: same simulation and flow structures.

The GitHub profile README (`albertobraso7/albertobraso7`) is a separate repo, created by the author; it references the same preview URL.
