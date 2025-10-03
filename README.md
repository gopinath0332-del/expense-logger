# Expense Logger

A Vue.js 3 application for tracking and managing expenses, built with Vite and TypeScript.

## Features

- ⚡️ **Vite** - Lightning fast build tool
- 🎨 **Vue 3** - The progressive JavaScript framework
- 🔧 **TypeScript** - Full type safety
- 🎯 **Vue Router** - Client-side routing
- 🍍 **Pinia** - State management
- 🔥 **Firebase** - Cloud database with Firestore
- ✅ **Vitest** - Unit testing
- 🎭 **Playwright** - End-to-end testing
- 📏 **ESLint** - Code linting
- 💅 **Prettier** - Code formatting

## Firebase Setup

This application uses Firebase Firestore for data persistence. To configure Firebase:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Firestore Database

2. **Get Firebase Configuration**
   - In Firebase Console, go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web app icon (</>) or add a new web app
   - Copy the Firebase configuration values

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`:
     ```sh
     cp .env.example .env.local
     ```
   - Edit `.env.local` and fill in your Firebase credentials:
     ```
     VITE_FIREBASE_API_KEY=your_api_key_here
     VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Development Mode (Optional)**
   - To use sample data instead of Firebase during development:
     ```
     VITE_USE_SAMPLE_DATA=true
     ```
   - If Firebase credentials are not provided, the app automatically falls back to sample data

### Firestore Data Structure

Transactions are stored in a collection named `transactions` with the following structure:

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

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
