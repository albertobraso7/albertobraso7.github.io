# Repository and Source Register

Start here for portfolio content. This is an index of where to look, not a copy
of source READMEs. Findings below come from Git and curated documentation;
engineering calculations were not independently recomputed. Selected binary assets
were visually reviewed and matched to public Git blobs; see ASSET_PROVENANCE.json.

## Workspace map and authority

Paths below are local locators relative to the **portfolio repository root**,
not relative to this `.ai/` directory. They describe this workspace layout only;
on another machine locate clones by remote URL. Never place these locators on
the public website. All source worktrees are **READ ONLY** for portfolio tasks.

| Workspace root | Repository locator | Classification |
| --- | --- | --- |
| `alberto-portfolio` | `.` (child `albertobraso7.github.io` of workspace root) | PORTFOLIO TARGET |
| `casas` | `../../casas` | SOURCE PROJECT |
| `maestria` | `../../maestria` | SOURCE PROJECT |
| `doctorado` | `../../doctorado/aneurysm-multiphysics-cfd` | SOURCE PROJECT |
| `pyfluent_pump` | `../../pyfluent/pump_workflow/pyfluent_pump` | SOURCE PROJECT |

The `doctorado` workspace root is a separate, non-Git research archive. Its
nested `aneurysm-multiphysics-cfd` checkout is the curated publication repository;
do not treat research-root duplicates or clinical masters as the public source.
The `alberto-portfolio` parent folder itself is not a Git repository.

Discovery checked all five declared workspace roots, structural directories,
immediate raw-project containers, Git markers and submodule declarations. Five
repositories and no submodules were found. Huge solver/result trees were not
recursively scanned; repeat discovery only for a changed workspace or evidence
of an additional repository, not at every task start.

## Latest content refresh — 2026-09-08

Reactor, doctoral and residential sources were fetched successfully again with
unchanged HEAD/upstream SHAs from the table below. Reactor and doctoral worktrees
are clean. Residential retains one user-added untracked file, streamlines.jpg,
explicitly requested for the new fixed hero; its hash and local-only provenance
are recorded in ASSET_PROVENANCE.json. No source file was edited. The table below
is the historical all-repository snapshot; do not treat its initial residential
clean state as the current dirty-state classification.

The expanded revision includes the curated apparatus/case/field/material visuals,
additional doctoral benchmark/velocity media and additional residential comparisons.
The user explicitly requested these additions; previous selection-size and
no-animation decisions are superseded. Official NanoArtography 2017 evidence
confirms author/first-place/NaF attribution. The ambiguous raw-Ri fit notation is
not republished as a valid correlation. See updated inventory and manifest.

## Verified Git snapshot

Date: **2026-09-07 America/Mexico_City**; all five fetches refreshed on
**2026-09-08 00:16 UTC** with unchanged SHAs. `git fetch --all --no-recurse-submodules` succeeded for
all five repositories. All have a single `origin` remote, with matching fetch
and push URLs (`https://github.com/albertobraso7/<repository>.git`).
Ahead/behind counts are local versus the fetched tracked upstream.

| Repository | Branch / upstream | Local HEAD | Verified upstream SHA | Ahead / behind | Classification | Working tree before portfolio development |
| --- | --- | --- | --- | --- | --- | --- |
| albertobraso7.github.io | `main` / `origin/main` | `1be06e5a41b6f70ee69bd3934ce7e331c111de73` | `c4e84d79e483ee5c4a54bcfcceec2a102d869fc8` | 0 / 1 | LOCAL BEHIND REMOTE + UNCOMMITTED LOCAL CHANGES | `index.html` modified, unstaged |
| residential-ventilation-cfd | `master` / `origin/master` | `e8f977141e3fbae15ecf55fef62746a042449745` | `e8f977141e3fbae15ecf55fef62746a042449745` | 0 / 0 | UP TO DATE | Clean |
| cvd-tubular-reactor-cfd | `main` / `origin/main` | `6fc22bdda5db2e36108de65f444bbd1dd1600a43` | `6fc22bdda5db2e36108de65f444bbd1dd1600a43` | 0 / 0 | UP TO DATE | Clean |
| aneurysm-multiphysics-cfd | `main` / `origin/main` | `f6c9e78a11a6899d99a8db5911ca4885f6ddc300` | `f6c9e78a11a6899d99a8db5911ca4885f6ddc300` | 0 / 0 | UP TO DATE | Clean |
| pyfluent_pump | `main` / `origin/main` | `2253a31f81c63bb825a46fa235779b717541ce17` | `2253a31f81c63bb825a46fa235779b717541ce17` | 0 / 0 | UP TO DATE | Clean |

