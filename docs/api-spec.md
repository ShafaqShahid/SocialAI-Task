# MiniSociali API Specification

> This is the authoritative contract for the MiniSociali API. Your tests should assert against **this spec**, not against whatever the current implementation happens to do. If you find the implementation disagrees with the spec, that's a bug.

Base URL: `http://localhost:4000`
All request and response bodies are JSON unless otherwise noted.
Authentication uses a bearer token in the `Authorization` header: `Authorization: Bearer <token>`.

---

## Health

### `GET /api/health`

Public. Returns service status.

**Response 200**
```json
{ "status": "ok", "uptimeMs": 12345 }
```

---

## Authentication

### `POST /api/auth/register`

Public. Creates a new user account and returns an authentication token.

**Request body**
| Field    | Type   | Required | Notes                        |
|----------|--------|----------|------------------------------|
| email    | string | yes      | Must be a valid email format |
| password | string | yes      | Minimum 8 characters         |

**Responses**

- `201 Created` — `{ "token": "<string>", "userId": "<string>" }`
- `400 Bad Request` — invalid or missing email/password
- `409 Conflict` — email already registered

---

### `POST /api/auth/login`

Public. Authenticates an existing user and returns a new token.

**Request body**
| Field    | Type   | Required | Notes                |
|----------|--------|----------|----------------------|
| email    | string | yes      |                      |
| password | string | yes      | Must match the user  |

**Responses**

- `200 OK` — `{ "token": "<string>", "userId": "<string>" }`
- `400 Bad Request` — missing email or password
- `401 Unauthorized` — wrong credentials

> **Important:** An empty, missing, or incorrect password MUST result in a `400` or `401` response. The login endpoint must never issue a token without a valid password.

---

## Posts

All endpoints in this section require a valid bearer token. Missing or invalid tokens return `401 Unauthorized`.

A `Post` object looks like:
```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "content": "string",
  "platform": "facebook" | "instagram" | "linkedin" | "threads",
  "scheduledAt": "ISO-8601 string | null",
  "createdAt": "ISO-8601 string"
}
```

### `GET /api/posts`

Lists the **authenticated user's** posts.

**Query params**
| Param  | Type   | Default | Notes                                   |
|--------|--------|---------|-----------------------------------------|
| limit  | number | 20      | Max 100. Must be a positive integer.    |
| offset | number | 0       | Must be a non-negative integer.         |

**Response 200**
```json
{
  "posts": [ /* Post[] */ ],
  "total": 42
}
```

Only the caller's own posts may appear in `posts`. Pagination parameters must be honored.

---

### `POST /api/posts`

Creates a new post for the authenticated user.

**Request body**
| Field    | Type   | Required | Notes                                                                 |
|----------|--------|----------|-----------------------------------------------------------------------|
| title    | string | yes      | 1–280 characters                                                      |
| content  | string | yes      | Non-empty                                                             |
| platform | string | yes      | One of: `facebook`, `instagram`, `linkedin`, `threads`                |

**Responses**

- `201 Created` — returns the created `Post`
- `400 Bad Request` — missing/invalid fields, title too long, unsupported platform

---

### `GET /api/posts/:id`

Fetches a single post **owned by the authenticated user**.

**Responses**

- `200 OK` — the `Post`
- `403 Forbidden` — the post exists but belongs to another user
- `404 Not Found` — no post with that id

> Returning another user's post via this endpoint is a **security bug**, not a feature.

---

### `PUT /api/posts/:id`

Updates a post owned by the authenticated user. Fields not supplied are left unchanged. Any updated field is subject to the same validation rules as `POST /api/posts`.

**Responses**

- `200 OK` — updated `Post`
- `400 Bad Request` — validation failed
- `403 Forbidden` — post belongs to another user
- `404 Not Found` — post does not exist

---

### `DELETE /api/posts/:id`

Deletes a post owned by the authenticated user.

**Responses**

- `204 No Content` — deleted
- `403 Forbidden` — post belongs to another user
- `404 Not Found` — post does not exist

> Deleting a non-existent post MUST return `404`, not `204`. Idempotency does not apply here; callers rely on the distinction.

---

### `POST /api/posts/:id/schedule`

Schedules a post for future publication.

**Request body**
| Field       | Type   | Required | Notes                                              |
|-------------|--------|----------|----------------------------------------------------|
| scheduledAt | string | yes      | ISO-8601 date-time. MUST be **strictly in the future**. |

**Responses**

- `200 OK` — updated `Post` with `scheduledAt` set
- `400 Bad Request` — invalid or past date
- `403 Forbidden` / `404 Not Found` — as above

---

## Debug endpoints (non-production)

These exist only so your tests can inspect and reset server state. They are **not** part of the public contract and will not exist in the real product.

- `GET /api/_debug/state` — returns counts and raw state
- `POST /api/_debug/reset` — wipes all users, sessions, and posts

---

## General error shape

All error responses return:
```json
{ "error": "human-readable message" }
```
with the appropriate HTTP status code.
