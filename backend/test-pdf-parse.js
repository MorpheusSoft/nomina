const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
  try {
    const dataBuffer = fs.readFileSync('/home/lzambrano/Tempo/CONTRATO PETROLERO 2019-2021.pdf');
    const data = await pdfParse(dataBuffer);
    console.log("SUCCESS. Length:", data.text.length);
  } catch(e) {
    console.error("ERROR:", e.message);
  }
}
test();
