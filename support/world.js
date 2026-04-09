const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { chromium, request } = require('playwright');
const playwrightConfig = require('../playwright.config');
const { ApiClient } = require('../helpers/api/apiClient');
const { AuthPage } = require('../pages/AuthPage');
const { DashboardPage } = require('../pages/DashboardPage');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.parameters = options.parameters || {};
    this.baseURL = playwrightConfig.use.baseURL;
    this.headed = this.parameters.headed === true || process.env.HEADED === 'true';
    this.browser = null;
    this.context = null;
    this.page = null;
    this.requestContext = null;
    this.api = null;
    this.authPage = null;
    this.dashboardPage = null;
    this.memory = {};
  }

  async initApiContext() {
    this.requestContext = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json'
      }
    });
    this.api = new ApiClient(this.requestContext, this.baseURL);
  }

  async initUiContext() {
    this.browser = await chromium.launch({ headless: !this.headed });
    this.context = await this.browser.newContext({
      baseURL: this.baseURL
    });
    this.page = await this.context.newPage();
    this.authPage = new AuthPage(this.page);
    this.dashboardPage = new DashboardPage(this.page);
  }
}

setWorldConstructor(CustomWorld);
