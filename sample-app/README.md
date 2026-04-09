# MiniSociali (Sample App Under Test)

A single-file Express app that stands in for Sociali. It is deliberately small and deliberately imperfect — your job as the candidate is to build automated tests against it, find where it diverges from the spec, and report those issues.

## Requirements

- **Node.js 18+**

## Setup

```bash
npm install
npm start
```

The app listens on `http://localhost:4000` by default. Override with `PORT=5000 npm start`.

- UI: `http://localhost:4000/`
- API: `http://localhost:4000/api/*`
- Health: `http://localhost:4000/api/health`

Data is stored in memory. Restarting the server wipes all users and posts.
You can also reset state without restarting via `POST /api/_debug/reset`.

## API quick reference

See [`../docs/api-spec.md`](../docs/api-spec.md) for the full specification.

### curl cheat sheet

```bash
# Register
curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa@example.com","password":"supersecret"}'

# Log in (store the token)
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa@example.com","password":"supersecret"}' | jq -r .token)

# Create a post
curl -s -X POST http://localhost:4000/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello world","content":"My first post","platform":"facebook"}'

# List posts
curl -s http://localhost:4000/api/posts -H "Authorization: Bearer $TOKEN"

# Reset server state (useful between test runs)
curl -s -X POST http://localhost:4000/api/_debug/reset
```

## Notes for test authors

- Use `POST /api/_debug/reset` between tests if you want a clean slate.
- Use `GET /api/_debug/state` if you want to make backend-state assertions.
- The server exports the Express app from `server.js` (`module.exports = app`) so you can import it directly into in-process test frameworks (e.g. Supertest) without binding a port.
