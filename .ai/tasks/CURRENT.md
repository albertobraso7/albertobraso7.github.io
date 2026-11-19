# Vehicle-efficiency notes

Status: COMPLETE (first edition; author review pending)
Last Agent: Claude
Date: 2026-11-18

Objective: publish a public "engineering notes" article on electric-vehicle efficiency in the CFD Knowledge Hub style, with interactive calculators, linked from `blog.html`.

Done: `notes/ev-efficiency/index.html` (12 chapters), `ev.css` (portfolio identity, reader layout, sticky chapter list), `ev.js` (converter, road-load and range, coast-down fit, EPA UDDS/HWFET cycle simulator with label estimate, motor efficiency map, pump/system curve with throttling vs speed control, winter range, cycle sensitivity), `cycles.js` (EPA traces). `blog.html` lists it first. Records: DECISIONS, SOURCES, ASSET_PROVENANCE.

Checks: page JS run in Node and compared with an independent Python implementation (steady road load, both cycles, motor efficiency at two temperatures, pump fits, COP: agreement to ~1e-14); EPA cycle distances 7.45 / 10.26 mi; headless Chrome at 1366 px (visual review of all demos) and 390/320 px via iframes (no horizontal overflow); no console errors in Chrome.

Limitations: content drafted with AI assistance and not yet reviewed by the author; motor loss model, COP trend and vehicles are illustrative. Homepage: "Notes" link in the main navigation and section "03 / Engineering notes" (approach and contact renumbered 04 and 05), added at the author's request the same day.

Next: author review of wording and physics; possible additions: cooling-drag/shutter demo, battery I²R vs C-rate demo, fast-charge curve, chapter 3 operating points overlaid on the motor map.
