# Expense Logger — AI Agent Context

> Read this file **first** before touching any code. It describes the current, accurate state of the project.

---

## 1. What This App Is

**Expense Logger** is a mobile-first, single-page Vue 3 + TypeScript + Firebase progressive web app for personal finance tracking.
Stack: **Vite · Vue 3 (Composition API) · Pinia · Vue Router · Firebase Firestore · Bootstrap 5 · Bootstrap Icons**.

Dev server: `http://localhost:5173/`
Production preview: `http://localhost:4173/`

---

## 2. Quick Commands

| Goal | Command | Notes |
|------|---------|-------|
| Install deps | `npm install` | ~15 s |
| Start dev | `npm run dev` | Vite HMR on :5173 |
| Type-check | `npm run type-check` | `vue-tsc --build`, ~3 s |
| Production build | `npm run build` | type-check + vite build in parallel |
| Unit tests | `npm run test:unit` | Vitest + jsdom, ~2 s |
| Lint (auto-fix) | `npm run lint` | ESLint |
| Format | `npm run format` | Prettier over `src/` |
| E2E tests | `npm run test:e2e` | Playwright; install browsers first |

**Node requirement:** `^20.19.0 || >=22.12.0`

**Always run `npm run build && npm run test:unit && npm run lint` after making changes.**

---

## 3. Project Structure

```
expense-logger/
├── src/
│   ├── main.ts                    # App entry point
│   ├── App.vue                    # Root component (minimal router-view wrapper)
│   ├── router/
│   │   └── index.ts               # Routes: / -> dashboard, /dashboard, /add-transaction
│   ├── views/
│   │   ├── DashboardView.vue      # Main dashboard; composes all dashboard/* components
│   │   └── AddTransactionView.vue # Form to add income/expense/transfer
│   ├── components/
│   │   ├── dashboard/             # 9 sub-components used by DashboardView
│   │   │   ├── DashboardHeader.vue
│   │   │   ├── DashboardDateNav.vue
│   │   │   ├── DashboardTabs.vue
│   │   │   ├── DashboardSummary.vue
│   │   │   ├── TransactionList.vue
│   │   │   ├── TransactionDayGroup.vue
│   │   │   ├── TransactionItem.vue
│   │   │   ├── FloatingActionButton.vue
│   │   │   └── BottomNavigation.vue
│   │   ├── CategorySelector.vue   # Full-screen modal: pick category + subcategory
│   │   └── AccountSelector.vue    # Full-screen modal: pick payment account
│   ├── composables/
│   │   ├── useTransactionData.ts  # Loads transactions from Firebase or sample data; caches by month
│   │   └── useFormatting.ts       # formatCurrency, formatNumber, formatMonthYear helpers
│   ├── firebase/
│   │   ├── config.ts              # Firebase init; exports app, db, isFirebaseConfigured(), useSampleData()
│   │   ├── index.ts               # Re-exports fetchAccountOptions, fetchCategoryOptions
│   │   ├── transactions.ts        # CRUD for `transactions` Firestore collection
│   │   ├── categories.ts          # CRUD + auto-sync for `categories` collection
│   │   ├── accounts.ts            # CRUD + auto-sync for `accounts` collection
│   │   └── database.ts            # Firestore database reference helper
│   ├── services/
│   │   └── transactionCache.ts    # In-memory month-keyed cache for transactions
│   └── types/
│       ├── transaction.ts         # Transaction, TransactionDay, DashboardSummary, TabConfig, NavItem
│       ├── category.ts            # Category, CategoryOption, DEFAULT_CATEGORY_OPTIONS + helpers
│       └── account.ts             # Account, AccountOption, DEFAULT_ACCOUNT_OPTIONS
├── e2e/                           # Playwright end-to-end tests
├── .github/
│   ├── copilot-instructions.md    # GitHub Copilot-specific context
│   └── workflows/                 # CI/CD workflows
├── .env.example                   # Template for environment variables
├── firestore.indexes.json         # Composite Firestore indexes
└── dist/                          # Build output (git-ignored)
```

---

## 4. Routes

| Path | Name | Component | Notes |
|------|------|-----------|-------|
| `/` | `home` | `DashboardView` | Same as dashboard |
| `/dashboard` | `dashboard` | `DashboardView` | Main view |
| `/add-transaction` | `addTransaction` | `AddTransactionView` | Lazy-loaded |

---

## 5. Data Models

### Transaction (Firestore collection: `transactions`)
```ts
interface Transaction {
  id: number            // Derived from doc ID at read time
  type: 'income' | 'expense' | 'transfer'
  date: string          // YYYY-MM-DD
  category: string      // Category ID e.g. 'food'
  subcategory?: string  // Subcategory ID e.g. 'restaurant'
  account: string       // Account ID e.g. 'upi'
  description: string
  note?: string
  amount: number        // Positive float; type field carries the sign
}
```

> **Legacy note:** Old Firestore documents may use `paymentMethod` instead of `account`.
> `transactions.ts` transparently maps both fields.

### Category (Firestore collection: `categories`)
```ts
interface Category {
  id: string
  label: string
  subcategories?: { id: string; label: string }[]
  isActive?: boolean    // false = soft-deleted
  createdAt?: Date
  updatedAt?: Date
}
```