All source clones are current at these verified commits. If one becomes behind,
use the latest successfully fetched remote version as the content authority,
read with `git show <verified-sha>:<path>`; do not pull or modify that checkout.
Uncommitted or ahead-only content is separate evidence, not silently published
remote content. A failed fetch means freshness is UNKNOWN even when cached
tracking refs appear aligned. Reverify relevant sources before content use;
this dated table is not a permanent assertion of freshness.

### Recent commit evidence

- Target local: `1be06e5`, `9b67943`, `98d044a` (January 2026, distribution changes).
  Remote-only `c4e84d7` (2026-09-06): updated portfolio and complete pump case;
  30 paths changed relative to local HEAD. See [PROJECT.md](PROJECT.md).
- Residential: `e8f9771` shared-memory feedback record; `fc1a501` image embeds
  and thermal/radiation emphasis; `fdbe7bf` publication memory; `08fa866` initial
  case study (all 2026-09-06).
- Reactor: `6fc22bd` micrograph award citation; `f7a07c3` visual hook and
  dimensionless analysis; `8f73909` portfolio setup (2026-09-06).
- Doctoral: `f6c9e78` publication handoff and `3c2dd9c` curated research
  publication (2026-09-07).
- Pump: `2253a31` inline hero animation, `dfdda75` shared coordination layer
  (2026-09-07); `3795e48` portfolio and `6eda514` initialization (2026-09-05).
  An additional local branch `docs/pump-cfd-portfolio` tracks its same-named
  origin branch; it was not selected or changed.

## PORTFOLIO TARGET: albertobraso7.github.io

