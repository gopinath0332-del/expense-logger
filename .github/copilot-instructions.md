# Expense Logger — GitHub Copilot Instructions

Expense Logger is a **mobile-first Vue 3 + TypeScript + Firebase Firestore** single-page app for personal finance tracking.

**ALWAYS reference this file first. Fall back to shell commands or search only for unexpected information not described here.**

See also `AGENTS.md` at the repo root for the full authoritative context.

---

## Quick Commands

| Command | Purpose | Duration |
|---------|---------|---------|
| `npm install` | Install all dependencies | ~15 s |
| `npm run dev` | Vite dev server on http://localhost:5173/ | live |
| `npm run type-check` | TypeScript type check | ~3 s |
| `npm run build` | Production build (type-check + vite in parallel) | ~4 s |
| `npm run test:unit` | Vitest unit tests | ~2 s |
| `npm run lint` | ESLint with auto-fix | ~2 s |
| `npm run format` | Prettier over `src/` | ~1 s |
| `npm run test:e2e` | Playwright E2E (browsers must be installed) | varies |

**Node.js:** `^20.19.0 || >=22.12.0`

**After every change:** `npm run build && npm run test:unit && npm run lint`

---

## Validation Steps

1. `npm run build` — catches TypeScript and bundling errors
2. `npm run test:unit` — unit tests
3. `npm run lint` — linting
4. Dev server: `npm run dev` → http://localhost:5173/
5. Production preview: `npm run build && npm run preview` → http://localhost:4173/

**Never cancel a build or test — all complete in under 30 s.**

---

## Project Structure

```
src/
├── main.ts                    # Entry point
├── App.vue                    # Minimal router-view root
├── router/index.ts            # Routes: /, /dashboard, /add-transaction
├── views/
│   ├── DashboardView.vue      # Main dashboard (composes dashboard/* components)
│   └── AddTransactionView.vue # Add income/expense/transfer form (lazy-loaded)
├── components/
│   ├── dashboard/             # DashboardHeader, DateNav, Tabs, Summary,
│   │                          # TransactionList, TransactionDayGroup, TransactionItem,
│   │                          # FloatingActionButton, BottomNavigation
│   ├── CategorySelector.vue   # Full-screen modal — category + subcategory picker
│   └── AccountSelector.vue    # Full-screen modal — account/payment method picker
├── composables/
│   ├── useTransactionData.ts  # Transaction loading, caching, fallback to sample data
│   └── useFormatting.ts       # formatCurrency / formatNumber / formatMonthYear
├── firebase/
│   ├── config.ts              # Firebase init; isFirebaseConfigured(); useSampleData()
│   ├── index.ts               # Re-exports: fetchAccountOptions, fetchCategoryOptions
│   ├── transactions.ts        # CRUD: fetchTransactions, fetchTransactionsByMonth,
│   │                          #       addTransaction, updateTransaction, deleteTransaction
│   ├── categories.ts          # CRUD + auto-sync for categories collection
│   ├── accounts.ts            # CRUD + auto-sync for accounts collection
│   └── database.ts            # Firestore db export
├── services/
│   └── transactionCache.ts    # In-memory month-keyed cache; pre-fetches adjacent months
└── types/
    ├── transaction.ts         # Transaction, TransactionDay, DashboardSummary, TabConfig, NavItem
    ├── category.ts            # Category, CategoryOption, defaults, helper functions
    └── account.ts             # Account, AccountOption, defaults
```

---

## Key Technologies

- **Vite** — build tool and dev server
- **Vue 3** — Composition API with `<script setup lang="ts">` everywhere
- **TypeScript** — full type safety
- **Vue Router** — `createWebHistory`; `@/` alias maps to `src/`
- **Pinia** — installed; not yet used for transaction state (composables own reactivity)
- **Firebase 12** — Firestore for data; no Auth yet
- **Bootstrap 5 + Bootstrap Icons** — UI framework; no Tailwind
- **Vitest** — unit tests with jsdom
- **Playwright** — E2E on Chromium, Firefox, WebKit

---

## Routes

