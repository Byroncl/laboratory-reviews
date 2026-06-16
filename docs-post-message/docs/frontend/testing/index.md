---
title: Testing Guide
sidebar_position: 1
description: Unit testing with Karma + Jasmine, E2E with Cypress, coverage setup, and test patterns for standalone components.
---

# Testing Guide

## Test Stack

| Layer | Tool | Version |
|---|---|---|
| Unit tests | Karma + Jasmine | Karma 6.4 / Jasmine 5.2 |
| Unit coverage | karma-coverage | — |
| E2E (primary) | Cypress | 13 |
| E2E (alternative) | Playwright | 1.61 |

---

## Unit Tests

### Running Tests

```bash
npm test
```

Opens a browser window with the Karma test runner. Test results are streamed live. To run in CI (headless), use:

```bash
ng test --watch=false --browsers=ChromeHeadless
```

### File Convention

Test files are colocated with the source file they test, using the `.spec.ts` suffix:

```
src/app/features/auth/pages/login/login.component.ts
src/app/features/auth/pages/login/login.component.spec.ts
```

The project contains **42 unit spec files** across features.

### Coverage

karma-coverage is configured in `karma.conf.js`. Coverage reports are generated in the `coverage/` directory after a test run with coverage enabled:

```bash
ng test --code-coverage
```

Open `coverage/index.html` in a browser to view the HTML report.

### Test Pattern for Standalone Components

Standalone components do not rely on `NgModule`, so `TestBed.configureTestingModule` imports only what the component itself declares:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        provideMockStore({ initialState: { auth: { user: null, token: null, loading: false, error: null } } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable submit when form is invalid', () => {
    const button = fixture.nativeElement.querySelector('[type="submit"]');
    expect(button.disabled).toBeTrue();
  });
});
```

### Mocking Services with Jasmine Spies

```typescript
const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
apiServiceSpy.get.and.returnValue(of(mockPosts));

TestBed.configureTestingModule({
  imports: [SomeComponent],
  providers: [{ provide: ApiService, useValue: apiServiceSpy }],
});
```

---

## E2E Tests

### Running Cypress

The app must be running on http://localhost:4200 before Cypress executes.

```bash
# Terminal 1: start the app
npm start

# Terminal 2: run tests
npm run e2e          # headless (CI mode)
npm run e2e:open     # interactive Cypress UI
```

### Cypress Base Configuration

Cypress is configured to use `http://localhost:4200` as the base URL. Test files live in the `cypress/` directory:

```
cypress/
├── e2e/          # Test specs (.cy.ts)
├── fixtures/     # Static test data
└── support/      # Commands and setup
```

### Playwright

Playwright 1.61 is installed alongside Cypress. It is available for scenarios that require cross-browser testing or a Node-based test runner. Configuration lives in `playwright.config.ts` at the project root.

---

## CI Considerations

- Unit tests: run `ng test --watch=false --browsers=ChromeHeadless`
- E2E: start the Angular dev server (or use `ng serve` with `wait-on`), then run `cypress run`
- Coverage gate: enforce minimum thresholds in `karma.conf.js` under the `coverageReporter.check` option
- Both Karma and Cypress produce JUnit-compatible XML reports for CI integrations when configured with the appropriate reporters
