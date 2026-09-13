# Engineering case narratives

Status: COMPLETE
Last Agent: Codex
Date: 2026-09-13

Objective: connect demonstrations to their actual professional problems, contributions and outcomes while retaining scientific scope. Debubbler -> P28; H2 -> P7/P8; throttle -> P10; pump -> P21/P22/P23. Academic and residential studies retain their own context. Shorten H2 hero caption and reduce visible implementation detail.

Changed all seven case introductions and three homepage descriptions. The source-to-story map is saved in CASE_STORY_MAP.json. No numerical data/media changed.

Checks: 32 responsive route/width combinations passed, plus seven context sections at doubled text size. H2 disclosures work without JavaScript; its figure dialog opens and closes with Escape. Desktop/mobile screenshots inspected. See STORY_UI_VERIFICATION.json and VERIFICATION.md.

Publication: content commit f3b2de62096d377267edcc0cafa33a9f476ae743 pushed to origin/main; remote SHA matched. Home, all seven case pages and case-story.css match the reviewed local files on the production domain (line endings normalized). All affected routes returned HTTP 200. Pages reports a successful build, although its latest-build metadata still names the preceding documentation commit; live content was checked directly.

No remaining task steps. Unrelated untracked Fluent artifacts were preserved and were not published. Future cases should follow CASE_STORY_MAP.json and ADD_PROJECT.md.
