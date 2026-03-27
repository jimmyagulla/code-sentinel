# Layer rules

## Domain

- **Must not** import `vscode`, `fs`, `simple-git`, or adapters.
- **May** import only other `src/domain/**` modules.

## Application

- **Must not** import concrete adapters or `vscode`.
- **May** import `src/domain/**`, define ports in `application/ports/`, and DTOs in `application/dtos/` (including persisted JSON shapes such as `FileNoteData`).

## Adapters

- **Must** implement a port from `application/ports/`.
- **Must not** import other adapters or `src/ui/`.
- **May** import Node / `simple-git` / `vscode` as needed for that adapter.

## UI

- **May** import `vscode`, use cases, DTOs, domain **types**.
- **Must not** import `src/adapters/**` directly.

## Infrastructure

- **Composition root**: only place that constructs concrete adapters and injects them into use cases.
