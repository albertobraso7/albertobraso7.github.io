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

## Debubbler checks — 2026-09-10

Homepage and Debubbler case passed eight viewport checks at 320, 390, 768 and
1440 px with no horizontal overflow or broken images. Both also passed 200%
root text at 320 px after long-word wrapping corrections. Video playback,
offscreen pause, persistent manual pause and reduced-motion pause passed.
Figure dialog opens/closes with Escape. With scripts disabled the case retains
four chapters, six direct figure links and native video controls. Desktop and
mobile heroes and evidence captions were visually reviewed. Five website media
files match the published source SHA-256; 65 local HTML references resolve.
The source net-flux integration independently reproduces 78.22206454081913%.
No new solver run, industrial validation or native Discovery opening was tested.
Temporary browser screenshots are local QA artifacts, not website content.
Publication checks are recorded in CURRENT.md after deployment.

## Throttle body and editorial revision — 2026-09-11

Twelve page/viewport combinations passed: homepage, Debubbler and throttle body
at 320/390/768/1440 px, with one H1, no overflow, no broken images or runtime
exceptions. All three also passed 200% root text at 320 px. Desktop/mobile
screenshots were visually reviewed. The homepage has no duplicated Debubbler
card, FSI precedes reactor, and the animation badges are absent.

The throttle hero retains all pixels and both colorbars. Figure dialog opening,
Escape closure and restored focus passed. Without JavaScript, its four chapters,
hero and direct full-resolution link remain. The pressure definition appears
immediately below the figure. All 82 local HTML references resolve; the selected
image matches the source SHA-256. Source review covered 21 allowlisted files,
33 Markdown links and syntax of both unchanged Python drivers. The original
journal retains one harmless trailing space; all other selected whitespace
checks pass. No solver execution or convergence validation is claimed.

## 2026-09-11 visual portfolio and CV

Chromium local checks: all seven main routes at 320/390/768/1440 px, one h1, no
horizontal overflow or missing section anchors. Checked 200% leaf-text enlargement
at desktop, no-JavaScript case access, capability filtering, figure dialog Escape
and focus restoration, and reduced-motion video pause. Desktop/mobile hero
screenshots inspected. New net-air-routing chart is calculated from 21,349 source
samples and reaches 78.22206454%; it contains no synthetic alternatives.
CV compiled with Tectonic 0.17.0, exactly two A4 pages; both rendered and inspected.
Both bodies finish within about 11 pt of the usable lower edge, no margin overflow.
Public engineering links removed. No Fluent run or new physical validation.
Analytics test evidence is maintained separately with its review package.

## 2026-09-13 ? Hydrogen dilution and restored Debubbler figures

Chromium checks passed for home, hydrogen-dilution and debubbler at 1440, 768, 390 and 320 px: one h1, no page overflow, no broken images/section anchors. Figure keyboard opening, actual-size zoom, Escape and focus restoration passed. H2 stays visible in the Automation filter. H2 content works without JavaScript and at 200% leaf-text size. Videos were excluded from these tests because playback was unchanged. Inspecting screenshots revealed and corrected a tall mobile hero box; its image now keeps its native aspect ratio. The home-card screenshot was checked again after explicit image decoding. Desktop/mobile hero, result figures, table and captions were visually inspected.

Both Debubbler panels are byte-identical to their selected sources and retain adjacent CFD/synthetic disclosure. The pulse figure remains excluded. H2 figure endpoints and last-200 ranges were independently checked against the saved report arrays; output remains mass%, not mol%. No domain maximum or convergence validation. Private source syntax, exact report columns, finite values and iteration-order rejection checked. Only the displayed six-row summary is a public CSV; full processed histories remain private.

Source repository: private fuel-cell-h2-dilution. See asset provenance for exact hashes. No Fluent run. Publication is verified separately against the pushed Pages deployment.

## 2026-09-13 - Engineering narrative review

Seven case introductions now explain the engineering problem, personal contribution and outcome or decision. The professional log was reread for Debubbler (28), hydrogen dilution (7/8), throttle body (10) and pump (21/22/23). Academic and residential cases retain their own source context. CASE_STORY_MAP.json records these relationships and the limits of each demonstration.

Chromium checks passed across home and seven cases at 1440, 768, 390 and 320 px: no horizontal page overflow, one h1, no broken section anchors, and one story section per case. Seven context sections also passed at doubled text size. H2 native disclosures work without JavaScript; the nested figure dialog opens and closes with Escape. Desktop/mobile screenshots of the primary stories and shortened H2 hero caption were inspected. STORY_UI_VERIFICATION.json retains the responsive results. Unchanged videos were excluded from browser downloads. No solver runs, media edits or numerical changes.

Publication receipt: f3b2de62096d377267edcc0cafa33a9f476ae743 is pushed and matched origin/main. Production responses for all seven case routes and shared CSS were HTTP 200; home, seven case HTML files and CSS match local content after normalizing line endings. The short H2 caption and new story anchors are present. Pages latest-build metadata returned built/success but still named the previous documentation commit 43751ac; actual production content was therefore verified directly against all nine changed public files.


## Electric-motor integration — 2026-09-15

Chromium checks passed on home and /electric-motor-cooling/ at 1440, 768, 390 and
320 px: one h1, no horizontal overflow, no broken section anchors or loaded images,
and no page script errors. New video decodes at 2560 x 1440, duration 5 seconds.
Visible playback, offscreen pause, persistent manual pause and reduced-motion
pause passed. Figure keyboard opening, Escape and restored focus passed.
Debubbler participates in the Multiphysics filter. Native disclosures and case
text work without JavaScript. Desktop/mobile feature and decoded analysis figure
were visually inspected; full-resolution enlargement keeps small plot labels accessible.

New-page/home local links resolve. Video and PNG match the authorized source
bytes; poster is a full-frame extraction at 1 second. All 50 original engineering
files were hash-checked after relocation; Python syntax and relocated CAD path
checked without executing Fluent. Mesh/case/data exclusions reviewed separately.
Public CV SHA remains 035393989f75f22f590717f95d9eb0e9fc5bbe413ffc63ccee3654da610a1d46.
Flow-only VOF, illustrative thermal chart and professional P2/P3 outcomes remain
explicitly separated. Publication receipt follows in CURRENT.
