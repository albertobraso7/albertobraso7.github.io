# Current Task

Status: COMPLETE
Last Agent: Codex
Date: 2026-09-10

## Objective and Result

Implemented the approved portfolio instruction architecture. The repository
uses standard version 1.0.0 in a generated AGENTS.md block, a local Claude
import and the existing project-specific .ai context.
Debubbler remains in preparation and was excluded from file changes.

## Acceptance Criteria

- Shared policy is editable only in portfolio-standards/PORTFOLIO.md; generated
  blocks match its version/hash across all five public repositories.
- Technical knowledge, numerical constraints and task states stay project-local.
- Workspace points to the actual website and public doctoral Git roots.
- Future cases can initialize minimal context through the explicit-target helper.
- No engineering artifacts or repository folders changed; no history was rewritten.

## Verification

- Synchronizer regression checks passed in independent temporary Git repositories:
  read-only Check/Preview, no-overwrite initialization, idempotency, tamper
  detection, all-target preflight, wrong/duplicate roots, revision drift/update,
  local-text preservation and staged-file protection.
- All five real targets pass Mode Check. 160 Markdown links/anchors in the
  migrated instruction set passed; all workspace/source locators exist.
- Five Git whitespace checks and PUMP publication-marker/artifact checks passed.
- Fresh ephemeral Codex session in PUMP recognized version 1.0.0 and local scope.
- Fresh Claude Code session in the public doctoral checkout recognized the
  import and excluded parent archive CURRENT from automatically loaded context.
- Both client probes were read-only and confirmed no commit/push authorization.
- No solver, notebook, numerical dataset, reference binary or media was changed.

## Files Modified

AGENTS.md, CLAUDE.md and the shared .ai context/procedures. Also README,
ADD_PROJECT and SOURCES for the shared standard and relocated source paths.

## Git and Publication

Pre-migration HEAD: f2032d92d9871f6b887842911f23b9e5ba1e0f73
The author subsequently requested local commits of the reviewed migration.
This record accompanies that commit; use Git history for its resulting SHA.
The standards repository is independent and has no remote. No push or remote
creation is authorized by this commit-only request.

## Known Limits / Next Use

Reload the updated workspace and start fresh sessions so clients do not retain
old context. Copilot settings and static integration are configured; its live
Chat Diagnostics UI was not accessible in this session and remains a client
acceptance check. Live probes covered PUMP (Codex) and public doctorate (Claude);
other targets passed the same static block/import/link checks.

For new cases, follow portfolio-standards/README.md. Do not initialize Debubbler
until the author requests portfolio onboarding and its evidence is ready.

## Remaining Work

None for the local implementation. Publication and the Copilot UI check are
explicit follow-ups; do not restart this completed migration.
