# Vehicle aerodynamics results page

Status: IN_PROGRESS (author approved; publishing)
Last Agent: Claude
Date: 2026-11-07

Objective: replace the "in development" AeroSUV page with the estate/fastback preliminary results, update the homepage card and capability map, and add the FlowPilot screenshot to its own project card.

Author decisions: no radiator figures; HTML charts for Cd and drag budget (CLf/CLr only as short note + table); both cumulative drag charts; iso Cpt=0 pair as hero (cropped, VTK colour bar replaced by HTML bar); paired figures shown side by side/stacked, y0_cpt with an estate/fastback switch; limits and differences vs Zhang et al. (2019), including why rotating walls instead of MRF.

Done: `vehicle-aerodynamics/index.html`, `vehicle.css`, new `vehicle.js`, WebP/SVG assets from the private repo `results/figures/` (dark theme, centered_linear_bar), `aerosuv-wake-preview.webp`; `index.html` card; `capability-map.js` (veh preview + "Preliminary results", tool thumbnail); `projects.js` + `recruiter-layout.css` FlowPilot shot (`assets/flowpilot/`). Private source repo backed up at 6edc77a.

Checks: local Chrome at 1366 and iframes at 390/320 (no horizontal overflow), chart palette validated for the dark surface with the dataviz validator.

Follow-up from review: removed HPC/core mentions, rewrote MRF rationale, rebuilt the homepage preview with larger labelled vehicles. Records updated (DECISIONS, SOURCES, PROJECT_INVENTORY, ASSET_PROVENANCE).

Next: commit, push, verify Pages deployment.
