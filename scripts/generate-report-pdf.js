const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// Find an HTML report file inside mochawesome-report (pick latest modified .html)
const reportDir = path.resolve(process.cwd(), 'mochawesome-report');
if (!fs.existsSync(reportDir)) {
  console.error('Diretório mochawesome-report não existe:', reportDir);
  process.exit(2);
}

const htmlFiles = fs.readdirSync(reportDir)
  .filter(f => f.toLowerCase().endsWith('.html'))
  .map(f => ({
    name: f,
    path: path.join(reportDir, f),
    mtime: fs.statSync(path.join(reportDir, f)).mtime.getTime()
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (htmlFiles.length === 0) {
  console.error('Nenhum arquivo HTML de relatório encontrado em', reportDir);
  process.exit(2);
}

const found = htmlFiles[0].path; // latest html
const outputPdf = process.argv[2] || path.join(reportDir, 'report.pdf');

console.log('Usando arquivo HTML:', found);
console.log('Gerando PDF em:', outputPdf);

// call the converter script (puppeteer) but first open the HTML in a headless browser
const converter = path.join(__dirname, 'html-to-pdf.js');
// We'll open the HTML in puppeteer, expand failed tests and screenshots, then print PDF
const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('file://' + found, { waitUntil: 'networkidle0' });

    // Expand failed tests and any sections that include screenshots
    await page.evaluate(() => {
      try {
        // Expand any Bootstrap-like collapse elements
        document.querySelectorAll('.collapse').forEach(el => {
          el.classList.add('show');
          el.style.display = 'block';
        });

        // Mark any toggles as expanded
        document.querySelectorAll('[aria-expanded="false"]').forEach(el => el.setAttribute('aria-expanded', 'true'));

        // Specifically try to expand tests that are marked failed or contain screenshots
        const candidates = [];
        // elements with class names containing 'fail' or 'failed'
        document.querySelectorAll('[class*=fail], [class*=failed]').forEach(el => candidates.push(el));
        // elements that contain images (screenshots)
        document.querySelectorAll('img').forEach(img => {
          let ancestor = img.closest('div') || img.parentElement;
          if (ancestor) candidates.push(ancestor);
        });

        candidates.forEach(node => {
          // find nearest collapsible content inside this node
          const collapse = node.querySelector('.collapse') || node.closest('.panel') && node.closest('.panel').querySelector('.collapse');
          if (collapse) {
            collapse.classList.add('show');
            collapse.style.display = 'block';
          }
          // also expand any child elements that look like a details block
          node.querySelectorAll('[class*=details], [class*=content]').forEach(c => { c.style.display = 'block'; });
        });
      } catch (e) {
        // ignore DOM errors
        // fallback: ensure all details are visible
        document.querySelectorAll('details').forEach(d => d.open = true);
      }
    });

    // Wait for images (screenshots) to load
    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => { img.onload = img.onerror = res; });
      }));
    });

    // Replace anchor links to screenshots with inline <img> so they appear in PDF
    // First, create a map of screenshot filenames -> data URLs (base64) from the report screenshots folder
    const fs = require('fs');
    const path = require('path');
  const screenshotDir = path.join(process.cwd(), 'mochawesome-report', 'screenshots');
    const embedMap = {};
    if (fs.existsSync(screenshotDir)) {
      const walk = (dir, relBase = '') => {
        fs.readdirSync(dir).forEach(name => {
          const full = path.join(dir, name);
          const stat = fs.statSync(full);
          if (stat.isDirectory()) return walk(full, path.join(relBase, name));
          const lower = name.toLowerCase();
          if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif')) {
            try {
              const data = fs.readFileSync(full);
              const ext = path.extname(name).slice(1);
              const dataUrl = `data:image/${ext};base64,${data.toString('base64')}`;
              // keys to match: basename, relative path from screenshots (with and without \)
              embedMap[name] = dataUrl;
              const rel = path.join('screenshots', relBase, name).replace(/\\/g, '/');
              embedMap[rel] = dataUrl;
              embedMap[rel.replace(/\//g, '\\')] = dataUrl;
            } catch (e) {
              // ignore read errors
            }
          }
        });
      };
      walk(screenshotDir);
    }
    // also include screenshots from cypress default folder
    const cypressScreens = path.join(process.cwd(), 'cypress', 'screenshots');
    if (fs.existsSync(cypressScreens)) {
      const walk2 = (dir, relBase = '') => {
        fs.readdirSync(dir).forEach(name => {
          const full = path.join(dir, name);
          const stat = fs.statSync(full);
          if (stat.isDirectory()) return walk2(full, path.join(relBase, name));
          const lower = name.toLowerCase();
          if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif')) {
            try {
              const data = fs.readFileSync(full);
              const ext = path.extname(name).slice(1);
              const dataUrl = `data:image/${ext};base64,${data.toString('base64')}`;
              embedMap[name] = dataUrl;
              const rel = path.join('screenshots', relBase, name).replace(/\\/g, '/');
              embedMap[rel] = dataUrl;
              embedMap[rel.replace(/\//g, '\\')] = dataUrl;
            } catch (e) {
              // ignore
            }
          }
        });
      };
      walk2(cypressScreens);
    }

    await page.evaluate((embed) => {
      // inject print-friendly css
      const style = document.createElement('style');
      style.innerHTML = `
        img { max-width: 100% !important; height: auto !important; display: block !important; }
        .mochawesome-attachment, .attachment, .screenshot { display: block !important; }
        .collapse { display: block !important; }
      `;
      document.head.appendChild(style);

      // make sure collapsible sections and details are visible
      try {
        document.querySelectorAll('.collapse').forEach(el => { el.classList.add('show'); el.style.display = 'block'; });
        document.querySelectorAll('[aria-expanded]').forEach(el => el.setAttribute('aria-expanded', 'true'));
        document.querySelectorAll('details').forEach(d => d.open = true);
      } catch (e) {}

      // replace anchors or imgs that reference screenshot filenames or paths with embedded data URLs
      const all = Array.from(document.querySelectorAll('a, img'));
      all.forEach(node => {
        try {
          const href = node.getAttribute('href') || node.getAttribute('src') || '';
          if (!href) return;
          const cleaned = href.split('?')[0];
          const name = cleaned.split('/').pop().split('\\').pop();
          const candidates = [name, cleaned, cleaned.replace(/\//g,'\\'), cleaned.replace(/\\/g,'/')];
          let dataUrl = null;
          for (const c of candidates) {
            if (embed[c]) { dataUrl = embed[c]; break; }
          }
          if (!dataUrl) {
            // try to find if cleaned includes 'screenshots/' and match key
            const idx = cleaned.toLowerCase().indexOf('screenshots');
            if (idx !== -1) {
              const sub = cleaned.substring(idx);
              if (embed[sub]) dataUrl = embed[sub];
            }
          }
          if (dataUrl) {
            if (node.tagName.toLowerCase() === 'a') {
              const img = document.createElement('img');
              img.src = dataUrl;
              img.alt = name || 'screenshot';
              img.style.maxWidth = '100%';
              node.parentNode.replaceChild(img, node);
            } else if (node.tagName.toLowerCase() === 'img') {
              node.src = dataUrl;
            }
          }
        } catch (e) {
          // ignore
        }
      });

      // attempt to click any toggle buttons that reveal attachments
      try {
        const toggles = document.querySelectorAll('[data-toggle], [data-bs-toggle], .report-toggle, .expand-toggle, .toggle');
        toggles.forEach(t => { try { t.click(); } catch(e){} });
      } catch(e) {}
    }, embedMap);

    await page.pdf({ path: outputPdf, format: 'A4', printBackground: true, margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' } });
    await browser.close();
    console.log('PDF gerado em', outputPdf);
    process.exit(0);
  } catch (err) {
    console.error('Erro ao gerar PDF via puppeteer:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
