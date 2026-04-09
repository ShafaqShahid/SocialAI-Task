const assert = require('assert');

function assertErrorShape(body) {
  assert.ok(body, 'expected an error response body');
  assert.strictEqual(typeof body.error, 'string', 'expected an error string');
}

function assertAuthSuccess(body) {
  assert.ok(body.token, 'expected a token');
  assert.strictEqual(typeof body.userId, 'string', 'expected a string userId');
}

function assertPostShape(post, expectedUserId) {
  assert.ok(post.id, 'expected post id');
  assert.strictEqual(post.userId, expectedUserId, 'expected userId to match token owner');
  assert.strictEqual(typeof post.title, 'string', 'expected title to be a string');
  assert.strictEqual(typeof post.content, 'string', 'expected content to be a string');
  assert.strictEqual(typeof post.platform, 'string', 'expected platform to be a string');
  assert.ok(typeof post.createdAt === 'string', 'expected createdAt to be an ISO string');
}

module.exports = {
  assertAuthSuccess,
  assertErrorShape,
  assertPostShape
};
