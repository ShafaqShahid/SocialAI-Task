# BUGS

## 1. Login succeeds without a password

- Severity: Critical
- Steps to reproduce:
  1. Register a valid user.
  2. Call `POST /api/auth/login` with the same email and omit `password`.
- Expected: The API should return `400` or `401` and never issue a token.
- Actual: The API returns `200` with a valid token.
- Evidence: `@api @known-bug` scenario `Login should reject missing password`
- Suggested root cause: `sample-app/server.js` only rejects the password when it is present and wrong, so missing and empty passwords bypass the credential check.

## 2. Post creation accepts titles longer than 280 characters

- Severity: Major
- Steps to reproduce:
  1. Authenticate successfully.
  2. Call `POST /api/posts` with a `title` longer than 280 characters.
- Expected: The API should return `400`.
- Actual: The API returns `201` and creates the post.
- Evidence: `@api @known-bug` scenario `Create should reject an overly long title`
- Suggested root cause: The server defines `MAX_TITLE_LENGTH` but does not enforce it in the create handler.

## 3. Unsupported platforms are accepted during post creation

- Severity: Major
- Steps to reproduce:
  1. Authenticate successfully.
  2. Call `POST /api/posts` with `platform: "x"`.
- Expected: The API should return `400`.
- Actual: The API returns `201` and stores the unsupported value.
- Evidence: `@api @known-bug` scenario `Create should reject an unsupported platform`
- Suggested root cause: The create handler does not validate `platform` against `ALLOWED_PLATFORMS`.

## 4. Post listing ignores pagination parameters

- Severity: Major
- Steps to reproduce:
  1. Authenticate successfully.
  2. Create at least three posts.
  3. Call `GET /api/posts?limit=1&offset=1`.
- Expected: Exactly one post should be returned.
- Actual: All posts are returned.
- Evidence: `@api @known-bug` scenario `Listing should honor limit and offset`
- Suggested root cause: The listing handler filters by owner but never applies `limit` or `offset`.

## 5. Any authenticated user can read another user's post

- Severity: Critical
- Steps to reproduce:
  1. Register two users.
  2. Create a post as the second user.
  3. Fetch that post id while authenticated as the first user.
- Expected: The API should return `403` or `404`, never `200`.
- Actual: The API returns `200` with the other user's post data.
- Evidence: `@api @known-bug` scenario `Reading another user's post should not succeed`
- Suggested root cause: The `GET /api/posts/:id` handler does not enforce post ownership before responding.

## 6. Deleting a missing post returns 204 instead of 404

- Severity: Major
- Steps to reproduce:
  1. Authenticate successfully.
  2. Call `DELETE /api/posts/missing-post-id`.
- Expected: The API should return `404`.
- Actual: The API returns `204`.
- Evidence: `@api @known-bug` scenario `Delete should return 404 for a missing post`
- Suggested root cause: The delete handler calls `posts.delete()` and returns `204` without verifying existence first.

## 7. Scheduling accepts past timestamps

- Severity: Major
- Steps to reproduce:
  1. Authenticate successfully.
  2. Create a post.
  3. Call `POST /api/posts/:id/schedule` with a past ISO timestamp.
- Expected: The API should return `400`.
- Actual: The API returns `200` and stores the timestamp.
- Evidence: `@api @known-bug` scenario `Scheduling should reject past timestamps`
- Suggested root cause: The schedule handler validates date parsing but not the future-only business rule.

## 8. Create form does not reset after a successful post

- Severity: Minor
- Steps to reproduce:
  1. Register or log in through the UI.
  2. Create a valid post.
  3. Inspect the form values.
- Expected: Title, content, and platform controls should reset for the next entry.
- Actual: Previous values remain in the form.
- Evidence: `@ui @known-bug` scenario `Post form should reset after a successful creation`
- Suggested root cause: The UI refreshes the list after create but never clears the form fields.