| Path | Name | Component |
|------|------|-----------|
| `/` | `home` | `DashboardView` |
| `/dashboard` | `dashboard` | `DashboardView` |
| `/add-transaction` | `addTransaction` | `AddTransactionView` (lazy) |

---

## Data Models

### Transaction (`transactions` collection)
```ts
{
  id: number            // derived at read time from doc.id
  type: 'income' | 'expense' | 'transfer'
  date: string          // YYYY-MM-DD
  category: string      // category ID e.g. 'food'
  subcategory?: string  // subcategory ID e.g. 'restaurant'
  account: string       // account ID e.g. 'upi'
  description: string
  note?: string
  amount: number        // always positive; type carries sign semantics
}
```

Legacy docs may have `paymentMethod` instead of `account` — both are handled in `transactions.ts`.

### Category (`categories` collection)
```ts
{ id, label, subcategories?: [{id, label}], isActive?, createdAt?, updatedAt? }
```

### Account (`accounts` collection)
```ts
{ id, label, icon: 'bi bi-*', isActive?, createdAt?, updatedAt? }
```

---

## Firebase / Environment

Copy `.env.example` to `.env.local` and fill in:
```
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
VITE_USE_SAMPLE_DATA=false   # 'true' bypasses Firebase entirely
```

If credentials are missing or `VITE_USE_SAMPLE_DATA=true`, app uses hardcoded sample data silently.

---

## Coding Conventions

1. **Composition API only** — `<script setup lang="ts">` in all `.vue` files; never Options API.
2. **Import alias** — always `@/` prefix for `src/` (e.g. `@/types/transaction`).
3. **Date strings** — `YYYY-MM-DD` for Firestore; never native `Date` objects.
4. **Amount** — always positive `number`; `type` field carries sign.
5. **IDs** — kebab-case strings for category/account IDs.
6. **Soft delete** — set `isActive: false`; never hard-delete categories or accounts.
7. **Version bump** — increment `DEFAULT_CATEGORY_OPTIONS_VERSION` / `DEFAULT_ACCOUNT_OPTIONS_VERSION`
   when defaults change to trigger auto-sync on next load.
8. **No `alert()`** — use in-app toast/snackbar for new UX feedback.
9. **Styling** — `<style scoped>` per component; Bootstrap utilities globally; no Tailwind.
10. **Tests** — add unit tests in `__tests__/` alongside the module under test.

---

## Common Tasks

### Add a new component
1. Create `src/components/<name>.vue` with `<script setup lang="ts">` and `<style scoped>`.
2. Add unit test in `src/components/__tests__/<name>.spec.ts`.

### Add a new route
1. Create view in `src/views/`.
2. Register in `src/router/index.ts`.

### Add a new Firestore collection
1. Define types in `src/types/`.
2. Add CRUD functions in `src/firebase/<collection>.ts`.
3. Export via `src/firebase/index.ts` if needed.

### Add a Pinia store
1. Create `src/stores/<name>.ts` using Composition API style:
   ```ts
   export const useMyStore = defineStore('name', () => { ... })
   ```

---

## Known TODOs

- Bottom navigation routing is not implemented (only console logs).
- Dashboard Calendar/Monthly/Summary/Description tabs are UI-only stubs.
- AddTransactionView "Repeat" and camera buttons are UI stubs.
- Firebase Authentication is not yet integrated.
- `Transaction.id` should use `doc.id` (string) instead of fragile numeric derivation.

---

## Configuration Reference

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build config |
| `tsconfig.json` | TypeScript root config (references app + node configs) |
| `tsconfig.app.json` | App TypeScript config |
| `vitest.config.ts` | Vitest unit test config |
| `playwright.config.ts` | Playwright E2E config |
| `eslint.config.ts` | ESLint rules (Vue, TS, Vitest, Playwright) |
| `.prettierrc.json` | Prettier formatting rules |
| `.editorconfig` | Editor whitespace/indent settings |
| `firestore.indexes.json` | Composite Firestore indexes |

### Development URLs
- Dev: http://localhost:5173/
- Production preview: http://localhost:4173/
- Vue DevTools: http://localhost:5173/__devtools__/

### IDE
Recommended: VSCode + **Volar** extension (not Vetur).
Extensions configured in `.vscode/extensions.json`.