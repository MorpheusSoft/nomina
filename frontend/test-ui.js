const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Login directly by setting JWT token
  await page.goto('http://localhost:3000');
  
  const token = require('jsonwebtoken').sign({ sub: '123', email: 'admin@nebulapayrolls.com', tenantId: '91be4f61-2483-4a1d-a3d8-5b128c706fe5', roleId: 'admin', permissions: ['ALL_ACCESS'] }, process.env.JWT_SECRET || 'nebulapay_super_secret_key_2026');
  
  await page.evaluate((t) => {
    localStorage.setItem('access_token', t);
    localStorage.setItem('user', JSON.stringify({ name: 'Admin' }));
  }, token);
  
  await page.goto('http://localhost:3000/settings/concepts');
  
  // Intercept the API response to see what exactly fails
  page.on('response', async (response) => {
    if (response.url().includes('generate-concept')) {
      console.log('API STATUS:', response.status());
      try {
        const body = await response.text();
        console.log('API BODY:', body.substring(0, 500));
      } catch(e) {
        console.log('Could not read body');
      }
    }
  });

  console.log("Clicking Oracle button...");
  await page.click('text="Asistente de Creación IA"');
  await page.fill('input[placeholder*="Bono"]', 'Bono sujeto a ISLR de $50');
  await page.click('button:has(i.pi-send)');
  
  await page.waitForTimeout(10000); // Wait for response
  await browser.close();
})();
