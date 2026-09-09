# Durable Decisions

Record only decisions affecting future development. Amend or explicitly
supersede existing entries; keep transient progress in `tasks/CURRENT.md`.

## D001 - One shared Markdown memory, sequential ownership

**Decision:** Codex and Claude Code use the same `.ai/` files, one current task
and the same working tree. Entry points are short indexes. No database, service,
provider-specific memory or automatic synchronization was introduced.

**Reason:** Another agent must continue without conversation history or repeated
whole-workspace investigation.

**Consequences:** Save evidence and handoff before yielding. Only one agent writes
at a time; `Last Agent` is attribution, not a lock. A different checkout does
not receive uncommitted files merely because it uses the same branch name.

## D002 - Portfolio is the sole normal write target

**Decision:** Only `albertobraso7.github.io` is normally modified. Other engineering
repositories and the doctoral research archive are read-only content sources.
No commits or pushes occur without an explicit user request.

**Reason:** Preserve engineering work and keep website integration separate from
source maintenance, simulation execution and publication.

**Consequences:** Record source issues in the portfolio register without fixing
source files. The explicitly requested fetch operation may update Git metadata;
it must not change source worktrees, branches, staging or content.

## D003 - Verified remote freshness precedes content reuse

**Decision:** Inspect Git state and fetch relevant remotes before trusting content.
When a clone is behind, use the latest verified remote snapshot as the content
authority while preserving local edits. Never integrate automatically.

**Reason:** The bootstrap found the target one commit behind a substantial site
update. Cached tracking refs and stale task notes can conceal current work.

**Consequences:** Keep dated SHAs and independent sync/dirty classifications in
`SOURCES.md`; read remote files with `git show`. Failed network checks mean
freshness is unknown. Synchronization is a separate requested task, not an
implicit pull, merge, rebase, reset, clean or destructive checkout.

## D004 - Curated, attributed evidence and reviewed public content

**Decision:** Content reuse starts from source `docs/portfolio_case.md`, otherwise
README and curated supporting docs. Preserve attribution, units, conditions,
scientific limitations and rights qualifications. Do not copy sensitive or
uncertain material into public content without review.

**Reason:** Engineering archives contain confidential, clinical, residential,
proprietary and third-party material beyond their curated portfolio selections.

**Consequences:** Keep private source material and absolute machine paths out of
shared repository memory as well as website files. Treat public repository
access as availability, not blanket reuse permission. Use only task-relevant
raw data inspection when curated evidence is insufficient. No new design,
framework or deployment change was decided in bootstrap.

## D005 - Evolve the verified site, preserve its identity

**Decision:** Keep the charcoal/mint hero, pump evidence and six industrial cards.
Add four visual case cards and three static case pages using one shared additive
stylesheet. Preserve plain HTML/CSS/JavaScript and GitHub Pages.

**Reason:** The remote site already has a coherent identity and detailed pump
story. The material gap is visual access to the other documented work.

**Consequences:** Order by hiring relevance (pump, reactor, FSI, residential).
New cases reuse the existing visual language. Do not introduce a framework,
decorative imagery, extra autoplay or a new hosting service.

## D006 - Verified remote files as the editing baseline, Git refs untouched

**Decision:** Materialize the 30 inspected remote changes from `c4e84d7` into the
working tree before incremental product edits. Retain the original homepage backup
and its LinkedIn profile correction. Leave HEAD, staging and branch unchanged.

**Reason:** The local HEAD was obsolete and omitted the complete current pump
site. Rebuilding against it would discard existing public work.

**Consequences:** This is file-level implementation, not a pull/merge/rebase.
Local main remains behind 1. Future Git integration is a separate task requiring
careful preservation of all tracked/untracked work; compare against `c4e84d7`.
This clarifies D003's editing workflow without authorizing automatic Git integration.

## D007 - Selected source visuals with explicit scientific scope

**Decision:** Use 13 selected original media items from three curated repositories,
plus four optimized WebP derivatives. Exact source blobs were verified through
anonymous GitHub APIs. After the two exact-asset reuse questions, the user directed
completion without further confirmations; local reuse proceeded within that scope.

