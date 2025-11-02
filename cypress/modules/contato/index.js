import data from "../../fixtures/example.json";

class Contato {
  navegarParaFaleConosco() {
    cy.get('[href*="/contact"]').click();
    cy.url().should('include', '/contact_us');
  }

  preencherFormularioContato() {
    cy.fixture('example.json').as('arquivo1');
    cy.get('[data-qa="name"]').type(data.name);
    cy.get('[data-qa="email"]').type(data.email);
    cy.get('[data-qa="subject"]').type(data.subject);

    cy.get('input[name="upload_file"]').selectFile('@arquivo1');

    cy.get('[data-qa="submit-button"]').click();
  }
}

export default new Contato();