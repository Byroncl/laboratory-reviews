# Testing Strategy

---

## Overview

| Project | Framework | Type | Spec count | Command |
|---|---|---|---|---|
| Backend | Jest 30 + Supertest | Unit + E2E | 70 unit specs | `npm test` |
| Frontend | Karma 6.4 + Jasmine 5.2 | Unit | 42 specs | `npm test` |
| Frontend | Cypress 13 | E2E | — | `npm run e2e` |
| Frontend | Playwright 1.61 | E2E (alt) | — | — |

---

## Backend Unit Tests

**Location**: `backend-post-message-nestjs/src/**/*.spec.ts`

**Stack**: Jest 30, ts-jest, `@nestjs/testing`

```bash
# Run from backend-post-message-nestjs/
npm test                # single run
npm run test:watch      # watch mode (re-runs on file changes)
npm run test:cov        # coverage report → ../coverage/
npm run test:debug      # attach a Node debugger
```

Coverage output lands in the `coverage/` directory at the repo root.

**Conventions**:
- Test files are colocated with the source file they cover (e.g., `comments.service.spec.ts` next to `comments.service.ts`).
- Dependencies are mocked with `jest.fn()` and injected via `@nestjs/testing`'s `TestingModule`.
- No shared test fixtures — each `describe` block sets up its own mocks.

---

## Backend E2E Tests

**Location**: `backend-post-message-nestjs/test/`

**Config**: `backend-post-message-nestjs/test/jest-e2e.json`

**Stack**: Jest + Supertest (HTTP assertions against the running NestJS app)

```bash
# Requires a running MongoDB instance
npm run test:e2e
```

E2E tests spin up the full NestJS application in-process and send HTTP requests via Supertest. They test full request/response cycles including guards, pipes, and interceptors.

---

## Frontend Unit Tests

**Location**: `frontend-post-message-angular/src/**/*.spec.ts`

**Stack**: Karma 6.4, Jasmine 5.2, karma-coverage

```bash
# Run from frontend-post-message-angular/
npm test        # launches Chrome, runs specs, watches for changes
```

**Conventions**:
- Each component and service has a colocated `.spec.ts` file.
- `TestBed.configureTestingModule` bootstraps the Angular DI context per suite.
- Services are replaced with jasmine spies (`jasmine.createSpyObj`) to isolate units.
- Coverage is collected via karma-coverage (configured in `karma.conf.js`).

---

## Frontend E2E Tests — Cypress

**Stack**: Cypress 13

**Base URL**: `http://localhost:4200`

```bash
# Run from frontend-post-message-angular/
# The Angular dev server must be running at http://localhost:4200

npm run e2e        # headless (CI-friendly)
npm run e2e:open   # interactive Cypress UI
```

Start the dev server in a separate terminal before running e2e tests:

```bash
# Terminal 1
cd frontend-post-message-angular
npm run start

# Terminal 2
cd frontend-post-message-angular
npm run e2e
```

---

## Running All Tests

Run backend first, then frontend:

```bash
# 1. Backend unit tests
cd backend-post-message-nestjs
npm test

# 2. Backend e2e (requires MongoDB running)
npm run test:e2e

# 3. Frontend unit tests
cd ../frontend-post-message-angular
npm test

# 4. Frontend e2e (requires the Angular dev server running at :4200)
npm run e2e
```

To run backend and frontend unit tests in parallel (two terminals):

```bash
# Terminal A
cd backend-post-message-nestjs && npm test

# Terminal B
cd frontend-post-message-angular && npm test
```
