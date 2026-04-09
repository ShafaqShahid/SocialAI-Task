/*
 * MiniSociali — a tiny stand-in for the Sociali product, used as the
 * subject-under-test for the QA take-home assignment.
 *
 * Intentionally small: single file, in-memory storage, no external services.
 *
 * DO NOT USE THIS IN PRODUCTION. It contains deliberate quality gaps so that
 * candidates can demonstrate how they find and report issues.
 */

const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// In-memory "database"
// ---------------------------------------------------------------------------
/** @type {Map<string, { id: string, email: string, password: string }>} */
const users = new Map();
/** @type {Map<string, string>} userId by token */
const sessions = new Map();
/** @type {Map<string, { id: string, userId: string, title: string, content: string, platform: string, scheduledAt: string | null, createdAt: string }>} */
const posts = new Map();

const ALLOWED_PLATFORMS = ['facebook', 'instagram', 'linkedin', 'threads'];
const MAX_TITLE_LENGTH = 280;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function id() {
  return crypto.randomBytes(8).toString('hex');
}

function makeToken(userId) {
  const token = crypto.randomBytes(16).toString('hex');
  sessions.set(token, userId);
  return token;
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }
  const userId = sessions.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.userId = userId;
  next();
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptimeMs: Math.round(process.uptime() * 1000) });
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = [...users.values()].find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const user = { id: id(), email, password };
  users.set(user.id, user);
  const token = makeToken(user.id);
  return res.status(201).json({ token, userId: user.id });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  // BUG (seeded): login accepts an empty / missing password silently when
  // the stored user was registered with one. Intentionally loose check.
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = [...users.values()].find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (password !== undefined && password !== '' && user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = makeToken(user.id);
  return res.json({ token, userId: user.id });
});

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------
app.get('/api/posts', authMiddleware, (req, res) => {
  // Spec says: returns only the authenticated user's posts, paginated (limit=20).
  // BUG (seeded): pagination is not honored even when ?limit / ?offset are passed.
  const mine = [...posts.values()].filter((p) => p.userId === req.userId);
  res.json({ posts: mine, total: mine.length });
});

app.post('/api/posts', authMiddleware, (req, res) => {
  const { title, content, platform } = req.body || {};

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required' });
  }
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content is required' });
  }

  // BUG (seeded): title length limit is advertised as 280 in the spec but not enforced here.
  // BUG (seeded): platform is not validated against ALLOWED_PLATFORMS.
  const post = {
    id: id(),
    userId: req.userId,
    title,
    content,
    platform: platform || 'facebook',
    scheduledAt: null,
    createdAt: new Date().toISOString(),
  };
  posts.set(post.id, post);
  res.status(201).json(post);
});

app.get('/api/posts/:id', authMiddleware, (req, res) => {
  const post = posts.get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  // BUG (seeded): missing ownership check — any authenticated user can read any post (IDOR).
  res.json(post);
});

app.put('/api/posts/:id', authMiddleware, (req, res) => {
  const post = posts.get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (post.userId !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { title, content, platform } = req.body || {};
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  if (platform !== undefined) post.platform = platform;
  res.json(post);
});

app.delete('/api/posts/:id', authMiddleware, (req, res) => {
  // BUG (seeded): returns 204 even when the post does not exist — should be 404.
  const post = posts.get(req.params.id);
  if (post && post.userId !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  posts.delete(req.params.id);
  res.status(204).send();
});

app.post('/api/posts/:id/schedule', authMiddleware, (req, res) => {
  const post = posts.get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (post.userId !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { scheduledAt } = req.body || {};
  if (!scheduledAt || isNaN(Date.parse(scheduledAt))) {
    return res.status(400).json({ error: 'scheduledAt must be a valid ISO date' });
  }
  // BUG (seeded): past dates are accepted even though the spec forbids them.
  post.scheduledAt = scheduledAt;
  res.json(post);
});

// ---------------------------------------------------------------------------
// Debug endpoint (for bonus: backend state assertions)
// ---------------------------------------------------------------------------
app.get('/api/_debug/state', (_req, res) => {
  res.json({
    users: users.size,
    sessions: sessions.size,
    posts: [...posts.values()],
    allowedPlatforms: ALLOWED_PLATFORMS,
    maxTitleLength: MAX_TITLE_LENGTH,
  });
});

app.post('/api/_debug/reset', (_req, res) => {
  users.clear();
  sessions.clear();
  posts.clear();
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`MiniSociali listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
