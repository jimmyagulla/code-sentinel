---
name: commit
description: Generate professional Conventional Commits messages from staged files, create the commit, and push. Use when the user types /commit.
disable-model-invocation: true
---

# Commit Command

Generate a standardized commit message from staged changes, commit, and push.

## Workflow

1. **Retrieve staged files**:
   - `git diff --cached --name-status` for file list
   - `git diff --cached` for detailed changes

2. **Analyze changes** to determine:
   - Commit type, scope, and impact
   - Read modified files for context

3. **Generate message** in Conventional Commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

4. **Commit**: `git commit -m "message"` (**never** add `--no-verify`)
5. **Push**: `git push`

## Commit Types

| Type       | When                                    |
| ---------- | --------------------------------------- |
| `feat`     | New functionality                       |
| `fix`      | Bug fix                                 |
| `refactor` | Code restructuring (no behavior change) |
| `ui`       | Visual/interface changes                |
| `docs`     | Documentation only                      |
| `perf`     | Performance improvement                 |
| `test`     | Adding/modifying tests                  |
| `chore`    | Build, dependencies, config             |

## Scope Detection

Derive scope from file paths:

- `src/features/blocks/` → `blocks`
- `src/features/training/` → `training`
- `src/services/` → `api`
- `src/components/ui/` → `ui`
- Config files → `config`

## Subject Rules

- Lowercase, imperative mood
- Max 50 chars ideal, 72 max
- No trailing period

## Body Rules

Add body when:

- Change needs explanation
- Important technical details
- Breaking changes
- Subject alone is not clear enough

Max 72 chars per line.

## Examples

```
feat(blocks): add undated blocks section in timeline
```

```
fix(blocks): fix detail panel display when no blocks exist

BlockDetailPanel stayed open with no blocks. Added condition
to only show when blocksDetails.length > 0.
```

```
refactor(ui): improve empty state in blocks-page-template
```

## Error Handling

- No staged files → warn user, suggest `git add`
- Ambiguous type → ask user for confirmation
- Push failure → show error, suggest actions
- No remote configured → inform user

**Important:** Do not bypass Git hooks. The command **must never** use `--no-verify` or any option that skips pre-commit, commit-msg, or other verification hooks.
