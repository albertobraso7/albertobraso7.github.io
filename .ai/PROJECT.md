# Portfolio Project

Alberto Brambila's English-language CFD and thermofluids portfolio for recruiters,
CFD/thermal engineers and technical hiring managers. Present the engineering
question, contribution, method, evidence and limitations through selected visuals.

## Current implementation and Git boundary

The user approved the completed portfolio revision and explicitly requested its
publication on 2026-09-08. The reviewed working tree includes the verified
upstream c4e84d7 baseline and preserves the original LinkedIn correction.
Publication uses that upstream commit as parent of the complete reviewed tree;
no force push or source-worktree integration is required. See CURRENT.md for the
actual publication outcome and current Git state, and ADD_PROJECT.md for the
reusable case-study workflow. Always inspect Git before acting on dated notes.

## Architecture

Plain HTML/CSS and existing vanilla JavaScript. No framework, package manifest,
build step, backend, installation or CI change.

| Area | Files / behavior |
| --- | --- |
| Homepage | `index.html`: existing hero/pump feature; four visual case cards (pump/FSI animated; reactor/residential static); six retained industrial cards; approach/about/contact |
| Main identity | `styles.css`, `recruiter-layout.css`: original charcoal/mint design, unchanged from verified remote |
| Industrial experience | `projects.js`: original six cards and native details/hash links, unchanged |
| Research narrative layer | `research-depth.css` / `research-depth.js`: substantial visual chapters, evidence-linked skills, full-resolution dialog and responsive figure layouts |
| New shared additions | `case-studies.css`: visual cards, case layouts, visible mobile navigation, keyboard focus, reduced motion |
| Pump | `pump/index.html`, `pump/pump.css`, `pump/equations.css`, figures/font/CSV data; only shared navigation stylesheet added to page |
| Reactor | `reactor/index.html`, `reactor/assets/`: thermal process, dimensionless analysis, validation |
| Doctoral | `aneurysm/index.html`, `aneurysm/assets/`: FSI, model sensitivity, benchmark, particle tracking |
| Residential | `ventilation/index.html`, `ventilation/assets/`: paired airflow layouts and separate solar analysis |
| Existing media behavior | `pump-media.js`, `pump-media.css`: preserved pump autoplay/offscreen/manual-pause logic |
| Legacy URLs | `projects/dog.html`, `projects/f1.html`: truthful visual archives; `projects/pump.html`: link to complete case |
| Blog / CV | `blog.html`: original planned topics in common shell; `assets/files/Alberto_Brambila_CV.pdf` unchanged |

## Content and visual system

Keep the strong CFD/thermal hero, AB identity, Arial, charcoal `#101314`,
surface `#181d1f`, light text `#f0f2ed`, muted `#b0b9b9`, mint `#a5efcc`
and warm `#e8b882`. Reuse restrained borders, editorial sections and real CFD
visuals. New cases demonstrate capabilities instead of repeating whole READMEs.

Priority: pump, reactor, doctoral FSI, residential consulting, followed by preserved
industrial experience. Academic and consulting contexts are explicit. The six
existing industrial claims are retained; this task did not independently audit
their confidential supporting work.

Keep simulation predictions separate from experimental findings. Pump startup
visuals differ from post-warm-up spectral sampling; estimated BEP differs from
simulated points. Reactor CFD does not solve reaction chemistry or radiation.
Doctoral results are study-specific research comparisons, not clinical validation.
Residential evidence shows qualitative trade-offs, not energy savings.

## Media

Selected assets only, in each case's existing-style `assets/` directory.
[ASSET_PROVENANCE.json](ASSET_PROVENANCE.json) records source commit/path, public
blob verification, source/output SHA-256, transformations and attribution review.
No source assets were modified. The user-added residential streamlines.jpg
remains untracked in its source repository, unchanged and explicitly selected
for this revision. Full-resolution stills remain linked for zooming
axes/legends; full-frame WebP previews improve loading without cropping evidence.

Doctoral videos and pump/FSI homepage cards have native controls/posters,
`preload="none"` and viewport-aware muted playback via the existing pump-media.js.
They pause offscreen, respect user pause and reduced motion. This explicitly
authorized 2026-09-08 behavior supersedes the first integration's no-autoplay choice.
FSI is resized to 1600×904 H.264/faststart at original 15 fps and 20 s.
Particle video remains the existing optimized 1920×1080, 37.5 s source.
Four doctoral clips are used: FSI, idealized velocity, elastic-tube pressure wave
and particles. Reactor has 11 figures; residential has the new 3D streamline hero
and seven supporting figures. A source apparatus diagram, material observations
and the author's NanoArtography micrograph were added with attribution. New
rheology SVG/CSV show calculated constitutive laws, not fabricated CFD imagery.
All new case pages include explicit evidence-to-transferable-skill maps.

## Development and validation

Edit static files directly. Open `index.html` for basic inspection; use an
available static HTTP server rooted at the repository for reliable media tests.
An isolated Node static preview was used on loopback port 8000. No Python/Node
CLI was available on PATH and no packages were installed.

See [VERIFICATION.md](VERIFICATION.md) for actual browser checks, scope and limits.
Recheck relevant routes after changes. Use `git diff --check` (with CRLF-aware
whitespace settings on Windows), local links, media playback, keyboard controls,
reduced motion and responsive layouts. Ordinary Git diff omits untracked files.

## GitHub Pages

Keep `.nojekyll` and relative paths. The existing README documents publishing
the root of main with no build step. Anonymous GitHub API confirms Pages exists,
and the existing Pages workflow successfully deployed main at 6ed12ce on
2026-09-08 (run 34305966087). Exact branch/folder configuration was not read.
There is no Sites configuration or migration. See CURRENT.md for publication status.

Shared memory is development context, not a secrecy boundary. Do not include
private data, absolute machine paths or credentials. Review the actual publishing
artifact before future publication; `.nojekyll` means Jekyll exclusions cannot
be assumed. The local preview excludes dot-directories and internal entry points.
