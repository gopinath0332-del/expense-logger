# Expense Logger — Antigravity Agent Rules

**Read `AGENTS.md` at the repo root before making any changes.**

## Validation

After every code change, run:
```
npm run build && npm run test:unit && npm run lint
```

All three must pass. Never skip this step.

## Stack Constraints

- Vue 3 Composition API only — `<script setup lang="ts">`. No Options API.
- No Tailwind CSS. Use Bootstrap 5 utilities and `<style scoped>`.
- TypeScript strict mode is on. All new code must be fully typed.
- Use `@/` import alias for all `src/` paths.

## Firebase Rules

- Always guard Firebase calls with `if (!db) throw new Error('Firebase is not initialized')`.
- Use `YYYY-MM-DD` string dates in Firestore — never native `Date` objects.
- Soft-delete categories/accounts by setting `isActive: false`. Never hard-delete.
- Bump `DEFAULT_CATEGORY_OPTIONS_VERSION` or `DEFAULT_ACCOUNT_OPTIONS_VERSION` when defaults change.

## UX Rules

- No `alert()` in new code — use in-app toast/snackbar feedback.
- Modal components follow the `:isVisible` + `@close` + `@select` pattern.

## Testing

- Unit tests live in `__tests__/` adjacent to the module they test.
- Use `@vue/test-utils` `mount()` for Vue component tests.
- E2E tests in `e2e/`; require `npx playwright install` first.
