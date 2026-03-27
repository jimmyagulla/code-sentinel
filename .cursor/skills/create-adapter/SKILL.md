# Create a new adapter

1. Identify or add a **port** in `src/application/ports/`.
2. Add `src/adapters/<area>/<Name>Adapter.ts` implementing the port.
3. Wire in `src/infrastructure/di/Container.ts`.
4. Add unit tests under `test/unit/adapters/`.
5. Update `docs/technical/adapters.md`.

Do not import other adapters or `src/ui/`.
