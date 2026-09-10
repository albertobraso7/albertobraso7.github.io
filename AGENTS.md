# Agent instructions

## Repository scope

This repository is the GitHub Pages website. Engineering source repositories are read-only for website tasks unless the user explicitly requests source edits. Preserve the existing HTML/CSS/JavaScript site, approved identity, URLs and asset provenance.

<!-- portfolio-standards:begin -->
<!-- source=portfolio-standards/PORTFOLIO.md version=1.0.0 sha256=6b36f8c6cae8b9e6fcb656d1b27b2bdc64886d7b61517296f9b9c21b2573ab64 -->
# Shared engineering portfolio standard

Version: 1.0.0

## Scope and authority

These rules apply to the target portfolio repository, not every folder visible
in an editor. Identify its actual root and requested task before acting.
Follow the user's current scope and existing session authorization. An audit-only
request forbids edits, including memory updates. A development request does not
by itself authorize commit, push, deployment or messages to other people.

Repository evidence and shared project files are authoritative for project facts;
conversation history is not required. Apply local engineering constraints after
these general rules. Never use an exception to hide unsupported claims or expose
restricted material. Explain material conflicts instead of silently choosing one.

## Portfolio writing and visuals

- Treat the README as an engineering portfolio introduction. Let recruiters
  understand the problem, contribution and evidence quickly.
- Write public content in professional English. Minimize first-person wording;
  avoid generic marketing, inflated claims and AI-sounding filler.
- Put a strong, meaningful engineering visual near the beginning. Use an actual
  image embed or supported HTML image for a visible figure, not only a text link.
  Links to full-resolution assets are useful alongside displayed previews.
- Prefer real source animations for transient or coupled physics. Keep static
  contours, streamlines, isosurfaces, plots and diagrams when they explain the
  work better or no source video exists. Never fabricate CFD fields as evidence.
- Present useful quantitative findings early when available. Include units,
  operating conditions, comparison basis and traceable sources. Avoid detached
  large numbers, decorative metrics and invented performance or savings.
- Tell the story: engineering question, physical reasoning, modeling decisions,
  checks, results, interpretation and transferable capability. Keep deeper
  methodology and reproducibility accessible without turning the README into
  the thesis or leading with installation instructions.
- Connect each transferable skill to demonstrated work and evidence, then explain
  possible reuse elsewhere. Distinguish future applications from completed work.
- Keep objectives clear and confident while disclosing scientific uncertainty,
  inference, validation limits and simulation-versus-measurement distinctions.
- Preserve legends, axes, units, comparable scales, geometry and attribution.
  Check displayed images and GitHub equation rendering, not just source syntax.
- Website pages should provide a more visual, recruiter-oriented reading path
  than repository READMEs, with useful detail and progressive inspection.
  Respect accessibility, reduced motion and working static fallbacks.
- Use strong existing projects as references, not identical templates. The pump
  case demonstrates automation, performance curves and spectral analysis;
  reactor and aneurysm cases demonstrate research depth and transferable physics.

## Structure, provenance and confidentiality

Use functional folders only when needed. Preserve dependency groups, original
file bytes during relocation, numerical sources of record and useful READMEs.
Do not impose a folder tree that adds empty or misleading directories.

Keep proprietary, employer-internal, customer-sensitive, confidential and
NDA-restricted material out of public content. Sanitize or independently recreate
industrial examples when required; do not imply an independent model is an
original industrial result. Review rights, third-party credits and selected
assets. Public accessibility alone does not establish redistribution rights.

Never publish credentials, private correspondence, patient-identifiable data,
internal identifiers or personal absolute paths. Dot-prefixed folders are not
access control. Keep exclusions and public-file allowlists intact unless a
specific change is authorized. Review new heavy assets before publishing and
reuse the author's existing file decisions without asking the same question again.

## Shared working procedure

### Start work

1. Identify the exact repository and task scope. Read its local instruction
   section and shared CURRENT, PROJECT, DECISIONS and WORKFLOW files as directed.
2. Inspect Git status, relevant staged/unstaged diffs and untracked files. For
   a non-Git archive, explicitly use the documented filesystem-only procedure.
3. Resume applicable IN_PROGRESS, HANDOFF or BLOCKED work from its evidence.
   COMPLETE or IDLE permits a new task; do not restart completed work.
4. Reuse curated case narratives, source registers and asset manifests before
   raw research inspection. Read only what resolves a concrete gap.
5. For substantial authorized implementation, write one current objective and
   checkable acceptance criteria. Preserve unrelated work and staging.

### Work and validate

Proceed autonomously with routine reversible work in scope. Ask only for missing
information or consequential decisions that existing evidence and authorization
do not settle. Never discard work or widen publication scope to finish faster.

One task has one owner at a time; switching agents does not create a provider
branch. Shared files do not provide locking or synchronize another checkout.
Run checks appropriate to the change. Do not run solvers for documentation work,
execute inactive notebook cells, or claim validation that was not performed.
Keep local engineering execution restrictions and frozen parameters intact.

### Handoff

Record objective, current state, completed work, remaining steps, changed files,
checks, limitations, branch/HEAD when applicable and the next concrete action.
Use HANDOFF for a voluntary transfer and BLOCKED for a named unmet dependency.
Save the actual files before yielding. Another clone does not receive uncommitted
work merely because it has the same branch name. Do not commit/push just to hand off.

### Finish work

Verify the acceptance criteria against files and checks. Put durable knowledge
in PROJECT, lasting decisions in DECISIONS and temporary state in CURRENT.
Set COMPLETE only when the current objective is met; retain a concise receipt
until the next task replaces it. Use IDLE only if no task snapshot remains.
Do not append an endless task history or erase a valid receipt immediately after
commit. Record deliberate future work separately from incomplete acceptance criteria.

### Publish only within authorization

If publication is explicitly requested, review the exact selected changes and
current remote state, preserve local work, use a normal push and verify the
remote result. Do not automatically pull, reset, clean, force-push or rewrite
history. For website publication, also verify the deployment and affected routes.
No automatic action by an instruction-sync helper may commit or publish files.
<!-- portfolio-standards:end -->

## Local project context

Resolve links relative to this file, not the terminal working directory.
Read [CURRENT](.ai/tasks/CURRENT.md), [PROJECT](.ai/PROJECT.md),
[DECISIONS](.ai/DECISIONS.md) and [WORKFLOW](.ai/WORKFLOW.md) before editing.
For portfolio content, read [sources](.ai/SOURCES.md), [inventory](.ai/PROJECT_INVENTORY.md)
and [the case-study playbook](.ai/ADD_PROJECT.md).

The managed block above is generated; edit PORTFOLIO.md in the separate
portfolio-standards repository and use its explicit sync command. Keep local
engineering instructions outside the markers. A standalone clone contains the
full standard and needs no sibling folders to follow it.
