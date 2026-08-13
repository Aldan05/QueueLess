const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Capture console messages
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.toString()));
    
    console.log('Navigating to http://localhost:5175 ...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log('Navigating to http://localhost:5175/staff/dashboard ...');
    await page.goto('http://localhost:5175/staff/dashboard', { waitUntil: 'networkidle0', timeout: 10000 });
    
    await browser.close();
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  }
})();
