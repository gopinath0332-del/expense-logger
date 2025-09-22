# Deployment Guide

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

## Deployment Setup

### GitHub Pages Configuration
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The deployment will be automatically triggered on pushes to the `main` branch

### Workflows

The project includes two GitHub Actions workflows:

#### 1. **Deploy Workflow** (`.github/workflows/deploy.yml`)
- **Triggers**: Push to `main` branch, manual dispatch
- **Actions**: 
  - Type checking with TypeScript
  - Code linting with ESLint
  - Unit testing with Vitest
  - Building the application for production
  - Deploying to GitHub Pages

#### 2. **CI Workflow** (`.github/workflows/ci.yml`)
- **Triggers**: Pull requests to `main`, pushes to other branches
- **Actions**:
  - Type checking
  - Linting
  - Unit tests
  - Build verification
  - End-to-end tests (with Playwright)

### Configuration Details

- **Node.js Version**: 20.19.0 (as specified in package.json engines)
- **Base Path**: Automatically configured for GitHub Pages (`/expense-logger/`)
- **Build Output**: `dist/` directory
- **Dependencies**: Cached for faster builds
- **SPA Routing**: Configured with 404.html fallback for client-side routing

### SPA Routing on GitHub Pages

This project includes a solution for handling client-side routing on GitHub Pages:
- **404.html**: Redirects unknown routes back to the main app
- **index.html**: Contains script to handle redirected routes
- **Result**: Direct URLs like `/expense-logger/add-transaction` work when refreshed

The implementation uses the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) solution.

### URLs

Once deployed, your application will be available at:
```
https://{username}.github.io/expense-logger/
```

### Local Development vs Production

The Vite configuration automatically handles the base path:
- **Development** (`npm run dev`): Base path is `/`
- **Production** (`npm run build`): Base path is `/expense-logger/`

### Manual Deployment

You can also trigger a deployment manually:
1. Go to the **Actions** tab in your GitHub repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click **Run workflow**

### Requirements

- Repository must be public (for free GitHub Pages)
- GitHub Pages must be enabled in repository settings
- Workflows require appropriate permissions (automatically configured)

### Troubleshooting

If deployment fails:
1. Check the Actions tab for error logs
2. Ensure all tests pass locally
3. Verify the repository has GitHub Pages enabled
4. Check that the base path in `vite.config.ts` matches your repository name