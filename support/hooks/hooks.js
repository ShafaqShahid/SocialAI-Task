const fs = require('fs');
const path = require('path');
const {
  Before,
  After,
  Status
} = require('@cucumber/cucumber');

const reportsDir = path.resolve(__dirname, '..', '..', 'reports');
const screenshotsDir = path.join(reportsDir, 'screenshots');
const tracesDir = path.join(reportsDir, 'traces');

function safeFileName(name) {
  return name.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
}

Before(async function ({ pickle }) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(tracesDir, { recursive: true });

  await this.initApiContext();
  await this.api.resetState();

  if (pickle.tags.some((tag) => tag.name === '@ui')) {
    await this.initUiContext();
    await this.context.tracing.start({ screenshots: true, snapshots: true });
  }
});

After(async function ({ pickle, result }) {
  const scenarioName = safeFileName(pickle.name);

  if (this.page && result?.status === Status.FAILED) {
    const screenshotPath = path.join(screenshotsDir, `${scenarioName}.png`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.attach(fs.readFileSync(screenshotPath), 'image/png');
  }

  if (this.context) {
    const tracePath = path.join(tracesDir, `${scenarioName}.zip`);
    await this.context.tracing.stop({ path: tracePath });
    await this.page.close();
    await this.context.close();
    await this.browser.close();
    this.page = null;
    this.context = null;
    this.browser = null;
    this.authPage = null;
    this.dashboardPage = null;
  }

  if (this.requestContext) {
    await this.requestContext.dispose();
    this.requestContext = null;
    this.api = null;
  }
});
