const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Similar to generate-report-pdf.js but does NOT expand collapse sections or replace anchors.
const reportDir = path.resolve(process.cwd(), 'mochawesome-report');
if (!fs.existsSync(reportDir)) {
  console.error('Diretório mochawesome-report não existe:', reportDir);
  process.exit(2);
}

const htmlFiles = fs.readdirSync(reportDir)
  .filter(f => f.toLowerCase().endsWith('.html'))
  .map(f => ({ name: f, path: path.join(reportDir, f), mtime: fs.statSync(path.join(reportDir, f)).mtime.getTime() }))
  .sort((a,b) => b.mtime - a.mtime);

if (htmlFiles.length === 0) {
  console.error('Nenhum arquivo HTML de relatório encontrado em', reportDir);
  process.exit(2);
}

const found = htmlFiles[0].path;
const outputPdf = process.argv[2] || path.join(reportDir, 'report-compact.pdf');

console.log('Usando arquivo HTML:', found);
console.log('Gerando PDF compacto em:', outputPdf);

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('file://' + found, { waitUntil: 'networkidle0' });

    // Inject print CSS to reduce margins and hide expanded areas by default
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        @media print { .collapse { display: none !important; } }
        .mochawesome-attachment, .attachment { display: none !important; }
      `;
      document.head.appendChild(style);
    });

    await page.pdf({ path: outputPdf, format: 'A4', printBackground: true, margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' } });
    await browser.close();
    console.log('PDF compacto gerado em', outputPdf);
    process.exit(0);
  } catch (err) {
    console.error('Erro ao gerar PDF compacto:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
