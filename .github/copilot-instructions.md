# Expense Logger

Expense Logger is a Vue.js 3 application for tracking and managing expenses, built with Vite, TypeScript, Vue Router, and Pinia for state management.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, build, and test the repository:
- **CRITICAL**: Node.js version requirement: `^20.19.0 || >=22.12.0` (current: v20.19.5 ✓)
- `npm install` -- takes ~15 seconds. Install all dependencies.
- `npm run type-check` -- takes ~3 seconds. Run TypeScript type checking.
- `npm run build` -- takes ~4 seconds. Build for production (runs type-check + vite build in parallel).
- `npm run test:unit` -- takes ~2 seconds. Run Vitest unit tests.
- `npm run lint` -- takes ~2 seconds. Run ESLint with auto-fix.
- `npm run format` -- takes ~1 second. Format code with Prettier.

### Run the application:
- **Development server**: `npm run dev` -- starts Vite dev server on http://localhost:5173/
- **Production preview**: `npm run preview` -- serves production build on http://localhost:4173/ (must run `npm run build` first)

### End-to-End Testing:
- **IMPORTANT**: E2E tests require Playwright browsers: `npx playwright install`
- Browser installation may fail in sandboxed environments -- document this as a known limitation
- `npm run test:e2e` -- runs Playwright tests (requires browsers installed and app built)
- Tests are configured to run on Chromium, Firefox, and WebKit

## Validation

### ALWAYS run complete validation after making changes:
1. **Build validation**: `npm run build` (includes type-checking)
2. **Unit tests**: `npm run test:unit`
3. **Linting**: `npm run lint`
4. **Manual testing scenarios**:
   - Start dev server: `npm run dev`
   - Navigate to http://localhost:5173/
   - Test navigation: Home ↔ About pages
   - Verify Vue Router navigation works correctly
   - Check that the "You did it!" heading displays
   - Test production build: `npm run build && npm run preview`
   - Navigate to http://localhost:4173/ and repeat above tests

### NEVER CANCEL any builds or tests:
- All commands complete quickly (under 30 seconds)
- If commands appear to hang, wait at least 60 seconds before investigating

## Key Architecture

### Project Structure:
```
├── src/
│   ├── components/          # Vue components
│   │   ├── __tests__/       # Component unit tests
│   │   ├── HelloWorld.vue   # Main greeting component
│   │   ├── TheWelcome.vue   # Welcome page content
│   │   └── icons/          # SVG icon components
│   ├── views/              # Route-level components
│   │   ├── HomeView.vue    # Home page (uses TheWelcome)
│   │   └── AboutView.vue   # About page
│   ├── router/             # Vue Router configuration
│   ├── stores/             # Pinia stores
│   │   └── counter.ts      # Example counter store
│   ├── assets/             # Static assets (CSS, images)
│   └── main.ts             # Application entry point
├── e2e/                    # Playwright end-to-end tests
├── public/                 # Static public assets
└── dist/                   # Production build output (generated)
```

### Key Technologies:
- **Vite**: Build tool and dev server
- **Vue 3**: Framework with Composition API
- **TypeScript**: Full type safety
- **Vue Router**: Client-side routing
- **Pinia**: State management (Composition API style)
- **Vitest**: Unit testing with jsdom environment
- **Playwright**: End-to-end testing
- **ESLint**: Code linting with Vue, TypeScript, Vitest, and Playwright rules
- **Prettier**: Code formatting

## Common Tasks

### Making Component Changes:
- Components are in `src/components/`
- Always add unit tests in `src/components/__tests__/`
- Example test pattern: `mount(Component, { props: {...} })`
- Run `npm run test:unit` after changes

### Route Changes:
- Router config: `src/router/index.ts`
- Route components: `src/views/`
- About route uses lazy loading: `() => import('../views/AboutView.vue')`

### State Management:
- Pinia stores: `src/stores/`
- Use Composition API style: `defineStore('name', () => { ... })`
- Example store: `useCounterStore` in `counter.ts`

### Styling:
- Global styles: `src/assets/main.css` and `src/assets/base.css`
- Component styles: Use `<style scoped>` in `.vue` files
- CSS custom properties used for theming

## Configuration Files Reference

### Package Scripts:
- `dev`: Start development server
- `build`: Production build (type-check + build-only in parallel)
- `preview`: Serve production build
- `test:unit`: Run Vitest unit tests
- `test:e2e`: Run Playwright E2E tests
- `build-only`: Vite build without type checking
- `type-check`: Vue TypeScript compiler
- `lint`: ESLint with auto-fix
- `format`: Prettier formatting

### Build Output:
```
dist/
├── index.html              # Entry HTML file
├── assets/
│   ├── index-[hash].js     # Main application bundle (~97KB)
│   ├── index-[hash].css    # Main styles (~4KB)
│   └── AboutView-[hash].js # Lazy-loaded About route (~0.2KB)
```

### Development URLs:
- Development: http://localhost:5173/
- Production preview: http://localhost:4173/
- Vue DevTools: http://localhost:5173/__devtools__/

## Troubleshooting

### Common Issues:
- **Playwright browser installation fails**: Known limitation in sandboxed environments
- **Type errors**: Run `npm run type-check` to see detailed TypeScript errors
- **Import errors**: Check file paths use `@/` alias for `src/` directory
- **Build failures**: Usually due to TypeScript errors or missing dependencies

### File Locations for Common Tasks:
- **Add new route**: Edit `src/router/index.ts` and create component in `src/views/`
- **Add global styles**: Edit `src/assets/main.css` or `src/assets/base.css`
- **Configure build**: Edit `vite.config.ts`
- **TypeScript config**: Multiple files - see `tsconfig.json` for references
- **Test config**: `vitest.config.ts` for unit tests, `playwright.config.ts` for E2E
- **Linting rules**: `eslint.config.ts`
- **Code formatting**: `.prettierrc.json`

### IDE Setup:
- Recommended: VSCode with Volar extension (not Vetur)
- Extensions configured in `.vscode/extensions.json`
- EditorConfig settings in `.editorconfig`