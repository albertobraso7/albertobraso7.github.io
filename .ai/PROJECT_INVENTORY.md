# Engineering Project Inventory

Current presentation reflects the user's 2026-09-08 correction: substantial
engineering stories, source visuals and explicit transferable skills.
Sources/commits: [SOURCES.md](SOURCES.md). Asset review and transformations:
[ASSET_PROVENANCE.json](ASSET_PROVENANCE.json).

| Priority / case | Core story | Evidence and presentation | Transferable capabilities |
| --- | --- | --- | --- |
| 1 · [Pump](../pump/index.html) | Automated hydraulic mapping and transient pressure analysis | Existing complete case retained; homepage card now plays the real startup clip | PyFluent automation, rotating flows, performance comparison, spectral analysis |
| 2 · [CVD reactor](../reactor/index.html) | Use dimensionless heat-transfer reasoning to explain circulation and choose precursor position | Eleven figures: streamlines, apparatus, case schematic, Ri sweep, thermal/velocity fields, validation, position comparison, physical growth and award micrograph | Re/Gr/Ri/Nu analysis; model simplification; porous media; numerical/experimental validation; simulation-to-experiment interpretation |
| 3 · [Doctoral multiphysics](../aneurysm/index.html) | Assess what changes when viscosity, turbulence assumptions, wall compliance or transported particles are modeled | Four animations; domain, constitutive, TAWSS, wave-speed and mesh/time evidence; homepage FSI animation | FSI, non-Newtonian rheology, turbulence-model assessment, particles, validation, geometry/post-processing |
| 4 · [Residential CFD](../ventilation/index.html) | Explain airflow paths and solar exposure as consequences of architectural geometry | User-selected 3D streamline hero plus seven supporting views; scenario matrix; base/modified airflow, sections, paired-house flow and solar comparison | CAD/domain preparation, scenario design, external/internal flows, solar load, cross-tool checks, communication |

## Contribution and context

- Reactor: Master's thesis, Universidad de Colima, 2018. Alberto built and analyzed
  the CFD campaign; synthesis apparatus/process and material characterization
  were collaborative. Official NanoArtography record credits Alberto with the
  2017 first-place NaF micrograph, The Space Base.
- Doctoral: UNAM, 2025. Methodology, software, analysis, validation and original
  writing alongside collaborators; clinical resources and support collaborative.
  Four clips are FSI arteries, idealized velocity, elastic-tube benchmark and
  particle age. Each has its own physical role and scope.
- Residential: 2022 consulting. Alberto handled CFD preparation, execution,
  checks and engineering figures; a collaborator handled client coordination.
  New `streamlines.jpg` is a user-selected local addition, not verified as a
  remotely published asset.
- Pump and six existing industrial cards retain their previous content.
  No confidential supporting industrial studies were newly inspected.

## Numerical boundaries

Keep the reactor's dimensionless framework central. Reported Re/Gr/Ri are
rounded; regional Nu behavior is explained without repeating the ambiguous
raw-Ri fit notation. Position-fit and synthesis outcomes retain their tested
range and simulation/experiment distinction. NaF award imagery is distinct
from the target Si₃N₄ fibers.

The new rheology SVG/CSV calculate constitutive laws from documented parameters;
they are explicitly not new CFD results. Doctoral model-comparison percentages,
FSI benchmark and particles belong to related but distinct study families.
Source-version differences and animation scaling stay qualified.

Residential flow remains a room-level trade-off; solar image scales are not
a common-scale difference map or annual energy/comfort prediction. No unsupported
global improvement statistic was added. Each page maps demonstrated tasks to
potential applications without claiming those applications were completed work.
