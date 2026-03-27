# How it works

1. **First run**: Run **Initialize Workspace** to create `.codesentinel/` and optionally gitignore it.
2. **Create note**: Select lines → **Create Note** → content, priority, type, scope → JSON under `.codesentinel/notes/...`.
3. **Display**: Overview ruler marks by priority; hover shows details; sidebar lists all notes.
4. **Save file**: Reconcile **re-anchors** notes (hash + fuzzy); if anchor **lost**, note is **removed**.
5. **Workspace open**: Optional full **reconcile** (rename detection, validation, orphan cleanup).
6. **File status**: Mark **OK** at current HEAD; later Git detects changes → **NEEDS_REVIEW** (automatic).

## Team workflow

Commit `.codesentinel/` to share notes. Merge conflicts in JSON are resolved like normal text (per-source-file JSON reduces conflicts).