**Reason:** Real CFD evidence improves credibility, but availability alone is not
blanket permission for a whole research or consulting archive.

**Consequences:** Keep the provenance manifest, collaborative attribution and
source-specific limitations. No clinical records, original anatomy files, CAD,
private communications or uncertain third-party diagrams enter the portfolio.
Retain full-resolution stills; resize only the FSI video and display previews.
Publication/commit/push remains outside this task. Do not reopen already resolved
routine reuse questions for these same unchanged selected assets.

## D008 - Repair legacy routes and positional mobile navigation

**Decision:** Keep DOG/F1 URLs with truthful visual archive content and existing
appropriate images; link the legacy pump URL to the full pump study. Bring the
blog shell into the common identity while retaining its three planned topics.
Override the mobile rule that hid navigation links by position.

**Reason:** Legacy pages referenced nonexistent figures, F1 carried unrelated
multiphase copy, and positional hiding removed useful Contact/section links.

**Consequences:** Existing URLs survive, broken placeholders are removed and no
unverified performance metrics replace them. All header links remain keyboard-
and touch-accessible. Full case content works without JavaScript.

## D009 - Research depth and transferable skills lead the presentation

**Decision:** The 2026-09-08 user correction supersedes the first integration's
minimal figure/metric selection. Reactor centers Re/Gr/Ri/Nu, incremental models,
validation and material outcomes. Doctoral chapters separately demonstrate FSI,
rheology, turbulence assessment, particles and validation. Residential connects
3D flow, sections, surrounding exposure and solar load. Each ends with explicit
evidence-to-transferable-skill mapping.

**Reason:** The first integration was technically restrained but substantially
weaker than the source READMEs in depth, visuals and professional differentiation.
Large isolated metrics cannot substitute for the engineering reasoning.

**Consequences:** Keep contextual quantitative evidence and substantial visual
chapters. Avoid shrinking theses back to generic summary cards. The user's new
residential streamlines image is the fixed hero. Include the requested apparatus,
material-growth and NanoArtography visuals with correct attribution.

## D010 - Source animations and progressive figure inspection

**Decision:** Reuse viewport-aware playback on pump/FSI homepage cards and four
doctoral videos, with native pause controls and reduced-motion behavior. This
supersedes D005's prior no-extra-autoplay restriction under explicit user direction.
Static reactor/residential imagery remains static. Enhance original figure links
with a keyboard-accessible native dialog and actual-size inspection.

**Reason:** Actual CFD motion demonstrates transient and coupled physics;
full-resolution inspection gives the website a useful advantage over README embeds.

**Consequences:** No fabricated motion, source-field modification, decorative
animation or change to the existing playback script. Defer offscreen video loads.
Original links/native controls remain the no-JavaScript fallback.

## D011 - Traceable calculated rheology visualization

**Decision:** Show four constitutive viscosity laws using documented thesis
parameters, with SVG, CSV, equations and an explicit calculated-input label.
Do not describe the curves as new CFD results. Verify NanoArtography attribution
against its official record and distinguish NaF from Si3N4.

**Reason:** These additions explain model choices and physical outcomes without
inventing simulation results. Source numerical ambiguities must not be amplified.

**Consequences:** Do not repeat the source's Nu = -1.092 Ri + 15.407 expression
against raw Ri values without recovering axis normalization. Preserve the
dimensionless and regional Nu interpretation instead. No raw solver rerun or
source correction is part of this website task.

## D012 - Approved publication and reusable project playbook

**Decision:** On 2026-09-08 the user approved the expanded site and explicitly
requested uploading it and preserving instructions for future chats. ADD_PROJECT.md
is the portable editorial, implementation and verification playbook, linked from
both agent entry points and README. This authorizes publishing the reviewed
selection and supersedes the earlier task-specific no-publication boundary.

**Consequences:** Preserve upstream history and the reviewed snapshot. The
previous materialized baseline is reconciled by making the reviewed tree a
normal descendant of verified upstream c4e84d7, without force pushing. Record
actual deployment evidence in CURRENT.md; authorization for this upload does
not automatically authorize future unrelated publications.
