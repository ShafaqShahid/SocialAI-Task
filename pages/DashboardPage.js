class DashboardPage {
  constructor(page) {
    this.page = page;
    this.dashboard = page.getByTestId('dashboard');
    this.logoutButton = page.getByTestId('logout-btn');
    this.titleInput = page.getByTestId('title-input');
    this.contentInput = page.getByTestId('content-input');
    this.platformSelect = page.getByTestId('platform-select');
    this.createButton = page.getByTestId('create-btn');
    this.createError = page.getByTestId('create-error');
    this.postsList = page.getByTestId('posts-list');
  }

  async createPost({ title, content, platform }) {
    await this.titleInput.fill(title);
    await this.contentInput.fill(content);
    await this.platformSelect.selectOption(platform);
    await this.createButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  postItemByTitle(title) {
    return this.postsList.locator('.post').filter({ hasText: title });
  }
}

module.exports = { DashboardPage };
