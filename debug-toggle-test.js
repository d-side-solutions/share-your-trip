const { chromium } = require('playwright');
const fs = require('fs');

const LOG_PATH = '/home/dmrrlc/workspace/share-your-trip/.cursor/debug-d845e5.log';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[DEBUG-d845e5]')) {
      consoleLogs.push(text);
    }
  });

  await page.goto('http://localhost:8765');
  await page.waitForTimeout(500);

  // Step 1: Add two participants
  await page.fill('input[placeholder]', 'Alice');
  await page.click('button:has-text("Ajouter un participant")');
  await page.fill('input[placeholder]', 'Bob');
  await page.click('button:has-text("Ajouter un participant")');

  // Go to Step 2
  await page.click('button:has-text("Suivant")');
  await page.waitForTimeout(300);

  // Add a leg
  await page.click('button:has-text("Ajouter un trajet")');
  await page.waitForTimeout(200);

  // Add a car
  await page.click('button:has-text("Ajouter une voiture")');
  await page.waitForTimeout(200);

  // Select Alice as driver
  await page.selectOption('select', { label: 'Alice' });
  await page.waitForTimeout(200);

  // Click on Bob as passenger
  console.log('--- About to click passenger checkbox ---');
  const bobLabel = page.locator('.checkbox-label', { hasText: 'Bob' });
  await bobLabel.click();
  await page.waitForTimeout(500);

  // Write collected console logs to the debug log file
  const logLines = consoleLogs.map(line => {
    const jsonPart = line.replace('[DEBUG-d845e5] ', '');
    return jsonPart;
  }).join('\n');

  fs.writeFileSync(LOG_PATH, logLines + '\n');
  console.log(`Wrote ${consoleLogs.length} debug log entries to ${LOG_PATH}`);
  consoleLogs.forEach(l => console.log(l));

  await browser.close();
})();
