---
sidebar_position: 1
title: Testing Guide
description: Unit tests, e2e tests, and coverage for the NestJS backend.
---

# Testing Guide

## Stack

| Tool | Version | Role |
|---|---|---|
| Jest | 30 | Test runner and assertion library |
| ts-jest | latest | TypeScript transform for Jest |
| @nestjs/testing | 11 | `Test.createTestingModule()` utilities |
| Supertest | latest | HTTP assertions for e2e tests |

---

## Jest Configuration

The Jest configuration lives inside `package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/$1"
    }
  }
}
```

Key points:

- **rootDir** is `src/` — all test discovery starts there
- **Pattern** `*.spec.ts` — test files are colocated with source files
- **Path alias** — `src/*` maps to `<rootDir>/*`, so imports like `import { X } from 'src/modules/...'` work inside specs
- **Coverage output** goes to `coverage/` at the project root (one level above `src/`)

---

## Running Tests

```bash
# Run all unit tests once
npm test

# Watch mode — re-runs affected tests on file change
npm run test:watch

# Run with coverage report
npm run test:cov

# Debug — attaches Node.js inspector (connect via chrome://inspect)
npm run test:debug

# End-to-end tests
npm run test:e2e
```

Coverage artifacts are written to `backend-post-message-nestjs/coverage/` and are excluded from version control.

---

## Test File Convention

Unit test files live **next to the source file they test**:

```
src/
  app/
    modules/
      posts/
        controllers/
          posts.controller.ts
          posts.controller.spec.ts    ← unit test
        services/
          posts.service.ts
          posts.service.spec.ts       ← unit test
```

The project has **70 unit specs** distributed across all modules.

---

## E2E Tests

End-to-end tests use a separate Jest config at `test/jest-e2e.json` and Supertest to drive the full HTTP layer against a running NestJS application.

```bash
npm run test:e2e
```

E2E tests are placed in the `test/` directory at the project root (outside `src/`).

---

## Writing a Unit Test

Below is a typical controller unit test pattern using `@nestjs/testing`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from '../services/posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPostsService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: '1', title: 'Test' }),
    create: jest.fn().mockResolvedValue({ id: '1', title: 'Test' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll() should return an array', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([]);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });
});
```

Key practices:

- **Mock the service** — controllers are tested in isolation; services are replaced with `jest.fn()` stubs
- **`beforeEach` rebuilds the module** — ensures test isolation
- **Use `mockResolvedValue`** for async methods
- **Assert on both return value and call count** where behavior matters

---

## Coverage

```bash
npm run test:cov
```

Coverage is collected from all `**/*.(t|j)s` files under `src/`. The HTML and LCOV reports are written to `coverage/` at the project root.

```
backend-post-message-nestjs/
  coverage/
    lcov-report/
      index.html    ← open this in a browser
    lcov.info
```

> Coverage thresholds are not enforced by default in the current configuration. Add `coverageThreshold` to `package.json` jest config to enforce minimums in CI.
