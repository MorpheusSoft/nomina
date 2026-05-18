const puppeteer = require('puppeteer');

async function run() {
  console.log("Starting Chrome...");
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/login');
  
  // Login
  await page.type('input[type="email"]', 'admin@nebula.com');
  await page.type('input[type="password"]', 'admin');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
  console.log("Logged in!");
  
  await page.goto('http://localhost:3000/settings/concepts');
  await page.waitForSelector('.pi-sparkles');
  console.log("On Concepts page");

  // Open Oracle Dialog
  await page.click('button:has(.pi-sparkles)');
  
  // Wait for dialog
  await page.waitForTimeout(1000);
  
  // Type in textarea
  await page.type('textarea[placeholder*="Escribe"]', 'Bono nocturno');
  
  // Click send button
  await page.click('button.bg-indigo-600');
  
  console.log("Sent request, waiting for response or error...");
  await page.waitForTimeout(5000);
  
  await browser.close();
}
run().catch(console.error);
