# Add New Account Feature

## Overview
The AccountSelector component now includes functionality for users to create custom account options that are automatically saved to Firebase and synchronized across the application.

## Features

### 🎯 User-Friendly Interface
- **Add New Button**: Dashed border button at the end of account grid
- **Modal Form**: In-place form within the same modal
- **Icon Selection**: 10 predefined icons to choose from
- **Real-time Validation**: Immediate feedback for form inputs

### 💾 Firebase Integration
- **Automatic Saving**: New accounts are saved to Firebase using `addAccountOption()`
- **ID Generation**: Automatic ID creation from account name (lowercase, hyphenated)
- **Immediate Availability**: New accounts are instantly available for selection
- **Persistence**: Custom accounts persist across app sessions

### 🎨 Icon Options
The component provides 10 common account icons:
- Wallet (bi bi-wallet)
- Wallet 2 (bi bi-wallet2) 
- Credit Card (bi bi-credit-card)
- Debit Card (bi bi-credit-card-2-front)
- Bank (bi bi-bank)
- Cash (bi bi-cash)
- Mobile/UPI (bi bi-phone)
- PayPal (bi bi-paypal)
- Coin (bi bi-coin)
- Savings/Piggy Bank (bi bi-piggy-bank)

## User Workflow

### 1. Opening Add Account Form
```
1. User clicks \"Select account\" in transaction form
2. Account selector modal opens
3. User sees existing accounts + \"Add New\" button
4. User clicks \"Add New\" button
5. Form appears in same modal
```

### 2. Creating New Account
```
1. User enters account name (required, max 50 chars)
2. User selects an icon from the grid
3. User clicks \"Add Account\" button
4. Account is saved to Firebase
5. Account list refreshes automatically
6. New account is selected and modal closes
```

### 3. Error Handling
- **Empty Name**: \"Account name is required\"
- **Firebase Error**: \"Failed to add account. Please try again.\"
- **Loading State**: Button shows \"Adding...\" during save

## Technical Implementation

### Component Updates

#### AccountSelector.vue
```typescript
// New Props
interface Emits {
  (e: 'close'): void
  (e: 'select', account: Account): void
  (e: 'refresh'): void // New emit for refreshing account list
}

// Form State
const showAddForm = ref(false)
const newAccount = ref({ label: '', icon: 'bi bi-wallet' })
const isLoading = ref(false)
const error = ref('')
```

#### AddTransactionView.vue
```typescript
// New Method
const refreshAccountOptions = async () => {
  try {
    accountOptions.value = await fetchAccountOptions()
  } catch (error) {
    console.error('Failed to refresh account options:', error)
  }
}

// Updated Template
<AccountSelector
  @refresh=\"refreshAccountOptions\"
  // ... other props
/>
```

### Firebase Integration
```typescript
// Auto-generated ID from label
const id = newAccount.value.label
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')

// Save to Firebase
await addAccountOption({
  id,
  label: newAccount.value.label.trim(),
  icon: newAccount.value.icon
})
```

## Styling Features

### Form Design
- Clean, modern form layout
- Proper spacing and typography
- Focus states for accessibility
- Error message styling

### Icon Grid
- 5-column responsive grid
- Hover and active states
- Visual feedback for selection
- Consistent icon sizing

### Button States
- **Default**: Dashed border for \"Add New\"
- **Hover**: Color change and subtle background
- **Loading**: Disabled state with loading text
- **Error**: Red error messages

## Benefits

### For Users
- ✅ **Flexibility**: Create accounts for any payment method
- ✅ **Personalization**: Choose icons that match their preferences  
- ✅ **Convenience**: No need to contact admin to add accounts
- ✅ **Instant Access**: New accounts available immediately

### For Developers
- ✅ **No Backend Changes**: Uses existing Firebase infrastructure
- ✅ **Automatic Sync**: Leverages existing sync mechanisms
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Testable**: Comprehensive test coverage

## Example Usage

### Creating a Custom Account
```
1. User wants to track \"Apple Pay\" transactions
2. Clicks \"Add New\" in account selector
3. Enters \"Apple Pay\" as name
4. Selects phone icon (for mobile payment)
5. Clicks \"Add Account\"
6. \"Apple Pay\" now appears in all account selectors
7. Account persists across app sessions
```

### ID Generation Examples
```
\"My Savings Account\" → \"my-savings-account\"
\"Credit Card #1\" → \"credit-card-1\"
\"PayPal Business\" → \"paypal-business\"
\"Cash - Wallet\" → \"cash-wallet\"
```

This feature significantly enhances user experience by allowing personalization while maintaining data integrity and consistency across the application!