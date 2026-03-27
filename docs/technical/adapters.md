# Adapters

| Adapter | Port | Responsibility |
|---------|------|----------------|
| `JsonFileStorageAdapter` | `StoragePort` | Read/write `.codesentinel/config.json` and per-file note JSON; atomic writes; relocate on rename |
| `GitAdapter` | `ScmPort` | `simple-git`: HEAD, file history, rename detection, tracked files, shallow clone, commit exists |
| `NodeFileSystemAdapter` | `FileSystemPort` | `fs/promises`, recursive list, atomic write |
| `VscodeConfigAdapter` | `ConfigPort` | `vscode.workspace.getConfiguration('codesentinel')` |
| `VscodeNotificationAdapter` | `NotificationPort` | VS Code notifications |
| `Sha256HashAdapter` | `HashPort` | SHA-256 hex with `sha256:` prefix for anchors |
