# Use cases

| Use case | Trigger | Purpose |
|----------|---------|---------|
| **CreateNote** | Command: create note on selection | Validates config, builds anchor, persists per-file JSON |
| **UpdateNote** | Future: edit metadata | Updates fields; re-validates against config |
| **DeleteNote** | Command: delete by ID | Removes note; deletes JSON file if empty |
| **ListNotes** | Webview load, decorations | Loads all note files, optional filters/sort |
| **MarkFileStatus** | Commands: mark OK/KO/NEEDS_REVIEW | Sets `fileStatus`; **OK** stores current HEAD |
| **ValidateFileStatus** | Reconcile / after OK | If OK and file changed since commit, or commit missing → NEEDS_REVIEW |
| **ReconcileWorkspace** | Refresh command, activation | Renames (Git), re-anchors all notes, validates statuses, orphan cleanup |
| **ReconcileFile** | Document save | Re-anchors notes for one file; runs validation |

Inputs/outputs are DTOs in `src/application/dtos/`. Use cases depend only on **ports** (Storage, Scm, FileSystem, Hash, Config).
