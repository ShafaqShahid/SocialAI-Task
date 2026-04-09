module.exports = {
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:4000',
    browserName: 'chromium',
    headless: process.env.HEADED !== 'true',
    actionTimeout: 10000,
    navigationTimeout: 15000,
    traceDir: 'reports/traces',
    screenshotDir: 'reports/screenshots'
  }
};
