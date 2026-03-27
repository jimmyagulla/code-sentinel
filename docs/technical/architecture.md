# Architecture

CodeSentinel uses **Clean / Hexagonal** architecture with **Dependency Inversion**:

- **Domain** (`src/domain/`): entities, value objects, pure services (`LineAnchorService`, `FileStatusTransitionService`). No Node, VS Code, or I/O imports.
- **Application** (`src/application/`): use cases, **port** interfaces, DTOs, factories.
- **Adapters** (`src/adapters/`): `JsonFileStorageAdapter`, `GitAdapter`, `NodeFileSystemAdapter`, `VscodeConfigAdapter`, `VscodeNotificationAdapter`, `Sha256HashAdapter`.
- **Infrastructure** (`src/infrastructure/`): DI `Container`, logging.
- **UI** (`src/ui/`): commands, webview, hover, decorations — uses use cases only, not concrete adapters.

Dependency direction: **inward** only. UI and adapters depend on application ports; domain depends on nothing external.
