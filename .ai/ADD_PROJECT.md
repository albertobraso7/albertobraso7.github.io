# Add the next engineering case study

This is the reusable playbook for Alberto's existing English-language portfolio.
Read this without needing the original conversation. The user approved the richer
reactor, doctoral and residential cases on 2026-09-08. Preserve that standard.

## The editorial standard

Tell the engineering story: question → physical reasoning → modeling decisions →
checks → results → design interpretation → transferable capability. A recruiter
should understand the contribution quickly; a technical reviewer should be able
to inspect the evidence further down the same page.

The user rejected the first version because thesis projects had too few figures,
weak images and detached large numbers. Do not reduce substantial research to
three generic cards or a metric strip. The website should add useful explanation,
visual sequencing, animation and figure inspection beyond the source README.
Depth follows the evidence available; there is no mandatory figure count.

Each quantitative claim needs units, conditions, comparison basis and a source.
Distinguish personal contribution from collaborators' work, simulation from
measurement, calculated inputs from solver results, and demonstrated skills from
possible future applications. Do not invent performance, savings or validation.

## Start with verified evidence

1. Read CURRENT.md, PROJECT.md, DECISIONS.md, SOURCES.md and PROJECT_INVENTORY.md.
   Inspect current tracked, staged and untracked work before editing.
2. Locate the relevant source repository using SOURCES.md and the actual workspace.
   Source worktrees are read-only. Check its remote freshness before reusing new
   content; do not pull, merge, rebase or modify the source.
3. Start at docs/portfolio_case.md, otherwise README, then targeted methodology,
   numerical setup, results and validation. Open raw data only for a specific gap.
4. Make a small evidence map: claim; source commit/path; figure/video; operating
   condition; personal contribution; transferable skill; uncertainty or credit.
5. Inspect actual assets, not just filenames. Preserve legends, units, axes,
   comparison scales, geometry and attribution. Reconcile ambiguous numbers;
   if unresolved, explain the supported interpretation without inventing a fix.
6. Review selected material for confidentiality, private details and reuse rights.
   A public repository does not grant rights to every third-party asset inside it.
   Reuse already authorized selected assets without repeating approval questions.

## Plan the page around a decision

- Opening: a specific engineering question, concise context, contribution and the
  strongest full-frame visual. Avoid a generic software list as the main story.
- Physical problem: geometry, operating conditions and why the problem matters.
- Method: explain consequential choices and alternatives. Use apparatus/domain
  figures and a readable model or scenario progression where available.
- Credibility: place validation and mesh/time sensitivity near the claims they
  support. State what was checked and what remains outside the evidence.
- Findings: use contextual comparisons with captions explaining what to notice
  and why it affects the engineering decision. Show multiple complementary views
  when they answer different questions.
- Interpretation: connect the results back to the question and recommendation.
- Transferable skills: each skill links to evidence earlier on the page. Use the
  pattern demonstrated action → evidence → possible application elsewhere.
- Further depth: source repository, pinned technical references, credits and a
  concise technical-scope disclosure. Keep qualifications near relevant claims.

Good existing examples: reactor/index.html for dimensionless reasoning and
simulation-to-experiment interpretation; aneurysm/index.html for layered physics
and benchmark evidence; ventilation/index.html for honest design trade-offs;
pump/index.html for automation, performance curves and spectral analysis.

## Implement within the existing site

Keep plain HTML/CSS/vanilla JavaScript and GitHub Pages. No framework, package
installation, new hosting service or visual redesign is needed.

Create <case>/index.html and <case>/assets/; add <case>/data/ only for useful,
traceable downloadable data. Use one existing research page as the structural
reference, then adapt chapter count and layout to the story. Do not copy claims,
figure counts, numbers or headings merely to fill a template.

Reuse styles.css and recruiter-layout.css for identity; case-studies.css for
shared case structure; research-depth.css for research chapters, evidence layouts
and capability maps. Use relative paths (../ from a case page). Preserve the
homepage hero, pump feature, industrial cards, CV, contact and existing URLs.

Existing useful hooks: body.research-page; .wrap; .chapter with stable id;
.chapter-head; .story-pair; .wide-evidence; .capability-map; .scope-detail.
Inspect the actual current CSS before adding classes. Keep semantic headings,
visible section navigation, meaningful image alt text and original dimensions.

Add a homepage study card that explains the problem and the capability it proves.
Connect the case from appropriate previous/next links. Preserve existing project
order unless the new project's hiring relevance warrants an intentional change.

## Media that explains the physics

Use actual source animations when they demonstrate transient behavior or coupled
physics. Keep static images when no meaningful source video exists. Never animate
invented CFD fields or generate decorative imagery as scientific evidence.

Videos reuse pump-media.js with data-autoplay, muted, loop, playsinline, native
controls, poster and preload="none". Inspect the existing markup first. The
current behavior starts visible media, pauses offscreen, preserves manual pause
and respects reduced motion. Do not add a second playback implementation.

For stills, link the full-resolution original from a figure with a useful caption.
research-depth.js enhances these links with a native dialog, actual-size zoom,
Escape and restored focus. Original links must work without JavaScript. Keep
axes/legends visible; optimize previews without changing scientific meaning.

Record every selected original/derivative in ASSET_PROVENANCE.json: repository,
source commit/path, source and output SHA-256, destination, transformation and
credit/authorization context. Record user-added local assets honestly without
claiming they came from a published commit. Label calculated charts as calculated,
include equations/parameters, and separate them from CFD or experimental results.

## Verify the actual experience

Use a local static HTTP server with video byte-range support. No solver reruns.
Check the homepage and affected cases at desktop, tablet, 390 px and 320 px;
inspect 200% text where layouts are dense. Confirm no horizontal overflow, broken
images, missing assets, hidden navigation or invalid section anchors. Inspect the
actual rendered figures and captions, not just a successful HTTP response.

Test all new videos: playback, poster, offscreen pause, persistent manual pause
and reduced motion. Test figure links with keyboard, zoom, Escape and restored
focus. Verify meaningful content without JavaScript. A closed dialog's template
image without src is not a displayed broken asset.

Check local links, source references at their pinned commits, media hashes and
Git whitespace. Preserve unrelated work. Summarize what was actually checked in
VERIFICATION.md; do not claim untested browsers or solver validation.

## Leave context and publish only when requested

Update PROJECT_INVENTORY.md, SOURCES.md and ASSET_PROVENANCE.json for the new case;
record lasting decisions in DECISIONS.md and a self-contained CURRENT.md handoff.
Keep machine-specific paths, credentials, scratch screenshots and raw research
archives out of committed memory. Relative source paths and repository URLs make
this guide portable to another chat or checkout.

A request to develop is not automatically a request to publish. When the user
explicitly requests uploading, inspect/fetch the target, preserve all reviewed
work, commit and use an ordinary fast-forward push. Never force-push or blindly
pull over an edited working tree. Check the Pages deployment result and affected
live routes before claiming publication. Do not reopen already granted approval.
