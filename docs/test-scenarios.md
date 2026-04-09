# Suggested Test Scenarios

This is a **starter list** of things worth testing. It is deliberately non-exhaustive — we want to see where you push beyond it, what you decide to prioritize, and what you consciously choose to skip.

Treat missing items as an invitation, not a boundary.

## API — Authentication

- Register with valid credentials — returns 201 with a token and a stable user id
- Register with a malformed email — returns 400
- Register with a short password — returns 400
- Register with an email that is already taken — returns 409
- Login with valid credentials — returns 200 and a token
- Login with a wrong password — returns 401
- Login with an empty / missing password — should NOT return a token
- Login with an unknown email — returns 401
- Any protected endpoint without a bearer token — returns 401
- Any protected endpoint with a malformed or expired token — returns 401

## API — Posts CRUD

- Create a post with valid data — returns 201 and the expected shape
- Create a post with missing fields — returns 400 for each
- Create a post with a `title` longer than 280 characters — returns 400
- Create a post with an unsupported `platform` value — returns 400
- List posts returns only the caller's posts
- List posts honors `limit` and `offset`
- Fetch another user's post by id — returns 403 or 404, never 200
- Update your own post — returns 200 with the updated fields
- Update another user's post — returns 403
- Delete an existing post — returns 204, and subsequent GET returns 404
- Delete a non-existent post — returns 404
- Delete another user's post — returns 403

## API — Scheduling

- Schedule a post for a valid future ISO timestamp — returns 200 with `scheduledAt` set
- Schedule a post for a past timestamp — returns 400
- Schedule a post with an invalid date string — returns 400
- Schedule a post that does not belong to you — returns 403

## UI — Happy paths

- Register via the UI and land on the dashboard
- Log in with valid credentials and see the dashboard
- Create a post via the form and see it appear in the list
- After creating a post, the form should clear so the next post can be composed quickly
- Log out returns you to the auth screen and clears the token

## UI — Edge / validation

- Submitting the login form with a wrong password shows an inline error
- The auth error element is cleared when the user retries
- Post content is HTML-escaped in the list (no XSS via `<script>` in title)
- Creating a post with an empty title shows an inline error

## Cross-cutting / non-functional (pick what's worth your time)

- Health endpoint responds within a reasonable budget (e.g. < 100ms locally)
- Repeated create calls do not leak ids or duplicate in the list
- The API returns a consistent error shape for every failure
- The UI is usable with keyboard navigation (tab order, enter-to-submit)
- Rapid sequential requests do not race / corrupt state

---

Again: **this is a starter list.** Your own additions matter more than exhaustively covering ours.
