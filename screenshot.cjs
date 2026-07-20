const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.type(), msg.text());
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  await page.goto('http://localhost:3000/nisathon', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'screenshot.png' });
  
  // also dump the DOM to see if it's empty
  const html = await page.content();
  console.log("HTML length:", html.length);
  if (html.length < 2000) {
     console.log("HTML content:", html);
  }
  
  await browser.close();
})();
