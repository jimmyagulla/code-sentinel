# Create a new use case

1. Add input/output DTOs if needed under `src/application/dtos/`.
2. Add `src/application/use-cases/<Name>.ts` with `execute()` and constructor-injected **ports only**.
3. Register instance in `Container`.
4. Expose via `CommandRegistrar` or webview messages if user-facing.
5. Add `test/unit/application/<Name>.test.ts` with mocked ports.
6. Document in `docs/business/use-cases.md`.
