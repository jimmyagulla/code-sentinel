# Project structure

| Path | Role |
|------|------|
| `src/domain/` | Entities, value objects, domain services |
| `src/application/dtos/` | DTOs for UI and persistence shapes (`NoteDto`, `FileNoteData`, `ProjectConfigDto`, …) |
| `src/application/ports/` | StoragePort, ScmPort, FileSystemPort, ConfigPort, NotificationPort, HashPort |
| `src/application/config/` | Default project policy (e.g. `createDefaultProjectConfig`, `defaultInitialNoteStatus`) |
| `src/constants/` | Shared literals (e.g. `UNKNOWN_PRIORITY_ORDINAL`, `DEFAULT_STORAGE_RELATIVE_PATH`, `FILE_NOTE_DATA_VERSION`) |
| `src/application/use-cases/` | CreateNote, ListNotes, ReconcileWorkspace, SetupWorkspace, … |
| `src/adapters/` | Implementations of ports |
| `src/infrastructure/di/Container.ts` | Wires adapters and use cases |
| `src/ui/` | VS Code UI: commands, webview React app, hover, decorations |
| `src/extension.ts` | Activation entry |
| `dist/extension.js` | Bundled extension |
| `dist/webview/index.js` | Bundled React webview |
| `test/unit/` | Vitest unit tests |
