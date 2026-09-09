# Portfolio Verification

Latest revision: **2026-09-08 — research depth and transferable skills**.
Local implementation only. No commit, push, deployment or CFD solver run.

## What changed

The user rejected the thin first integration. The revised reactor has 11 figures
and a narrative centered on Re/Gr/Ri/Nu, model development, validation, placement,
physical growth and NanoArtography. The doctoral case has four videos, six other
figures, explicit rheology/turbulence/FSI/particle/validation chapters and an
evidence-linked skills map. Residential uses the user-added 3D streamlines hero
and seven supporting figures across airflow, sections, site and solar exposure.

## Passed checks

- **20 route/viewport combinations:** homepage and three changed cases at
  1440, 1280, 768, 390 and 320 px in isolated headless Chrome.
  No page overflow, missing displayed images/alt text, hidden header navigation,
  invalid chapter links, runtime exceptions or HTTP resource failures.
  One H1 per page. The unused image template inside the closed dialog is
  intentionally excluded from loaded-image assertions.
- **200% root text size at 320 px:** all three case pages pass without page
  overflow. Award-panel intrinsic sizing was corrected after this check.
- **304 local references** across all nine site routes resolve.
  **20 pinned GitHub file links** exist at their referenced source commits.
- Four doctoral videos decode and play:
  FSI 1600×904 / 20 s; idealized velocity 960×540 / 12.5 s;
  elastic tube 1280×674 / 24.6333 s; particles 1920×1080 / 37.5 s.
  Each advances in time. All pause when scrolled offscreen.
- Initial doctoral view plays only the visible FSI video; the other three retain
  readyState 0 until visited. No whole-page eager video download is required.
- Homepage FSI card autoplays when visible. A manual pause survives scrolling
  away and returning. Reduced-motion emulation prevents automatic playback.
- Figure viewer opens from a keyboard-activated figure link, loads the original,
  toggles actual-size zoom, closes with Escape and restores focus to its opener.
- JavaScript-disabled doctoral page retains all 10 figure/video blocks, all
  five main chapters and six direct original-image links; videos stay paused.
  Original links and native video controls are the progressive-enhancement fallback.
- Desktop/mobile screenshots visually reviewed for main heroes, dimensionless
  reasoning, rheology curves, physical material/award panel and solar comparison.
  Horizontal gutters, headline breaks and equation legibility refined after review.
- All **36 source-derived outputs** and **two calculated artifacts** match
  provenance hashes. The new residential source image is unchanged.
  Reactor/doctoral source worktrees remain clean; residential retains exactly
  the pre-existing user-added untracked `streamlines.jpg`.
- Existing pump page/data/assets and industrial renderer remain unchanged in this
  revision. Git staging is untouched. CRLF-aware whitespace checks pass.

## Scientific traceability

Rheology SVG/CSV are newly calculated constitutive-model curves from the thesis
parameter set in source `docs/numerical_setup.md`, not new CFD fields or an
experiment. Equations, parameters and the illustrative shear-rate interval are
documented on the page. No simulations or new clinical/statistical claims.

The official [NanoArtography 2017 record](https://www.nanoartography.org/2017)
confirms first place for Alberto Brambila Solórzano's The Space Base, a NaF SEM
micrograph with a 0.5 mm image width. The page distinguishes it from Si₃N₄ fibers.
The source's compact Nu–Ri fit notation does not establish normalization;
the site presents the dimensionless framework and regional interpretation
without copying an invalid raw-Ri equation.

## Scope and reproducibility

Audit backups, screenshots and JSON reports are in the local temporary directory
`portfolio-depth-20260908`, outside the website. The earlier audit directory
`portfolio-evolution-20260907` retains the first implementation's checks and
captured `c4e84d7` baseline. The isolated browser was used for software testing;
no user browser session or source repository was modified.

Chrome responsiveness is not cross-engine/device certification. No Safari,
physical iOS or Firefox testing is claimed. External services can change.
GitHub Pages compatibility rests on retained static files, relative links and
existing deployment configuration. No build pipeline exists.

The user explicitly requested publication after reviewing the completed site.
See [CURRENT.md](tasks/CURRENT.md) for the Git and live deployment outcome.
The checks above concern the reviewed product revision and remain valid; this
publication task adds durable documentation without changing that product.

## Publication verification — 2026-09-08

Product commit 6ed12ce43d9690c743e00651bfe00703dd177a51 was pushed normally to
main. [Pages run 34305966087](https://github.com/albertobraso7/albertobraso7.github.io/actions/runs/34305966087) completed successfully, including build and deploy.
The public homepage and three new case pages returned HTTP 200 and matched the
reviewed HTML after line-ending normalization. New research CSS/JS, residential
streamline hero and elastic-pipe MP4 returned HTTP 200 with expected MIME types.
Initial timeouts/stale 404s cleared on retries after deployment. The reusable
ADD_PROJECT.md guide is linked from both agent entry points and README; document
links resolve and committed Markdown contains no absolute machine paths.
