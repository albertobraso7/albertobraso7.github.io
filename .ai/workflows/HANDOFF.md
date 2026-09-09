# Handoff or Pause

1. Stop at a coherent point and inspect actual status, relevant staged/unstaged
   diffs and untracked files. Keep source repositories read-only.
2. Persist durable discoveries in the appropriate [shared files](../WORKFLOW.md).
   Do not duplicate a conversation transcript or re-copy source documentation.
3. Set [CURRENT](../tasks/CURRENT.md) to `HANDOFF`, or `BLOCKED` with the exact
   unresolved dependency. Record `Last Agent`, branch, HEAD, compared remote SHA,
   objective/criteria, completed and remaining work, modified files, checks and
   outcomes, known issues, important task choices and the next concrete action.
4. Identify pre-existing edits separately from your changes. State what was not
   tested and why. Note any source freshness, availability or rights uncertainty.
5. The receiving agent needs the actual working-tree files, including untracked
   memory, not just a branch name or this conversation. Do not commit/push or send
   files automatically. Save the handoff and stop writing before the other agent resumes.
