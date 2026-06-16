---
title: Frontend Overview
sidebar_position: 1
description: Angular 18 frontend for the Post-Message application — architecture summary, tech stack, and key capabilities.
---

# Frontend Overview

The Post-Message frontend is an **Angular 18** single-page application with server-side rendering (SSR). It uses standalone components throughout (no `NgModule` declarations for features), **NgRx** for auth state, **Tailwind CSS** for styling, and **Socket.IO** for real-time updates across five dedicated namespaces.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Angular + standalone components | 18.2 |
| State management | @ngrx/store, @ngrx/effects | 18.1 |
| Styling | Tailwind CSS + SCSS | 3.4 |
| Real-time | socket.io-client | 4.8.1 |
| SSR | @angular/ssr | 18.2.21 |
| HTTP | Angular HttpClient + interceptors | 18.2 |
| Notifications | SweetAlert2 | 11.26.25 |
| Reactive primitives | RxJS | 7.8 |
| Language | TypeScript | 5.5 |
| Unit tests | Karma 6.4 + Jasmine 5.2 | — |
| E2E tests | Cypress 13 + Playwright 1.61 | — |

---

## Key Capabilities

- **Server-Side Rendering** via `@angular/ssr` — improves initial load and SEO for public routes (`/`, `/posts/:id`).
- **JWT authentication** — token stored in `localStorage` under `auth_token`, injected on every HTTP request via `JwtInterceptor`.
- **Real-time updates** across five Socket.IO namespaces: `comments`, `users`, `posts`, `roles`, `permissions`. Events are surfaced as RxJS `BehaviorSubject` streams via `WebSocketService`.
- **RBAC directives** — `*hasPermission` and `*hasRole` structural directives for template-level access control without route-guard duplication.
- **Lazy-loaded routes** — each feature is loaded on demand; the dashboard shell and its children are protected by `authGuard` + `dashboardGuard`.
- **i18n** — `I18nService` + `TranslatePipe` for runtime translations.
- **NgRx only for auth** — all other state is managed locally via services and `BehaviorSubject`.

---

## Documentation Map

| Section | What it covers |
|---|---|
| [Setup & Configuration](./setup) | Prerequisites, environment files, scripts |
| [Architecture](./architecture/structure) | Directory structure, feature vs. core vs. shared |
| [Features](./features) | Route map, auth flow, dashboard, guards |
| [Core Services](./services) | ApiService, WebSocketService, JwtInterceptor, etc. |
| [State Management](./state) | NgRx auth store, BehaviorSubject pattern |
| [Testing](./testing) | Unit tests, e2e, coverage |
