const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const { validPost, validUser } = require('../../data/testData');
const {
  assertAuthSuccess,
  assertErrorShape,
  assertPostShape
} = require('../../helpers/assertions/apiAssertions');

function relativeIso(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

Given('an API user payload', function () {
  this.memory.user = validUser();
});

Given('the user is registered through the API', async function () {
  await this.api.register(this.memory.user);
  this.memory.userId = this.api.lastBody.userId;
  this.memory.userToken = this.api.lastBody.token;
  this.api.setToken(this.memory.userToken);
});

Given('a registered API user', async function () {
  this.memory.firstUser = validUser();
  await this.api.register(this.memory.firstUser);
  this.memory.firstUserId = this.api.lastBody.userId;
  this.memory.firstUserToken = this.api.lastBody.token;
  this.api.setToken(this.memory.firstUserToken);
});

Given('another registered API user', async function () {
  const currentToken = this.api.token;
  this.memory.secondUser = validUser();
  await this.api.register(this.memory.secondUser);
  this.memory.secondUserId = this.api.lastBody.userId;
  this.memory.secondUserToken = this.api.lastBody.token;
  this.api.setToken(currentToken || this.memory.firstUserToken || this.memory.userToken || null);
});

Given('the user has an existing post', async function () {
  this.api.setToken(this.memory.firstUserToken || this.memory.userToken);
  await this.api.createPost(validPost());
  this.memory.createdPost = this.api.lastBody;
});

Given('the second user has an existing post', async function () {
  const currentToken = this.api.token;
  this.api.setToken(this.memory.secondUserToken);
  await this.api.createPost(validPost({ title: 'Second user post' }));
  this.memory.secondUserPost = this.api.lastBody;
  this.api.setToken(currentToken || this.memory.firstUserToken || null);
});

Given('the user has created {int} posts', async function (count) {
  this.api.setToken(this.memory.firstUserToken || this.memory.userToken);
  for (let index = 0; index < count; index += 1) {
    await this.api.createPost(validPost({ title: `Post ${index + 1}` }));
  }
});

When('the client requests the health endpoint', async function () {
  await this.api.health();
});

When('the client registers the user', async function () {
  await this.api.register(this.memory.user);
});

When('the client logs in with the same credentials', async function () {
  await this.api.login(this.memory.user);
});

When('the client registers with email {string} and password {string}', async function (email, password) {
  await this.api.register({ email, password });
});

When('the client logs in with email and password {string}', async function (password) {
  await this.api.login({ email: this.memory.user.email, password });
});

When('the client logs in without a password', async function () {
  await this.api.login({ email: this.memory.user.email });
});

When('the client registers the same user again', async function () {
  await this.api.register(this.memory.user);
});

When('the client lists posts without authentication', async function () {
  this.api.setToken(null);
  await this.api.listPosts();
});

When('the first user creates a valid post', async function () {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.createPost(validPost({ title: 'First user post' }));
});

When('the second user creates a valid post', async function () {
  this.api.setToken(this.memory.secondUserToken);
  await this.api.createPost(validPost({ title: 'Second user post' }));
});

When('the first user lists posts', async function () {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.listPosts();
});

When('the user creates a post without a title', async function () {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.createPost({ content: 'Missing title', platform: 'facebook' });
});

When('the user creates a post without content', async function () {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.createPost({ title: 'Missing content', platform: 'facebook' });
});

When('the user creates a post with a title longer than 280 characters', async function () {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.createPost(validPost({ title: 'a'.repeat(281) }));
});

When('the user creates a post with unsupported platform {string}', async function (platform) {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.createPost(validPost({ platform }));
});

When('the user lists posts with limit {int} and offset {int}', async function (limit, offset) {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.listPosts(`?limit=${limit}&offset=${offset}`);
});

When('the user fetches the created post', async function () {
  this.api.setToken(this.memory.firstUserToken || this.memory.userToken);
  await this.api.getPost(this.memory.createdPost.id);
});

When('the user updates the created post title to {string}', async function (title) {
  this.api.setToken(this.memory.firstUserToken || this.memory.userToken);
  await this.api.updatePost(this.memory.createdPost.id, { title });
});

When('the first user fetches the second user\'s post', async function () {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.getPost(this.memory.secondUserPost.id);
});

When('the first user updates the second user\'s post title to {string}', async function (title) {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.updatePost(this.memory.secondUserPost.id, { title });
});

When('the user deletes the created post', async function () {
  this.api.setToken(this.memory.firstUserToken || this.memory.userToken);
  await this.api.deletePost(this.memory.createdPost.id);
});

When('the user deletes post id {string}', async function (postId) {
  this.api.setToken(this.memory.firstUserToken || this.memory.userToken);
  await this.api.deletePost(postId);
});

When('the user schedules the created post {int} day in the future', async function (days) {
  this.api.setToken(this.memory.firstUserToken || this.memory.userToken);
  await this.api.schedulePost(this.memory.createdPost.id, { scheduledAt: relativeIso(days) });
});

When('the user schedules the created post {int} day in the past', async function (days) {
  this.api.setToken(this.memory.firstUserToken || this.memory.userToken);
  await this.api.schedulePost(this.memory.createdPost.id, { scheduledAt: relativeIso(days * -1) });
});

When('the user schedules the created post with invalid date {string}', async function (dateString) {
  this.api.setToken(this.memory.firstUserToken || this.memory.userToken);
  await this.api.schedulePost(this.memory.createdPost.id, { scheduledAt: dateString });
});

When('the first user schedules the second user\'s post {int} day in the future', async function (days) {
  this.api.setToken(this.memory.firstUserToken);
  await this.api.schedulePost(this.memory.secondUserPost.id, { scheduledAt: relativeIso(days) });
});

Then('the API response status should be {int}', function (statusCode) {
  assert.strictEqual(this.api.lastResponse.status(), statusCode);
});

Then('the health response should report service uptime', function () {
  assert.strictEqual(this.api.lastBody.status, 'ok');
  assert.strictEqual(typeof this.api.lastBody.uptimeMs, 'number');
});

Then('the auth response should contain a token and user id', function () {
  assertAuthSuccess(this.api.lastBody);
});

Then('the API error response should contain a message', function () {
  assertErrorShape(this.api.lastBody);
});

Then('only the first user\'s posts should be returned', function () {
  assert.ok(Array.isArray(this.api.lastBody.posts));
  assert.ok(this.api.lastBody.posts.length >= 1);
  assert.ok(this.api.lastBody.posts.every((post) => post.userId === this.memory.firstUserId));
});

Then('exactly {int} post should be returned', function (count) {
  assert.strictEqual(this.api.lastBody.posts.length, count);
});

Then('the post response should match the created user', function () {
  assertPostShape(this.api.lastBody, this.memory.firstUserId || this.memory.userId);
});

Then('the response post title should be {string}', function (title) {
  assert.strictEqual(this.api.lastBody.title, title);
});

Then('the scheduledAt field should be populated', function () {
  assert.ok(this.api.lastBody.scheduledAt);
});
