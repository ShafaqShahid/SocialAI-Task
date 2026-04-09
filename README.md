# MiniSociali QA Automation Suite

This repository contains a Playwright + Cucumber + JavaScript automation framework for the MiniSociali sample app. The suite covers high-value API and UI flows, keeps known seeded defects documented, and generates CI-friendly reports and local debugging artifacts.

## Stack

- Playwright for browser automation and API requests
- Cucumber for Gherkin-based execution and reporting
- JavaScript for the full framework
- Page Object Model for UI logic

## Project Layout

```text
features/            Gherkin feature files for API and UI coverage
steps/               Step definitions only
pages/               UI page objects
helpers/             API clients, assertions, and shared utilities
support/             Cucumber world, hooks, and runtime config
data/                Test data builders and constants
reports/             Generated JSON, JUnit, HTML, screenshots, and traces
sample-app/          Application under test (left unchanged)
```

## Setup

```bash
npm install
npx playwright install chromium
npm test
```

`npm install` also installs the `sample-app` dependencies through the root `postinstall` script.




```bash
npm run test:api
npm run test:ui
npm run test:smoke
npm run test:known-bugs
npm run test:report
```

To view the generated HTML report, open `reports/html/index.html` in VS Code or in your browser after the run completes.

## Run Options

```bash
npm test
npm run test:api
npm run test:ui
npm run test:smoke
npm run test:known-bugs
npm run test:headed
npm run test:report
```

Default runs exclude `@known-bug` scenarios so the suite stays green while still documenting seeded defects.

## Reporting

After each run, the suite writes artifacts under `reports/`:

- `reports/cucumber-report.json`
- `reports/junit.xml`
- `reports/html/index.html`
- `reports/screenshots/`
- `reports/traces/`

## Coverage Focus

The automated pack prioritizes:

- Auth contract and token handling
- Post creation, listing, read/update/delete, and scheduling
- Security-sensitive ownership checks
- Core UI user journeys
- One-click bug evidence for seeded defects

## CI

GitHub Actions configuration lives in `.github/workflows/qa.yml`. It installs dependencies, installs Chromium, runs the suite, and uploads the generated reports as artifacts.

## Notes

- Known defects are captured in `BUGS.md` and tagged in the test suite with `@known-bug`.
- Additional design rationale and next-step ideas are documented in `NOTES.md`.
