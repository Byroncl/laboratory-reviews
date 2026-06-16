---
title: Setup & Configuration
sidebar_position: 1
description: How to install, configure environments, and run the Angular frontend locally or with Docker.
---

# Setup & Configuration

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18 or higher |
| Angular CLI | 18 |

Install the Angular CLI globally:

```bash
npm install -g @angular/cli@18
```

---

## Installation

```bash
cd frontend-post-message-angular
npm install
```

---

## Environment Configuration

The app uses Angular's file-replacement mechanism (`angular.json`) to swap environment files per build configuration.

### Development (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
};
```

### Docker (`src/environments/environment.docker.ts`)

Used when the Angular app runs inside a container and the NestJS backend is accessible via `host.docker.internal`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://host.docker.internal:3000/api',
  socketUrl: 'http://host.docker.internal:3000',
};
```

`angular.json` declares a `docker` build configuration that replaces `environment.ts` with `environment.docker.ts` at build time:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.docker.ts"
  }
]
```

To point the app at a custom backend URL without a dedicated configuration, edit `src/environments/environment.ts` directly before running.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm start` | Starts `ng serve` on http://localhost:4200 |
| Build | `npm run build` | Production build, output to `dist/` |
| Watch build | `npm run watch` | Incremental dev build, watches for changes |
| Unit tests | `npm test` | Opens Karma test runner in the browser |
| E2E (headless) | `npm run e2e` | Runs Cypress in CI mode |
| E2E (interactive) | `npm run e2e:open` | Opens Cypress Test Runner UI |
| SSR server | `npm run serve:ssr:frontend-post-message-angular` | Runs the built SSR Node server |

---

## Development Server

```bash
npm start
```

Starts `ng serve`. The app is available at **http://localhost:4200** with hot module replacement enabled.

The dev server proxies API and WebSocket requests using `environment.apiUrl` and `environment.socketUrl`. Both must point to a running NestJS backend.

---

## Production Build

```bash
npm run build
```

Outputs a fully optimized build to `dist/frontend-post-message-angular/`. The SSR bundle is included at `dist/frontend-post-message-angular/server/server.mjs`.

---

## SSR Server

After a production build, start the SSR Node server:

```bash
npm run serve:ssr:frontend-post-message-angular
# equivalent to: node dist/frontend-post-message-angular/server/server.mjs
```

The server renders Angular on the server for the initial request, then hands off to the client-side SPA.
