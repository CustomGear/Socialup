const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.goto('file://' + path.resolve(__dirname, 'og-template.html'), { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.resolve(__dirname, 'og-image.png') });
  await browser.close();
  console.log('Done → og-image.png');
})();
