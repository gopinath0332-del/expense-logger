# Firebase Integration Guide

This document provides detailed information about the Firebase integration in the Expense Logger application.

## Overview

The application uses Firebase Firestore as its primary database for storing and retrieving transaction data. The integration is designed to be optional and gracefully falls back to sample data when Firebase is not configured.

## Architecture

### Firebase Module Structure

```
src/firebase/
├── config.ts       # Firebase initialization and configuration
├── database.ts     # Firestore CRUD operations
└── index.ts        # Module exports
```

### Key Functions

#### Configuration (`config.ts`)

- **`isFirebaseConfigured()`**: Checks if all required Firebase environment variables are present
- **`useSampleData()`**: Determines whether to use sample data or Firebase
- **`app`**: Firebase app instance (null if not configured)
- **`db`**: Firestore database instance (null if not configured)

#### Database Operations (`database.ts`)

- **`fetchTransactions()`**: Retrieves all transactions from Firestore, grouped by date
- **`addTransaction(transaction)`**: Adds a new transaction to Firestore
- **`updateTransaction(id, transaction)`**: Updates an existing transaction
- **`deleteTransaction(id)`**: Deletes a transaction from Firestore

## Setup Instructions

### 1. Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

### 2. Enable Firestore

1. In the Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode"
4. Select a Cloud Firestore location (choose one close to your users)

### 3. Get Configuration Credentials

1. Go to Project Settings (gear icon) → General
2. Scroll to "Your apps" section
3. If no web app exists, click the web icon (`</>`) to add one
4. Register your app with a nickname (e.g., "Expense Logger Web")
5. Copy the Firebase configuration object

### 4. Configure Environment Variables

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. (Optional) To force use of sample data:
   ```env
   VITE_USE_SAMPLE_DATA=true
   ```

### 5. Set Firestore Security Rules

In the Firebase Console, go to "Firestore Database" → "Rules" and set appropriate security rules.

**For development (WARNING: Not secure for production):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**For production with authentication:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Data Structure

Transactions are stored in a Firestore collection named `transactions` with the following schema:

```typescript
{
  date: string          // ISO date format: "2025-07-28"
  category: string      // e.g., "Food", "Health", "Transport"
  subcategory?: string  // Optional: e.g., "Zomato", "Medicine"
  paymentMethod: string // e.g., "UPI", "Cash", "Credit Card"
  description: string   // Transaction description/notes
  amount: number        // Transaction amount (positive for expenses)
}
```

### Example Document

```json
{
  "date": "2025-07-28",
  "category": "Food",
  "subcategory": "Zomato",
  "paymentMethod": "UPI",
  "description": "Lunch order",
  "amount": 450.00
}
```

## Usage in Code

### Fetching Transactions

The `useTransactionData` composable automatically handles Firebase integration:

```typescript
import { useTransactionData } from '@/composables/useTransactionData'

const { transactions, summary, loading, error, loadTransactions } = useTransactionData()
```

- `transactions`: Reactive ref containing transaction data grouped by date
- `summary`: Computed summary of income, expenses, and balance
- `loading`: Boolean indicating if data is being fetched
- `error`: Error message if fetch fails
- `loadTransactions()`: Function to manually reload transactions

### Direct Firebase Operations

You can also use Firebase operations directly:

```typescript
import { addTransaction, updateTransaction, deleteTransaction } from '@/firebase'

// Add a new transaction
await addTransaction({
  date: '2025-07-28',
  category: 'Food',
  subcategory: 'Restaurant',
  paymentMethod: 'UPI',
  description: 'Dinner',
  amount: 800.00
})

// Update a transaction
await updateTransaction('transaction-id', {
  amount: 850.00,
  description: 'Dinner with friends'
})

// Delete a transaction
await deleteTransaction('transaction-id')
```

## Fallback Behavior

The application implements a smart fallback system:

1. **No Firebase Configuration**: If environment variables are not set, the app automatically uses sample data
2. **Firebase Error**: If Firebase initialization fails, the app catches the error and uses sample data
3. **Fetch Error**: If fetching data from Firebase fails, the app logs the error and falls back to sample data
4. **Manual Override**: Set `VITE_USE_SAMPLE_DATA=true` to force use of sample data even when Firebase is configured

## Development Workflow

### Using Sample Data

For development without Firebase:
```bash
npm run dev
```

The app will automatically use sample data when Firebase is not configured.

### Using Firebase in Development

1. Configure `.env.local` with your Firebase credentials
2. Ensure `VITE_USE_SAMPLE_DATA` is not set to `true`
3. Run the development server:
   ```bash
   npm run dev
   ```

### Testing

Run unit tests:
```bash
npm run test:unit
```

The tests include basic validation of the Firebase configuration logic.

## Deployment

### Environment Variables in Production

When deploying to production (e.g., GitHub Pages, Vercel, Netlify):

1. Add environment variables in your deployment platform's settings
2. Use the same variable names as in `.env.example`
3. Ensure the variables are prefixed with `VITE_` (required by Vite)

### GitHub Actions

For GitHub Pages deployment, add secrets to your repository:

1. Go to Settings → Secrets and variables → Actions
2. Add each Firebase credential as a secret
3. Update `.github/workflows/deploy.yml` to pass secrets as environment variables

## Troubleshooting

### Firebase Not Initializing

**Problem**: Application shows "Using sample transaction data" in console

**Solutions**:
1. Check that all environment variables are set correctly in `.env.local`
2. Verify variable names are prefixed with `VITE_`
3. Restart the development server after changing `.env.local`
4. Check browser console for Firebase initialization errors

### Firestore Permission Errors

**Problem**: Console shows permission denied errors

**Solutions**:
1. Check Firestore security rules in Firebase Console
2. Ensure rules allow read/write access (at least for development)
3. If using authentication, ensure user is authenticated

### Build Size Concerns

The Firebase SDK adds approximately 128KB (gzipped) to the bundle size. If this is a concern:

1. Use Firebase's modular SDK (already implemented)
2. Consider code splitting for Firebase operations
3. Evaluate if Firebase features justify the bundle size increase

## Best Practices

1. **Never commit `.env.local`**: This file contains sensitive credentials
2. **Use environment-specific configs**: Different Firebase projects for dev/staging/prod
3. **Implement proper security rules**: Don't use test mode rules in production
4. **Monitor Firestore usage**: Check Firebase Console for quota usage
5. **Error handling**: Always handle Firebase errors gracefully
6. **Type safety**: Use TypeScript interfaces for all Firebase data

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
