# NOTES



## Prioritization

- I used Playwright + Cucumber + JavaScript to keep one stack for UI, API, and reporting.
- I used Page Object Model for browser interactions so selectors and UI behavior stay out of Gherkin step definitions.
- I separated features, steps, pages, helpers, support, data, and reports to keep the framework readable and easy to extend.
- I intentionally tagged seeded defects with `@known-bug` so the default CI workflow stays green while still preserving executable bug evidence.

## Trade-offs

- I kept the regression pack compact instead of automating every negative permutation in `docs/test-scenarios.md`.
- I wrote API checks in Gherkin as well, even though plain code tests would be terser, because a single BDD layer simplifies reporting and stakeholder readability.
- I used one browser target, Chromium, because cross-browser expansion would add runtime and maintenance cost without improving the submission signal materially.