### Account (Firestore collection: `accounts`)
```ts
interface Account {
  id: string
  label: string
  icon: string          // Bootstrap Icons class e.g. 'bi bi-cash'
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}
```

### Meta collection: `meta`
- Document `category_options_version` — tracks `DEFAULT_CATEGORY_OPTIONS_VERSION` for auto-sync.
- Document `account_options_version` — tracks `DEFAULT_ACCOUNT_OPTIONS_VERSION` for auto-sync.

---

## 6. Firebase / Data Layer

### Environment Variables (copy `.env.example` to `.env.local`)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_SAMPLE_DATA=false   # set to 'true' to bypass Firebase entirely
```

### Fallback Mode
If any Firebase env var is absent **or** `VITE_USE_SAMPLE_DATA=true`, the app silently uses
hardcoded sample data defined inside `useTransactionData.ts`. No errors are thrown.

### Caching
`transactionCache.ts` is an in-memory cache keyed by `year-month`. After fetching a month,
adjacent months are pre-fetched in the background without blocking. Cache is reset on page reload.

### Auto-Sync
When `AddTransactionView` loads, it calls `syncDefaultCategoryOptions()` and the equivalent
for accounts. This reconciles Firestore with the defaults defined in `types/category.ts` and
`types/account.ts`: new defaults are added, removed defaults are soft-deleted (`isActive: false`),
and user-added custom entries are preserved. The version string controls when a sync runs.

---

## 7. Component Patterns

### Always use Composition API with `<script setup lang="ts">`
Never use Options API.

### Props / Emits — use TypeScript generic form
```ts
const props = defineProps<{ isVisible: boolean; selectedCategory: string }>()
const emit = defineEmits<{ close: []; select: [category: CategoryOption] }>()
```

### Styling
- Global: Bootstrap 5 utility classes + `src/assets/main.css`
- Per-component: `<style scoped>` only
- Primary brand color: `#dc3545` (Bootstrap danger red)
- Background: `#f8f9fa`, card surfaces: `white`
- **Never use Tailwind CSS.**

### Modal Pattern
`CategorySelector.vue` and `AccountSelector.vue` are full-screen overlay modals.
They accept `:isVisible` prop and emit `@close` / `@select`. Follow this pattern for any new modal.

---

## 8. State Management

Pinia is installed but not yet used for transaction state — composables own reactivity directly.
If a new feature requires shared cross-component state, create a Pinia store in `src/stores/`
using the Composition API style: `defineStore('name', () => { ... })`.

---

## 9. Testing

### Unit Tests (Vitest)
- Location: `src/components/__tests__/` and `src/services/__tests__/`
- Pattern: `mount(Component, { props: {...} })` from `@vue/test-utils`
- Run: `npm run test:unit`

### E2E Tests (Playwright)
- Location: `e2e/`
- Targets Chromium, Firefox, WebKit
- First-time setup: `npx playwright install`
- Requires a production build: `npm run build` before running

---

## 10. Conventions

1. **Import alias** — always `@/` for `src/` (e.g. `import type { Transaction } from '@/types/transaction'`).
2. **Date format** — always `YYYY-MM-DD` strings; never native `Date` objects in Firestore.
3. **Amount** — always a positive `number`; the `type` field carries the sign semantics.
4. **IDs** — kebab-case strings for category and account IDs (e.g. `'fast-food'`, `'credit-card'`).
5. **Soft delete** — never hard-delete categories or accounts; set `isActive: false`.
6. **Version bump** — increment `DEFAULT_CATEGORY_OPTIONS_VERSION` or `DEFAULT_ACCOUNT_OPTIONS_VERSION`
   whenever you add, rename, or remove a default option to trigger auto-sync on next load.
7. **No `alert()`** — existing code uses `alert()`; new UX flows must use in-app feedback (toast/snackbar).
8. **Errors only** — new code should use `console.error` for errors; avoid new `console.log` calls.

---

## 11. Known TODOs / Incomplete Features

- `BottomNavigation.vue` — nav click only logs to console; routing logic is not implemented.
- Dashboard tabs: Calendar, Monthly, Summary, Description are UI-only stubs.
- AddTransactionView "Repeat" button and camera icon are UI stubs with no logic.
- Transfer transactions are not visually distinguished in the transaction list.
- Firebase Authentication is not implemented (app is currently unauthenticated).
- `Transaction.id` is fragile (`Number(doc.id.split('-')[1]) || Math.random()`); should be
  the Firestore document ID string (`doc.id`) stored directly in the type.

---

## 12. Adding a New Feature — Checklist

- [ ] Define or update TypeScript interfaces in `src/types/`
- [ ] Add Firestore CRUD functions in `src/firebase/`
- [ ] Create or extend a composable in `src/composables/`
- [ ] Build Vue component(s) in `src/components/` with `<style scoped>`
- [ ] Register new route in `src/router/index.ts` if needed
- [ ] Write unit tests in the nearest `__tests__/` directory
- [ ] Run `npm run build && npm run test:unit && npm run lint` to validate
