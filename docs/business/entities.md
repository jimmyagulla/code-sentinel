# Domain entities

## Note

A structured annotation bound to a **line range** in a **source file**. Represents technical debt, warnings, improvements, bugs, or todos. Identified by a UUID. Carries **priority** (ordered), **type**, **scope**, **status**, **author** (from Git config at creation), and a **content anchor** (line range + content hash + snippet) so notes can be re-located after edits.

## FileHealth

Per-source-file validation state: **OK** (validated at a commit), **NEEDS_REVIEW** (must be re-checked), or **KO** (acknowledged problem). Stores `lastValidatedCommit` when status is OK so Git can detect subsequent changes.

## ContentAnchor

Binds a note to code: **line range**, **SHA-256 hash** of the text at that range, and a **snippet** for fuzzy recovery if lines shift.

## Priority / Type / Scope / Status

- **Priority**: Named levels with ordering (e.g. CRITICAL … INFO), configurable in `.codesentinel/config.json`.
- **Type / Scope / Status**: Enumerated strings from the same config; defaults include TECHNICAL_DEBT, IMPROVEMENT, PERFORMANCE, OPEN, etc.

## Author

`name` and `email` from local Git `user.name` / `user.email` when the note is created.
