import puppeteer from 'puppeteer';

(async () => {
  console.log('Lanzando navegador...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 2 });
  
  console.log('Cargando la página local...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  // Imponer renderizado de colores y quitar márgenes extra
  await page.addStyleTag({ content: `
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page {
        size: letter portrait;
        margin: 0;
      }
    }
  `});

  console.log('Generando PDF vertical...');
  await page.pdf({
    path: '/home/lzambrano/Documents/Nebula_Flyer_Vertical.pdf',
    printBackground: true,
    format: 'Letter',
    landscape: false,
    scale: 0.75, // Escalar el diseño ancho para que entre perfecto en la orientación vertical
    pageRanges: '1' // Evitar que se parta en más páginas
  });

  console.log('Generando PNG completo...');
  await page.screenshot({
    path: '/home/lzambrano/Documents/Nebula_Flyer_Completo.png',
    fullPage: true
  });

  await browser.close();
  console.log('PDF Vertical guardado en /home/lzambrano/Documents/Nebula_Flyer_Vertical.pdf');
})();
