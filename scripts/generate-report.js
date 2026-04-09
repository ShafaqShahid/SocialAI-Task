const fs = require('fs');
const path = require('path');
const report = require('multiple-cucumber-html-reporter');
const convert = require('cucumber-junit');

const reportsDir = path.resolve(__dirname, '..', 'reports');
const jsonPath = path.join(reportsDir, 'cucumber-report.json');
const htmlDir = path.join(reportsDir, 'html');
const junitPath = path.join(reportsDir, 'junit.xml');

if (!fs.existsSync(jsonPath)) {
  console.error(`Cucumber JSON report not found at ${jsonPath}`);
  process.exit(1);
}

fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(htmlDir, { recursive: true });

const json = fs.readFileSync(jsonPath, 'utf8');
const junitXml = convert(json, 'MiniSociali QA Automation');
fs.writeFileSync(junitPath, junitXml);

report.generate({
  jsonDir: reportsDir,
  reportPath: htmlDir,
  metadata: {
    browser: {
      name: 'chromium',
      version: 'managed-by-playwright'
    },
    device: 'Local or CI runner',
    platform: {
      name: process.platform,
      version: process.version
    }
  },
  customData: {
    title: 'Execution Summary',
    data: [
      { label: 'Project', value: 'MiniSociali QA Automation' },
      { label: 'Framework', value: 'Playwright + Cucumber + JavaScript' }
    ]
  }
});

console.log(`Generated HTML report at ${path.join(htmlDir, 'index.html')}`);
