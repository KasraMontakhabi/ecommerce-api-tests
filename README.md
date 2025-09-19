# Ecommerce API Test Suite

This repository contains an automated API regression suite for the [DummyJSON](https://dummyjson.com) e-commerce service. The tests are written in TypeScript on top of the [Playwright Test Runner](https://playwright.dev/docs/test-intro) and cover authentication, catalog, cart, and user-management scenarios exposed by the public API. The suite is designed to be executed locally or in CI pipelines and includes optional [Allure](https://docs.qameta.io/allure/) reporting support.

## Features

- **Comprehensive coverage of DummyJSON endpoints** – smoke and regression checks for `/auth`, `/products`, `/carts`, and `/users`, plus cross-cutting negative and performance assertions.
- **Tag-driven execution** – filter scenarios via Playwright annotations such as `@smoke`, `@auth`, `@products`, `@users`, `@cart`, and `@cross`.
- **Type-safe expectations** – shared TypeScript types and helper utilities ensure response validation consistency.
- **Reporting options** – Playwright HTML report by default with optional Allure report generation and viewer commands.

## Prerequisites

- [Node.js](https://nodejs.org/) **18.x or newer** (Playwright officially supports active LTS releases).
- npm (bundled with Node.js).
- Optional for Allure reports: `allure` CLI on your `PATH`. You can install it globally with `npm install -g allure-commandline` or use the included `allure-commandline` dev dependency via the provided npm scripts.

## Installation

```bash
# clone the repository
 git clone <repo-url>
 cd ecommerce-api-tests

# install dependencies
 npm install
```

Playwright will automatically download the browser binaries required for the test runner during the first install.

## Configuration

Key settings live in [`playwright.config.ts`](playwright.config.ts):

- `use.baseURL` defaults to `https://dummyjson.com`. Override by exporting `BASE_URL` in your environment.
- `extraHTTPHeaders` are preconfigured for JSON APIs.
- The suite runs fully in parallel by default with HTML and Allure reporters enabled.

Test data and the default base URL are also stored in [`data/testData.json`](data/testData.json). Update this file if you need to exercise the suite against a different environment.

## Running the Tests

Run the entire suite:

```bash
npm test
```

Commonly used subsets are exposed through npm scripts:

| Command | Description |
|---------|-------------|
| `npm run test:smoke` | Execute critical smoke scenarios across domains. |
| `npm run test:auth` | Authentication-only coverage (`@auth`). |
| `npm run test:products` | Product catalogue checks (`@products`). |
| `npm run test:users` | User directory scenarios (`@users`). |
| `npm run test:carts` | Cart workflow regression tests (`@carts`). |
| `npm run test:cross` | Cross-cutting and negative tests (`@cross`). |

You can also invoke Playwright directly, e.g. `npx playwright test tests/products.spec.ts --grep @smoke`.

## Reporting

After a run, Playwright’s HTML report is located in `playwright-report/`. Open it locally with:

```bash
npx playwright show-report
```

Allure reporting is integrated via helper scripts:

```bash
npm run allure:run       # execute tests and build the Allure artifacts
npm run allure:generate  # regenerate report from existing results
npm run allure:open      # serve the generated report locally
```

Allure output is stored in `allure-results/` and `allure-report/` by default.

## Repository Structure

```
├── data/                # Static fixtures (credentials, base URL)
├── tests/               # Playwright specs grouped by API domain
├── types/               # Shared TypeScript interfaces for API responses
├── utils/               # Auth helpers and custom expectation utilities
├── playwright.config.ts # Global Playwright configuration
└── tsconfig.json        # TypeScript compiler options
```

## Writing and Extending Tests

1. Create new `.spec.ts` files under `tests/`. Leverage Playwright’s [`request`](https://playwright.dev/docs/test-api-testing) fixture for HTTP calls.
2. Reuse shared types from `types/` or add new definitions when validating additional schema fields.
3. Use [Playwright annotations](https://playwright.dev/docs/test-annotations) (e.g. `.describe`, `.only`, `.skip`) and tag strings (e.g. `test.describe('@payments', ...)`) to keep filtering consistent.
4. Prefer helper utilities such as [`recomputeCartTotals`](utils/expectHelpers.ts) to avoid duplicate logic when asserting calculated server totals.

