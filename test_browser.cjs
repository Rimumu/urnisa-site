const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.type(), msg.text(), msg.location().url);
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  await page.goto('http://localhost:3000/nisathon', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
