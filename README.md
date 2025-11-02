# pgats-projeto-final-de-web

Projeto final de automação web com Cypress.

Como gerar relatórios (PDF)

- Instale dependências:

```bash
npm install
# pgats-projeto-final-de-web

Projeto final de automação web com Cypress (exercício acadêmico).

Conteúdo do repositório (resumo das pastas importantes)

- `cypress/` — código do Cypress (specs, fixtures, support, screenshots geradas durante execução).
	- `cypress/e2e/` — specs (testes end-to-end).
	- `cypress/fixtures/` — fixtures de teste.
	- `cypress/screenshots/` — screenshots gerados pelo Cypress (copiados para o relatório quando aplicável).
	- `cypress/support/` — comandos e configuração de suporte (ex.: `e2e.js`, `commands.js`).
- `mochawesome-report/` — saída do mochawesome (HTML, JSON, assets e PDFs gerados).
- `scripts/` — utilitários que criamos para gerar/mesclar relatórios e converter HTML → PDF:
	- `generate-report-pdf.js` — gera PDF com seções expandidas (detalhes e screenshots visíveis).
	- `generate-report-pdf-compact.js` — gera PDF compacto (detalhes colapsados, menos imagens).
	- `html-to-pdf.js` — conversor simples que usa Puppeteer (usado internamente pelos geradores).
	- `merge-mochawesome.js` — merge seguro dos JSONs do mochawesome (evita erro quando não há JSONs válidos).
- `package.json` — scripts e dependências do projeto.

Pré-requisitos

- Node.js >= 16 (recomendado) e npm
- Acesso à internet na primeira execução (Puppeteer baixa o Chromium na instalação)

Instalação

```bash
npm install
```

Scripts principais

- `npm run cypress:open` — abre o Cypress Test Runner interativo.
- `npm run cypress:run` — executa os testes no modo headless (este projeto tem um script legacy que grava logs).
- `npm run test:report` — executa os testes com o `cypress-mochawesome-reporter` e gera o PDF compacto do relatório em `mochawesome-report/report.pdf` (padrão).
- `npm run test:report-compact` — executa os testes e gera `mochawesome-report/report-compact.pdf`.
- `npm run test:report:pdf` — gera apenas o PDF compacto a partir do HTML existente (não executa os testes).
- `npm run test:report:pdf-compact` — gera `report-compact.pdf` a partir do HTML existente.

Comandos manuais úteis

- Gerar apenas o PDF compacto a partir do HTML mais recente (rápido):

```bash
node scripts/generate-report-pdf-compact.js mochawesome-report/report-compact.pdf
```

- Gerar o PDF expandido (detalhes e screenshots visíveis):

```bash
node scripts/generate-report-pdf.js mochawesome-report/report.pdf
```

Onde encontrar o relatório

- HTML gerado: `mochawesome-report/index.html` ou `mochawesome-report/index_00X.html` (abra no navegador para inspecionar interativamente).
- PDFs gerados:
	- compacto (padrão): `mochawesome-report/report.pdf`
	- compacto (alternativo): `mochawesome-report/report-compact.pdf`

Notas e troubleshooting

- Se `npm run test:report` falhar ao mesclar JSONs com erro "Unexpected end of JSON input", rode:

```bash
npm run test:report:run
node scripts/merge-mochawesome.js
npm run test:report:html
node scripts/generate-report-pdf-compact.js mochawesome-report/report.pdf
```

- Se o Puppeteer falhar na instalação por limite de espaço, considere usar `puppeteer-core` e apontar para um Chrome/Chromium já instalado no sistema.
- Em Windows com caminhos que contêm espaços (OneDrive etc.), os scripts foram ajustados para evitar problemas de quoting; use `npm run` normalmente.

Contribuição / notas finais

Sinta-se à vontade para abrir issues/PRs se quiser adicionar mais automações (ex.: attach do PDF no CI). Posso também adicionar um workflow GitHub Actions para rodar os testes automaticamente e anexar o PDF como artifact no build.
# pgats-projeto-final-web
