import puppeteer from 'puppeteer';

(async () => {
  console.log('Lanzando navegador...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 2 });
  
  console.log('Cargando la página local Performance...');
  await page.goto('http://localhost:5174/performance', { waitUntil: 'networkidle0' });
    
  // Configurar viewport alto para que todo renderice en una pantalla virtual larga (para el PNG completo)
  await page.setViewport({ width: 800, height: 1131, deviceScaleFactor: 2 });
    
  // Esperar a que fuentes/imágenes terminen de pintar
  await new Promise(r => setTimeout(r, 2000));
    
  // Imponer renderizado de colores y quitar márgenes extra
  await page.addStyleTag({ content: `
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  `});

  // 1. PDF Vertical 
  console.log('Generando PDF corporativo...');
  const pdfPath = '/home/lzambrano/Documents/Nebula_Performance_Corporate_Flyer.pdf';
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    scale: 0.99, // Ajuste para que entre perfecto
    pageRanges: '1',
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });

  // 2. PNG Alta Resolución
  console.log('Generando PNG corporativo...');
  const pngPath = '/home/lzambrano/Documents/Nebula_Performance_Corporate_Flyer.png';
  await page.screenshot({
    path: pngPath,
    fullPage: true,
    type: 'png'
  });

  await browser.close();
  console.log('PDF y PNG guardados en /home/lzambrano/Documents/');
})();
