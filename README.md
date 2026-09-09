# Alberto Brambila — CFD portfolio

English portfolio covering CFD, heat transfer, multiphase flow and simulation automation.

- Website: https://albertobraso7.github.io/
- Pump case: https://albertobraso7.github.io/pump/

## Editing and publishing

GitHub Pages publishes the root of `main`. Edit the HTML, CSS and JavaScript directly; no build step or package installation is needed. Keep `.nojekyll` in the root.

- `index.html`: homepage
- `projects.js`: professional project cards
- `pump/index.html`: detailed pump case
- `pump/assets/`: figures, videos and the licensed math font
- `pump/data/`: downloadable numerical summaries
- `pump-media.js`: video playback behavior
- `reactor/index.html`: buoyant heat transfer and reactor validation
- `aneurysm/index.html`: FSI, model sensitivity and particle transport
- `ventilation/index.html`: residential airflow and solar exposure
- `case-studies.css`: shared case layouts, visual cards and responsive navigation
- `research-depth.css` / `research-depth.js`: research chapters, transferable-skill maps and accessible figure enlargement
- `aneurysm/data/rheology-models.csv`: calculated constitutive curves with parameters/equations documented on the case page
- Each case’s `assets/`: selected figures, full-size originals and optimized media

The existing CV, blog, project pages and their assets remain at their original paths. The pump page distinguishes startup animations from the post-warm-up pressure samples. Preserve that distinction, numerical definitions and project attribution when editing.

## Local development and shared context

Open `index.html` for basic inspection, or serve this directory using a local static HTTP server for media testing. New case pages use relative URLs and do not require JavaScript. Full-resolution figures remain accessible from their captions. Doctoral videos and pump/FSI card previews play while visible, pause offscreen and respect reduced motion and manual pause. Keep their posters, native controls and source credits.

Start agent work with [AGENTS.md](AGENTS.md) or [CLAUDE.md](CLAUDE.md), then [.ai/tasks/CURRENT.md](.ai/tasks/CURRENT.md). Source status, project summaries, decisions, media provenance and the verification record live in `.ai/`. Engineering source repositories are read-only. Commit, push and deployment require a separate explicit request.

For the next case study, follow the [engineering project playbook](.ai/ADD_PROJECT.md): narrative, source evidence, transferable skills, media, implementation and verification.
