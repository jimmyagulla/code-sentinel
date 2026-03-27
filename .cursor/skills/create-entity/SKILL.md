# Create a domain entity or value object

1. Choose **entity** (identity) vs **value object** (no identity).
2. Place under `src/domain/entities/` or `src/domain/value-objects/`.
3. No external imports; use `DomainError` for invalid invariants.
4. Add tests under `test/unit/domain/`.
5. Update `docs/business/entities.md`.
