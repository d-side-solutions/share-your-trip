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
  await page.waitForTimeout(1000);

  const participantInput = page.locator('input[placeholder="Nom du participant"]');
  const addBtn = page.locator('button', { hasText: 'Ajouter un participant' });

  await participantInput.fill('Alice');
  await addBtn.click();
  await page.waitForTimeout(200);

  await participantInput.fill('Bob');
  await addBtn.click();
  await page.waitForTimeout(200);

  await page.locator('.stepper-step', { hasText: 'Trajets' }).click();
  await page.waitForTimeout(300);

  await page.locator('button', { hasText: 'Ajouter un trajet' }).click();
  await page.waitForTimeout(200);

  await page.locator('button', { hasText: 'Ajouter une voiture' }).click();
  await page.waitForTimeout(200);

  // Select driver from the SECOND select on page (first is the language selector)
  const driverSelect = page.locator('.car-card select');
  await driverSelect.selectOption({ index: 1 });
  await page.waitForTimeout(300);

  console.log('--- About to click passenger checkbox label ---');

  // Click the checkbox-label for the remaining participant
  const passengerLabels = page.locator('.car-card .checkbox-label');
  const count = await passengerLabels.count();
  console.log(`Found ${count} passenger checkbox label(s)`);

  if (count > 0) {
    await passengerLabels.first().click();
    await page.waitForTimeout(500);
  }

  const logLines = consoleLogs.map(line => {
    return line.replace('[DEBUG-d845e5] ', '');
  }).join('\n');

  if (logLines.trim()) {
    fs.writeFileSync(LOG_PATH, logLines + '\n');
  }
  console.log(`Collected ${consoleLogs.length} debug log entries:`);
  consoleLogs.forEach(l => console.log(l));

  await browser.close();
})();