- GitHub: [repository](https://github.com/albertobraso7/albertobraso7.github.io).
  Public visibility confirmed by unauthenticated GitHub repository API.
- Only normal edit destination. No equivalent agent-memory files were present
  locally or in the fetched remote tree before bootstrap.
- Preserve the existing `index.html` LinkedIn URL edit. The newer remote already
  contains that profile URL, but a later integration must check the complete
  diff. The inspected remote files are now the working-tree baseline, with the
  profile correction preserved. HEAD remains behind 1; no Git integration,
  staging, commit or push occurred. See CURRENT.md for the completed edits.

## SOURCE PROJECT: Residential ventilation and solar exposure

- **Location / Git:** `../../casas`; `master`; UP TO DATE at the snapshot above.
  [Public GitHub repository](https://github.com/albertobraso7/residential-ventilation-cfd),
  public visibility confirmed by unauthenticated API.
- **Category:** consulting / building environmental CFD.
- **Strongest topic:** wind-driven ventilation and solar heat-flux comparison,
  OpenFOAM airflow with Fluent cross-checks and Fluent solar analysis.
- **Read first:** `docs/portfolio_case.md`, then `README.md`.
- **Supporting docs:** `docs/results.md`, `docs/methodology.md`,
  `docs/simulation_scenarios.md`, `docs/limitations.md`.
  `docs/project_reconstruction.md` is internal evidence commentary; consult it
  for unresolved provenance only, not as copy for the public narrative.
- **Figures:** existing paths in `CasasBien/casa/`, `CasasBien/casaBase/`,
  `CasasBien/termperatura/` and root temperature images. Primary pair:
  `CasasBien/casa/casa1535/plano1.jpeg` and
  `CasasBien/termperatura/CasasDiciembre/casa15Diciembre.jpg`;
  `CasasBien/casa/casa1535/plano2.jpeg` adds a vertical airflow section.
- **Media/video:** no dedicated curated video directory identified; use the
  documented still images. Do not open private archives to search for media.
- **Concerns:** private client correspondence, identities/location, residential
  details and source CAD/meshes must stay private. Existing case copy is
  anonymized; retain that boundary. No blanket redistribution license verified.
- **Readiness:** curated narrative and strong paired visuals available. Results
  are qualitative trade-offs, not a demonstrated uniform ventilation improvement
  or a quantified energy-saving claim. Four exact stills were reviewed and reused
  locally under the user's continuation instruction; provenance is recorded.
- **Access:** READ ONLY. Ignored mesh/private archive content is not a website input.

## SOURCE PROJECT: CVD tubular reactor

- **Location / Git:** `../../maestria`; `main`; UP TO DATE.
  [Public GitHub repository](https://github.com/albertobraso7/cvd-tubular-reactor-cfd),
  public visibility confirmed by unauthenticated API.
- **Category:** thermal/process engineering research (Master's).
- **Strongest topic:** buoyant porous-media heat transfer, Re/Gr/Ri analysis,
  experimental validation and precursor-position optimization in OpenFOAM.
- **Read first:** `docs/portfolio_case.md`, then `README.md`.
- **Supporting docs:** `docs/results.md`, `docs/validation.md`,
  `docs/numerical_setup.md`, `docs/simulation_campaign.md`, `docs/limitations.md`.
  `TESISFINAL.pdf` is a deep reference only when curated docs are insufficient.
- **Figures:** `figures/flow/`, `figures/geometry/`, `figures/temperature/`,
  `figures/validation/`, `figures/heat_transfer/`, `figures/results/`.
  Primary hero: `figures/flow/reactor_streamlines_bernard_cells.png`.
  Support: `figures/heat_transfer/precursor_position_optimization.jpg`,
  `figures/validation/temperature_profile_validation.jpg`.
  Diagram/micrograph candidates: `figures/geometry/reactor_apparatus_diagram.png`,
  `figures/results/nanoartography_award_micrograph.jpg`.
- **Media/video:** `media/` contains streamline still exports, including
  `Convective_Bernard_Cells.png`; no curated video identified.
- **Concerns:** experimental-process diagrams and collaborative/third-party
  images need attribution and reuse review; do not copy raw presentation
  screenshots or incidental unpublished information. Avoid claiming the CFD
  simulated reaction chemistry or radiation; neither was modeled.
- **Readiness:** strong curated case, parametric results and separate physics
  validations. A 26.5 cm precursor position is reported with about +10 degrees C
  preform temperature and decomposition from 15% to about 52%, with experimental
  confirmation discussed in source docs. These are reported findings, not
  calculations independently repeated in this bootstrap.
- **Access:** READ ONLY. `casos/` raw case/mesh investigation is deferred;
  public clone lacks excluded mesh connectivity and is not fully rerunnable alone.

## SOURCE PROJECT: Aneurysm multiphysics CFD

- **Location / Git:** `../../doctorado/aneurysm-multiphysics-cfd`; `main`;
  UP TO DATE. [Public GitHub repository](https://github.com/albertobraso7/aneurysm-multiphysics-cfd),
  public visibility confirmed by unauthenticated API.
- **Category:** doctoral research / biomedical thermofluids.
- **Strongest topic:** FSI, non-Newtonian rheology, turbulence-model assessment
  and exploratory Lagrangian particle transport.
- **Read first:** `docs/portfolio_case.md`, then `README.md`.
- **Supporting docs:** `docs/results.md`, `docs/validation.md`,
  `docs/methodology.md`, `docs/particle_transport.md`, `docs/limitations.md`,
  `docs/publications.md`, `docs/assets.md`, `docs/asset_manifest.json`,
  `docs/repository_readiness.md`.
- **Figures:** `figures/results/`, `figures/particles/`, `figures/validation/`,
  `figures/mesh/`, `figures/geometry/`. FSI poster:
  `figures/results/fsi_arteries.jpg`; quantitative support:
  `figures/results/wall_model_tawss.jpg` and `figures/mesh/mesh_sensitivity.jpg`.
- **Media/video:** `media/curated/fsi_arteries.mp4` is the preferred hero;
  `media/curated/particle_transport.mp4` is second. Corresponding GIF previews
  are `fsi_arteries_preview.gif` and `particle_transport_preview.gif`;
  `media/curated/elastic_pipe.mp4` supports the benchmark.
- **Concerns:** original clinical identifiers, patient data, research tables,
  geometry/CAD and restricted datasets are not portfolio inputs. Preserve
  collaboration credit and per-asset rights; publication and dataset licenses
  differ. FSI deformation scaling/run provenance remain unverified; particles
  do not establish a quantitative residence/trapping result or clinical predictor.
- **Readiness:** curated case and preferred animations available. Source reports
  43% GON difference for an aortic wall-model comparison and maximum 6% wave-speed
  discrepancy in the elastic-tube benchmark; preserve the stated context.
  A complete executable reproduction has not been established.
- **Access:** READ ONLY. Use the curated checkout, not the non-Git research
  parent, unless a specific unresolved question requires private-source review.

## SOURCE PROJECT: Automated centrifugal pump CFD

- **Location / Git:** `../../pyfluent/pump_workflow/pyfluent_pump`; `main`;
  UP TO DATE. Configured [GitHub remote](https://github.com/albertobraso7/pyfluent_pump).
  **Public visibility is UNVERIFIED:** unauthenticated repository API returned
  HTTP 404 while Git fetch succeeded. Source notes calling it public are not
  sufficient evidence; do not change visibility or assume anonymous access.
- **Category:** rotating machinery / CFD automation and reproducibility.
- **Strongest topic:** Fluent/PyFluent MRF performance mapping, CPU/GPU
  verification, sliding-mesh pressure pulsation and FFT/PSD/BPF analysis.
- **Read first:** no `docs/portfolio_case.md` exists. Use `README.md`, then
  `docs/README.md` as the existing equivalent reading map; do not add source files.
- **Supporting docs:** `docs/steady_results.md`, `docs/transient_results.md`,
  `docs/spectral_analysis.md`, `docs/methodology.md`, `docs/mrf_workflow.md`,
  `docs/smm_workflow.md`, `docs/reproducibility.md`, `docs/data_assets.md`,
  `docs/PUBLICATION_CHECKLIST.md`.
- **Numerical authority:** `results/steady/CANONICAL_RESULTS.md`; accepted MRF
  production family is v6, post-processing v6.1.0. Read this compact provenance
  file before copying steady numbers. `assets/ARTIFACT_MANIFEST.csv` records assets.
- **Figures:** `figures/mrf_hq_7000rpm_final.png`,
  `figures/mrf_efficiency_7000rpm_final.png`,
  `figures/cpu_gpu_runtime_900lph_final.png`, `figures/smm_flow_field_frame.jpg`,
  `figures/smm_tongue_fft.svg`, `figures/smm_tongue_psd.svg`.
- **Media/video:** `media/pump_portfolio_hero_1rev.mp4`, matching GIF,
  `media/pump_portfolio_case_1p5rev.mp4`; see `media/README.md` for provenance.
- **Concerns:** visibility/reuse review remains open. Do not copy proprietary
  CAD, credentials, employer identifiers, raw Fluent outputs or private paths.
  Meshes use LFS; do not download them for website work. Keep startup visuals
  separate from the validated post-warm-up sampling window. Do not run Fluent,
  GPU jobs, publication/sync helpers or notebook execution cells.
- **Readiness:** detailed curated case, processed results and media; a full
  `pump/` page already exists in the verified portfolio remote. Source headline
  results include 2.29x GPU speedup at the matched 900 L/h point and 69.96%
  simulated efficiency at 1050 L/h; interpolated BEP is a different quantity.
- **Access:** READ ONLY. Existing source task notes saying nothing was
  committed/pushed are stale relative to verified Git HEAD and upstream.

## Refresh rules

Refresh only relevant repository records when a task uses their content, after
a fetch or when workspace roots change. Preserve full SHA, verification date,
branch/upstream, independent ahead/behind and dirty-state information. Never
turn an HTTP 404 into a claim that a repository is definitely private or absent.
Record unknowns and use reviewed evidence already available locally without
treating availability as permission to publish.

## Initial portfolio integration review (superseded selection size)

The completed local evolution uses 13 selected originals (three reactor stills,
six doctoral media items and four residential stills) with four WebP previews.
Exact anonymous public blobs, source/output hashes and transforms are recorded
in [ASSET_PROVENANCE.json](ASSET_PROVENANCE.json). User continuation after the
exact-asset questions authorized this selected local reuse; no publication
occurred. Third-party reactor diagrams/micrographs and uncurated archives were
omitted. Existing pump media/data were preserved from the verified site baseline.
All four source worktrees were checked clean/current again at completion.
