# Local project workflow

Use the [shared working procedure](../AGENTS.md#shared-working-procedure) for
start, implementation, handoff and finish. Only project-specific rules belong
here. Existing session authorization applies; an audit-only request forbids
memory edits as well as product changes.

## Scope and verification

This repository is the GitHub Pages website. Engineering source repositories are read-only for website tasks unless the user explicitly requests source edits. Preserve the existing HTML/CSS/JavaScript site, approved identity, URLs and asset provenance.

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


Follow ADD_PROJECT.md for source reuse and media/UI verification. SOURCES.md,
PROJECT_INVENTORY.md and ASSET_PROVENANCE.json retain the evidence map. Do not
run source publish/sync helpers or solvers for site maintenance. Check the actual
deployment selection; dot-prefixed files are not access control.
