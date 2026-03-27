# Storage

- **Root**: `<workspace>/.codesentinel/` (relative path configurable via `codesentinel.storagePath`).
- **Config**: `config.json` — priorities, types, scopes, statuses, `fileStatusDefaults`, optional `lastReconcileCommit`. Default contents are defined in application (`src/application/config/defaultProjectConfig.ts`), not in the storage adapter.
- **Notes**: `notes/<relative-path-to-source>.json` — one file per annotated source file; contains `fileStatus` + `notes[]`.
- **Writes**: temp file + rename for atomicity.
- **Version fields**: `version` on config and per-note-file documents for future migrations.
