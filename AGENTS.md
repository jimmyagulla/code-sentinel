# AGENTS.md — CodeSentinel

## Product

VS Code extension: structured notes on code lines, file health (OK / NEEDS_REVIEW / KO), Git-versioned JSON under `.codesentinel/`.

## Architecture (mandatory)

- **DIP**: depend on ports (`src/application/ports/`), not concrete adapters.
- **Domain** has zero framework/Node I/O imports.
- **Application** use cases orchestrate domain + ports only.
- **Adapters** implement ports; **Container** wires everything.
- **UI** uses use cases from `Container` only.

## Before changing code

- Read `.cursor/rules/*.mdc` and relevant `docs/technical/`.
- Run `pnpm test` and `pnpm lint` after edits.

## Documentation

- Business: `docs/business/`
- Technical: `docs/technical/`
