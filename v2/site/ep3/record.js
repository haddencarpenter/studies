const { chromium } = require('/Users/secure/projects/scraper-test/node_modules/playwright');

(async () => {
  // Film runtime: 192s after text trim + tight padding. Buffer = 200s.
  const DURATION_MS = 200000;
  const OUTPUT_DIR = './video/';

  console.log('Launching browser at 1920x1080...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUTPUT_DIR, size: { width: 1920, height: 1080 } }
  });

  const page = await context.newPage();
  console.log('Navigating to film (?autoplay)...');
  await page.goto('http://localhost:8901/ep3/index.html?autoplay');

  // Wait for the film to load
  await page.waitForTimeout(1000);

  console.log(`Recording for ${DURATION_MS / 1000}s...`);
  const start = Date.now();

  // Log progress every 30s
  const interval = setInterval(() => {
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`  ${elapsed}s / ${DURATION_MS / 1000}s`);
  }, 30000);

  await page.waitForTimeout(DURATION_MS);
  clearInterval(interval);

  console.log('Stopping recording...');
  await context.close();
  await browser.close();

  console.log(`Done. Video saved to ${OUTPUT_DIR}`);
})();
