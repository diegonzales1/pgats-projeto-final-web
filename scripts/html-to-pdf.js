const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function htmlToPdf(inputHtml, outputPdf) {
  if (!fs.existsSync(inputHtml)) {
    console.error('Arquivo HTML não encontrado:', inputHtml);
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.goto('file://' + path.resolve(inputHtml), { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPdf,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
    });

    console.log('PDF gerado em', outputPdf);
  } finally {
    await browser.close();
  }
}

const [,, input, output] = process.argv;
if (!input || !output) {
  console.error('Uso: node html-to-pdf.js <input.html> <output.pdf>');
  process.exit(1);
}

htmlToPdf(input, output).catch(err => {
  console.error(err);
  process.exit(1);
});
