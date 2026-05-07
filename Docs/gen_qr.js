const QRCode = require('qrcode');
const Jimp = require('jimp');

const vcardData = `BEGIN:VCARD
VERSION:3.0
FN:Lindbergh Zambrano
ORG:Nebula Payrolls / MorpheusSoft
TEL;TYPE=WORK,CELL:+584222684691
EMAIL;TYPE=WORK:lzambrano@nebulapayrolls.com
URL:https://www.nebulapayrolls.com
NOTE:Sistema de Automatizacion de Nomina Empresarial.
END:VCARD`;

const opts = {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  margin: 2,
  width: 1200, // Make it high res
  color: {
    dark: '#1e1b4b', // Dark Indigo Navy
    light: '#ffffff'
  }
};

async function generateQRPickleball() {
  try {
    // 1. Generate QR Code buffer
    const qrBuffer = await QRCode.toBuffer(vcardData, opts);
    
    // 2. Read images with Jimp
    const qrImage = await Jimp.read(qrBuffer);
    const logoImage = await Jimp.read('/home/lzambrano/Desarrollo/nomina/Docs/logo_nebula_payrolls_alta_calidad.png');

    // 3. Resize logo (it must not exceed 30% of the QR code's area to maintain readability)
    // The logo is wide, so we make its width about 35% of the QR width.
    const logoWidth = Math.floor(qrImage.bitmap.width * 0.35);
    logoImage.resize(logoWidth, Jimp.AUTO);

    // Create a small white background padding around the logo so it pops out of the QR
    const paddedLogo = new Jimp(logoImage.bitmap.width + 40, logoImage.bitmap.height + 40, '#ffffff');
    paddedLogo.composite(logoImage, 20, 20);

    // 4. Calculate center position
    const x = (qrImage.bitmap.width - paddedLogo.bitmap.width) / 2;
    const y = (qrImage.bitmap.height - paddedLogo.bitmap.height) / 2;

    // 5. Composite logo onto QR Code
    qrImage.composite(paddedLogo, x, y);

    // 6. Save final image
    await qrImage.writeAsync('/home/lzambrano/Desarrollo/nomina/Docs/qr_contacto_manga.png');
    console.log('QR Code with Logo successfully generated!');

  } catch (error) {
    console.error('Error generating QR:', error);
  }
}

generateQRPickleball();
