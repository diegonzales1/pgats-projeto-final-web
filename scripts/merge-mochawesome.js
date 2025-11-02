const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const reportDir = path.resolve(process.cwd(), 'mochawesome-report');

if (!fs.existsSync(reportDir)) {
  console.log('Diretório mochawesome-report não existe. Pulando merge.');
  process.exit(0);
}

const jsonFiles = fs.readdirSync(reportDir).filter(f => f.endsWith('.json') && f !== 'mochawesome.json');
if (jsonFiles.length === 0) {
  console.log('Nenhum arquivo JSON de relatório encontrado. Pulando merge.');
  process.exit(0);
}

try {
  console.log('Arquivos JSON encontrados:', jsonFiles.join(', '));
  // Use npx mochawesome-merge and redirect output to mochawesome.json
  const cmd = 'npx mochawesome-merge mochawesome-report/*.json > mochawesome-report/mochawesome.json';
  child_process.execSync(cmd, { stdio: 'inherit', shell: true });
  console.log('Merge concluído com sucesso.');
  process.exit(0);
} catch (err) {
  console.error('Falha ao mesclar reports:', err && err.message ? err.message : err);
  process.exit(1);
}
