# Vehicle-efficiency notes, revision 5

Status: COMPLETE (author review pending)
Last Agent: Claude
Date: 2026-11-26

Objective: make the notes usable for study and for explaining graphically, not only for display: add three calculators from the author's Tech Talk study topics (cooling-air operating point, series vs parallel cold plates, front/rear torque split) and give every calculator an "Equations used in this calculator" panel with step-by-step equations, fixed values and "Try this" questions.

Acceptance criteria: (1) three new demos working; (2) all 16 demos carry an equations panel that matches the code; (3) new models agree with an independent Python implementation; (4) "What to look for" claims match model output; (5) no horizontal overflow, no empty outputs; (6) records updated.

Done: `index.html` (16 demos, 16 panels; cooling air in chapter 5, torque split in chapter 6, cold plates in chapter 7), `ev.js` (coolAir, coldPlate, torqueSplit exported on window.EVNotes), `ev.css` (details.model styles).

Checks: Node run of page JS against independent Python (brentq for the front-end pressure balance, explicit coolant march for cold plates, direct loss sums for torque split): agreement ~1e-16; earlier models re-checked unchanged (≤3e-8, ODE tolerance). Scenario claims re-run: smallest shutter at 100 km/h 13% (32 → 18 counts); ram air alone meets 15 kW above ~48 km/h; equal-pump-power parallel 39.6 °C / 1.9 K vs series 39.7 °C / 4.0 K, advantage gone at 40% maldistribution; torque-split crossover 95 N·m at 6,000 rpm. Headless Chrome: 1366 px visual review with panels open; overflow probe at the 504 px headless minimum (none) and 13 KPI blocks populated. Not done: true 320/390 px view of the new demos (iframe anchors did not scroll); they reuse the existing demo components.

Limitations: AI-assisted drafting; models illustrative; author review pending. Verification scripts kept outside the repository (session scratchpad).

Revision 4 (same day): pack builder in chapter 7 (SVG diagram of series groups and parallel cells with cumulative voltage and per-cell current; presets 4s3p, 96s46p and 192s23p with the same 4,416 cells; equations panel) and new chapter 14 "One language for heat, flow and charge" (potential/flow/resistance table, series-parallel figure, cross-domain rules, where the analogy bends, Colburn analogy, RC time constants, check-yourself answers). Pack results match hand formulas exactly; diagram reviewed at 4s3p and 96s46p; figure reviewed. Earlier model checks re-run unchanged.

Revision 5 (same day): study material for vacancy gaps. Chapter 7: "Inside one cell" (equivalent circuit OCV + R0 + two RC pairs, Bernardi heat) with demo-cell (HPPC pulse, logger rate 1/10/100 Hz and its effect on the R0 read from the step, reversible vs irreversible heat, 10 s power to 2.5 V). New chapter 15 "From a vehicle log to a correlated model" (CAN frame + DBC decoding example, rates and one time base, differentiation of quantized speed, gap-diagnosis table, energy boundary) with demo-log (synthetic 300 s drive; sensor offset, gain, speed delay, missing auxiliary load; cross-correlation alignment; standstill check) and `can_log_demo.py` (raw frames → minimal DBC parser → same analysis; `--check`). Regression: `tests/ev-notes/regression.js` + `reference.json` (377 values) and `.github/workflows/notes-regression.yml`. Checks: JS vs independent Python ≤1.1e-11 for both new models (cell RC pairs integrated with solve_ivp; log via the script's NumPy pipeline without CAN encoding); the regression test caught a deliberate drag-area change; "What to look for" numbers match model output; headless Chrome review of both demos (whole and zoomed views, panels open). Not done: phone-width view of the two new demos.

Next: author review; phone-width check of the new demos; optional: drive-cycle points on the motor map, junction-temperature (Foster) transient.
