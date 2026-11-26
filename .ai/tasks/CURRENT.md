# Vehicle-efficiency notes, revision 3

Status: COMPLETE (author review pending)
Last Agent: Claude
Date: 2026-11-26

Objective: make the notes usable for study and for explaining graphically, not only for display: add three calculators from the author's Tech Talk study topics (cooling-air operating point, series vs parallel cold plates, front/rear torque split) and give every calculator an "Equations used in this calculator" panel with step-by-step equations, fixed values and "Try this" questions.

Acceptance criteria: (1) three new demos working; (2) all 16 demos carry an equations panel that matches the code; (3) new models agree with an independent Python implementation; (4) "What to look for" claims match model output; (5) no horizontal overflow, no empty outputs; (6) records updated.

Done: `index.html` (16 demos, 16 panels; cooling air in chapter 5, torque split in chapter 6, cold plates in chapter 7), `ev.js` (coolAir, coldPlate, torqueSplit exported on window.EVNotes), `ev.css` (details.model styles).

Checks: Node run of page JS against independent Python (brentq for the front-end pressure balance, explicit coolant march for cold plates, direct loss sums for torque split): agreement ~1e-16; earlier models re-checked unchanged (≤3e-8, ODE tolerance). Scenario claims re-run: smallest shutter at 100 km/h 13% (32 → 18 counts); ram air alone meets 15 kW above ~48 km/h; equal-pump-power parallel 39.6 °C / 1.9 K vs series 39.7 °C / 4.0 K, advantage gone at 40% maldistribution; torque-split crossover 95 N·m at 6,000 rpm. Headless Chrome: 1366 px visual review with panels open; overflow probe at the 504 px headless minimum (none) and 13 KPI blocks populated. Not done: true 320/390 px view of the new demos (iframe anchors did not scroll); they reuse the existing demo components.

Limitations: AI-assisted drafting; models illustrative; author review pending. Verification scripts kept outside the repository (session scratchpad).

Next: author review; phone-width check of the new demos; optional: drive-cycle points on the motor map, junction-temperature (Foster) transient.
