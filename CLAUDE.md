# Claude Code entry point

Claude Code and Codex share the same `.ai/` memory and take turns in this working tree.
The repository, current Git state, applicable tests/build results and shared memory
are the source of truth; conversation history is not required.

Start with [current task](.ai/tasks/CURRENT.md) and inspect Git status and relevant
staged/unstaged/untracked work. Read [project](.ai/PROJECT.md),
[decisions](.ai/DECISIONS.md) and [workflow](.ai/WORKFLOW.md) for the task.
For content work, use [sources](.ai/SOURCES.md) and the compact
[project inventory](.ai/PROJECT_INVENTORY.md) before opening source repositories.
For a new case study, follow [the project playbook](.ai/ADD_PROJECT.md).

Only this portfolio repository is normally writable. Engineering repositories
are read-only; verify remote freshness before using their content. Preserve
existing work. Do not automatically pull, merge, rebase, reset or clean.
Do not commit or push unless explicitly requested. Do not publish unreviewed
sensitive content or local paths. Follow `.ai/workflows/` and save a self-contained
handoff in `CURRENT.md` before yielding. Keep durable knowledge in `.ai/`.
