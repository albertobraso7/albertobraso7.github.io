# Vehicle-efficiency notes, revision 2

Status: COMPLETE (author review pending)
Last Agent: Claude
Date: 2026-11-26

Objective: extend `notes/ev-efficiency/` with physics from the author's Lucid Tech Talk study topics (inverter light load, winding thermal limits, battery series/parallel and hottest cell, fast-charge limits, thermal architecture, mass compounding, model fidelity), with calculators the author can demonstrate, without publishing interview material.

Acceptance criteria: (1) new physics sections and equations in chapters 6, 7, 10, 12 and 13 plus a new chapter 11; (2) five new calculators working with no console errors; (3) each calculator matches an independent Python implementation; (4) every "What to look for" claim matches the model; (5) manufacturer facts only in labelled boxes, traceable to public Lucid pages; (6) records updated.

Done: `index.html` (13 chapters, 13 interactive models; new demos: SiC vs IGBT inverter efficiency, winding hot spot peak vs continuous, DC fast-charge session with limits, oil-temperature trade-off, mass compounding; two "Public example" boxes; references and disclosure updated), `ev.js` (models exported on `window.EVNotes`).

Checks: page JS run in Node with a DOM stub; independent Python (period-averaged inverter losses, brentq steady states, solve_ivp burst, re-implemented charge stepping, fixed-point oil and compounding) agrees to ≤3e-8 relative (ODE tolerance), ≤1e-10 otherwise; scenario claims re-run (400 V 26.4 vs 800 V 22.3 min; 45 °C no cooling +4 min; oil optimum 110 °C at 20% load, 30 °C at full load); headless Chrome 1366 px visual review of the five demos. Not done: phone-width recheck of the new demos (they reuse the existing demo components that passed at 390/320 px).

Limitations: AI-assisted drafting; models illustrative; author has not yet reviewed wording and physics. Verification scripts kept outside the repository (session scratchpad).

Next: author review; optional phone-width check; possible additions: battery hottest-cell demo, front/rear torque-split demo.
