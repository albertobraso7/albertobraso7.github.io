# Shared Codex and Claude Workflow

## Source of truth and ownership

Use actual repository files, current Git evidence, applicable tests/build and
the shared `.ai/` memory. When notes disagree with evidence, investigate the
specific discrepancy and correct portfolio memory; do not alter source repos.
Both agents follow this workflow. Only one writes the working tree at a time.
Use task/feature branches when needed, never new branches merely to change agent.

| Need | Read or update |
| --- | --- |
| Site purpose, architecture, commands | [PROJECT.md](PROJECT.md) |
| Source locations, sync snapshot, provenance/rights pointers | [SOURCES.md](SOURCES.md) |
| Initial project selection map | [PROJECT_INVENTORY.md](PROJECT_INVENTORY.md) |
| Add an engineering case study | [ADD_PROJECT.md](ADD_PROJECT.md) |
| Lasting decisions and rationale | [DECISIONS.md](DECISIONS.md) |
| Active objective, progress, evidence, next action | [CURRENT.md](tasks/CURRENT.md) |
| Begin/resume | [START_TASK.md](workflows/START_TASK.md) |
| Pause or transfer | [HANDOFF.md](workflows/HANDOFF.md) |
| Verify and finish | [FINISH_TASK.md](workflows/FINISH_TASK.md) |

## Git inspection and synchronization classification

For every repository involved in the task, work from its verified root:

```text
git rev-parse --show-toplevel
git branch --show-current
git status --short --branch --untracked-files=all
git remote -v
git for-each-ref --format="%(refname:short)|%(upstream:short)|%(upstream:track)" refs/heads
git log -5 --date=iso-strict --format="%h %ad %s"
git diff --stat
git diff --cached --stat
git fetch --all --no-recurse-submodules
git rev-parse HEAD "@{upstream}"
git rev-list --left-right --count "HEAD...@{upstream}"
```

Quote `@{upstream}` expressions in PowerShell. Inspect relevant full diffs and
untracked files separately; never assume untracked work appears in `git diff`.
Do not echo credential-bearing remote URLs into memory; redact secrets if found.
Fetch is the allowed synchronization check, not an instruction to integrate.
Do not run automatic pull, merge, rebase, reset, clean, force operations, stash,
or checkout that could discard work. Never overwrite or discard local work.

| Evidence | Classification |
| --- | --- |
| Successful fetch, ahead 0 / behind 0 | UP TO DATE |
| Successful fetch, ahead 0 / behind >0 | LOCAL BEHIND REMOTE |
| Successful fetch, ahead >0 / behind 0 | LOCAL AHEAD OF REMOTE |
| Successful fetch, ahead >0 / behind >0 | DIVERGED |
| Any staged, unstaged or untracked changes | UNCOMMITTED LOCAL CHANGES, recorded alongside sync classification |
| No remote, missing upstream/HEAD, unavailable network or failed fetch | NO REMOTE / UNKNOWN; explain reason and label cached comparisons unverified |

If an upstream is missing, inspect available remote refs, but do not set tracking
or invent an upstream. Record the exact compared refs and any uncertainty.
If behind, read a verified remote file with `git show <sha>:<path>`; record the
SHA used. Ahead-only/uncommitted changes are not silently substituted for remote
content. Do not repeatedly fetch every source for an unrelated CSS or memory edit.

Network sandboxing or Git ownership checks may require environment approval.
For a known workspace checkout whose ownership mismatch is understood, a
command-scoped `git -c safe.directory=<verified-repo-path> ...` avoids global
configuration changes. Never use a wildcard trust exception or change ownership.
If access remains unavailable, finish independent work and record the limitation.

## Context efficiency

1. Read CURRENT and the relevant shared files first; reuse existing findings.
2. For engineering content, use SOURCES, then the selected project's
   `docs/portfolio_case.md`; if absent, README; then targeted supporting docs.
3. Read a raw CFD result only to answer a specific unresolved question. Prefer
   an existing provenance/asset manifest to rediscovering files.
4. Use `rg`, `git ls-files`, `git ls-tree` and bounded reads. Do not recursively
   scan huge case/data/result folders or reopen binary media without a reason.
5. Store durable site knowledge in PROJECT, source findings in SOURCES, material
   decisions in DECISIONS and temporary state in CURRENT. Consolidate outdated
   entries instead of appending a chronological transcript or copying READMEs.
6. Run checks appropriate to changed files; do not run solvers or install
   dependencies for a documentation-only task. Repeat checks only after relevant
   edits, failures or new evidence. Report skipped checks honestly.

## Scope and publication boundary

Complete routine reversible work within the user's request autonomously.
Only the portfolio is writable unless source modification is explicitly requested.
Preserve pre-existing changes and staging. No commits or pushes without an
explicit request. A handoff does not authorize committing, syncing or publishing.

Before copying material into public website files, review the selected text and
assets for confidential company information, client identities,
patient-identifiable information, private residential details, proprietary CAD,
credentials/API tokens, local machine paths, restricted datasets and uncertain
third-party copyright. Flag uncertain items in the source register instead of
publishing them. Do not store the sensitive values themselves in shared memory.
No Fluent/GPU jobs, raw case downloads or source publish/sync helpers for website work.

`.ai/` and the entry points are development documentation. They may themselves
become visible in a public Git repository; never treat their dot-prefix as
access control. Keep workspace locators out of public website content and check
actual deployment-file selection before a future publication.

## Task lifecycle

Use `IN_PROGRESS`, `HANDOFF`, `BLOCKED` or `COMPLETE` truthfully, with `Last Agent`.
Use `IDLE` only when there is no active task or completion snapshot to retain.
Resume unfinished work rather than overwriting it. A new objective may replace
the last completed task body, retaining its useful headings and moving durable
facts to their proper files. Do not turn CURRENT into a growing task archive.
Leave a self-contained next step, branch/HEAD, file list, checks and known issues
before yielding. Separate completion of the current task from future readiness.
