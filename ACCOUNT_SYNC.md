# Account Options Sync Documentation

## Overview
The account options sync system automatically handles updates to `DEFAULT_ACCOUNT_OPTIONS` and syncs them to the Firebase database.

## How It Works

### Version Tracking
- Each update to `DEFAULT_ACCOUNT_OPTIONS` should increment `DEFAULT_ACCOUNT_OPTIONS_VERSION` in `/src/types/account.ts`
- The system stores the current version in Firebase under `meta/account_options_version`

### Automatic Syncing
- Every time `fetchAccountOptions()` is called, it automatically checks if sync is needed
- If the local version differs from the Firebase version, sync occurs automatically
- The sync process:
  1. Compares local defaults with Firebase data
  2. Adds any new account options that don't exist in Firebase
  3. Updates existing options if label or icon has changed
  4. Updates the version tracking document

### Manual Syncing
You can also manually trigger a sync by calling `syncDefaultAccountOptions()`:

```typescript
import { syncDefaultAccountOptions } from '@/firebase'

// Manually sync account options
await syncDefaultAccountOptions()
```

## Adding New Account Options

To add new account options to the defaults:

1. **Update the array** in `/src/types/account.ts`:
```typescript
export const DEFAULT_ACCOUNT_OPTIONS: AccountOption[] = [
  // ... existing options
  { id: 'new-payment', label: 'New Payment Method', icon: 'bi bi-new-icon' }
]
```

2. **Increment the version**:
```typescript
export const DEFAULT_ACCOUNT_OPTIONS_VERSION = '1.1.0' // Update version
```

3. **Deploy the app** - sync will happen automatically on next load

## Firebase Collections

### `accounts` Collection
Stores individual account options with metadata:
```typescript
{
  id: 'cash',
  label: 'Cash',
  icon: 'bi bi-cash',
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

### `meta/account_options_version` Document
Tracks the current version:
```typescript
{
  version: '1.0.0',
  lastUpdated: Date,
  accountCount: 7
}
```

## Best Practices

1. **Always increment version** when changing `DEFAULT_ACCOUNT_OPTIONS`
2. **Use semantic versioning** (major.minor.patch)
3. **Test locally** before deploying changes
4. **Monitor console logs** for sync status messages

## Error Handling

- If Firebase is unavailable, the app falls back to local defaults
- Sync errors are logged but don't prevent the app from functioning
- Version mismatches trigger automatic sync attempts

## Example Workflow

1. Developer adds new payment method:
```typescript
// Add to DEFAULT_ACCOUNT_OPTIONS
{ id: 'paypal', label: 'PayPal', icon: 'bi bi-paypal' }

// Update version
export const DEFAULT_ACCOUNT_OPTIONS_VERSION = '1.1.0'
```

2. User opens the app → `fetchAccountOptions()` is called
3. System detects version mismatch (1.0.0 vs 1.1.0)
4. Sync automatically runs, adding PayPal to Firebase
5. Version is updated to 1.1.0 in Firebase
6. User sees the new PayPal option in the account selector