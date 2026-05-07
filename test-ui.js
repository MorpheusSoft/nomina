const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/login');
  await page.type('input[type="email"]', 'admin@nebulapayrolls.com');
  await page.type('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  await page.goto('http://localhost:3000/admin/tenants');
  await page.waitForSelector('.pi-pencil');
  
  await page.click('.pi-pencil');
  await page.waitForSelector('#pdfUpload', { hidden: true });
  
  const elementHandle = await page.$('#pdfUpload');
  await elementHandle.uploadFile('/home/lzambrano/Tempo/CONTRATO PETROLERO 2019-2021.pdf');
  
  page.on('dialog', async dialog => {
    console.log('Dialog:', dialog.message());
    await dialog.accept();
  });
  
  await page.waitForFunction(() => {
    const textarea = document.querySelector('textarea[placeholder*="Ej: El tiempo de viaje"]');
    return textarea && textarea.value.length > 1000;
  }, { timeout: 15000 });
  console.log('Text populated.');
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.textContent.includes('Actualizar Límites'));
    if(saveBtn) saveBtn.click();
  });
  
  await page.waitForTimeout(3000);
  
  const errorMsg = await page.evaluate(() => {
    const errEl = document.querySelector('.p-message-error .p-message-text');
    return errEl ? errEl.textContent : null;
  });
  
  if (errorMsg) {
    console.error('UI ERROR:', errorMsg);
  } else {
    console.log('No error message visible.');
  }

  await browser.close();
})();
