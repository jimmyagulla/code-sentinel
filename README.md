# CodeSentinel

VS Code / Cursor extension for **structured code notes** and **file health status**, with **Git-versioned** JSON storage under `.codesentinel/` (configurable).

## Features (MVP)

- Create notes on selected lines (priority, type, scope) — command palette
- Overview ruler markers by priority; hover shows note details
- Sidebar webview: list, filter, sort, click to navigate
- Per-file status: `OK` / `NEEDS_REVIEW` / `KO` with Git-based validation
- Reconciliation: re-anchor notes on save, workspace reconcile on open

## Architecture

Clean / Hexagonal architecture with **Dependency Inversion**: domain → application (ports) → adapters → UI. Full diagrams and rules live in the `docs/` folder in the repository.

## Development

```bash
pnpm install
pnpm run build
pnpm test
pnpm lint
```

Press F5 in VS Code (see `.vscode/launch.json`) to launch the **Extension Development Host**.

## Storage

- `.codesentinel/config.json` — team-shared priorities, types, scopes, statuses
- `.codesentinel/notes/<path-to-source>.json` — notes + file status per source file

Run **CodeSentinel: Initialize Workspace** to create folders and optionally add `.codesentinel/` to `.gitignore`.

## Commands

| Command | Description |
|--------|-------------|
| CodeSentinel: Create Note | Create a note on current selection |
| CodeSentinel: Delete Note | Delete by note ID |
| CodeSentinel: Mark File OK / KO / Needs Review | Set file health |
| CodeSentinel: Open Notes Panel | Focus sidebar view |
| CodeSentinel: Refresh / Reconcile | Full workspace reconcile |
| CodeSentinel: Initialize Workspace | First-time setup |

## Known limitations (MVP)

- **Comment API**: `SentinelCommentController` is a stub; note authoring uses the **Create Note** command (QuickPick / input), not inline comment threads.
- **Multi-root workspaces**: only the **first** workspace folder is used (architecture is ready to extend).

## License

See [LICENSE](LICENSE).
