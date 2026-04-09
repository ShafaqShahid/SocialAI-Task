const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');
const { validPost, validUser } = require('../../data/testData');

Given('the user opens the MiniSociali web app', async function () {
  await this.authPage.open();
});

Given('a user exists for the UI flow', async function () {
  this.memory.uiUser = validUser();
  await this.api.register(this.memory.uiUser);
  this.memory.uiUserId = this.api.lastBody.userId;
});

When('the user registers through the UI', async function () {
  this.memory.uiUser = validUser();
  await this.authPage.register(this.memory.uiUser.email, this.memory.uiUser.password);
});

When('the user logs in through the UI', async function () {
  await this.authPage.login(this.memory.uiUser.email, this.memory.uiUser.password);
});

When('the user logs out', async function () {
  await this.dashboardPage.logout();
});

When('the user logs in with the wrong password', async function () {
  await this.authPage.login(this.memory.uiUser.email, 'wrong-password');
});

When('the user creates a post through the UI', async function () {
  this.memory.uiPost = validPost({
    title: 'UI created post',
    content: 'Created from the browser journey.',
    platform: 'linkedin'
  });
  await this.dashboardPage.createPost(this.memory.uiPost);
});

When('the user submits a post with an empty title', async function () {
  await this.dashboardPage.createPost(validPost({ title: '' }));
});

When('the user creates a script-like post through the UI', async function () {
  this.memory.uiPost = validPost({
    title: '<script>alert(1)</script>',
    content: '<img src=x onerror=alert(1)>',
    platform: 'threads'
  });
  await this.dashboardPage.createPost(this.memory.uiPost);
});

Then('the dashboard should be visible', async function () {
  await expect(this.authPage.dashboard).toBeVisible();
});

Then('the auth card should be visible', async function () {
  await expect(this.authPage.authCard).toBeVisible();
});

Then('the auth error should contain {string}', async function (message) {
  await expect(this.authPage.authError).toContainText(message);
});

Then('the create error should contain {string}', async function (message) {
  await expect(this.dashboardPage.createError).toContainText(message);
});

Then('the new post should appear in the list', async function () {
  const item = this.dashboardPage.postItemByTitle(this.memory.uiPost.title);
  await expect(item).toContainText(this.memory.uiPost.content);
  await expect(item).toContainText(this.memory.uiPost.platform);
});

Then('the post should appear with escaped content', async function () {
  const item = this.dashboardPage.postItemByTitle(this.memory.uiPost.title);
  await expect(item).toContainText('<script>alert(1)</script>');
  await expect(item).toContainText('<img src=x onerror=alert(1)>');
  const html = await item.innerHTML();
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
});

Then('the create form should be cleared', async function () {
  await expect(this.dashboardPage.titleInput).toHaveValue('');
  await expect(this.dashboardPage.contentInput).toHaveValue('');
  await expect(this.dashboardPage.platformSelect).toHaveValue('facebook');
});
