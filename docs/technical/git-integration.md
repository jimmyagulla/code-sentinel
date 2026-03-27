# Git integration

- **Modified since commit**: `git log` scoped to file from `lastValidatedCommit`.
- **Renames**: `git diff --name-status --find-renames` between `lastReconcileCommit` and HEAD; storage moves JSON and updates `filePath` inside.
- **Missing commit** (rebase/amend): `commitExists` false → file status falls back to NEEDS_REVIEW via `ValidateFileStatus`.
- **Shallow clone**: detected; conservative behavior may treat files as modified.
- **Caches**: current commit ~5s; `ls-files` list ~30s (see `GitAdapter`).
