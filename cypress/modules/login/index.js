var Chance = require('chance');

class Login {
  preencherFormularioDePreCadastro(name, email) {
    let chance = new Chance();

    if (!name) {
      name = chance.name();
    }

    if (!email) {
      email = chance.email();
    }

    cy.get('input[data-qa="signup-name"]').type(name);
    cy.get('input[data-qa="signup-email"]').type(email);

    cy.get('button[data-qa="signup-button"]').click();
    cy.url().should('include', '/signup');
  }

  fazerLogin(email, password) {
    if (email) cy.get('input[data-qa="login-email"]').clear().type(email);
    if (password)
      cy.get('input[data-qa="login-password"]')
        .clear()
        .type(password, { log: false });
    cy.get('[data-qa="login-button"]').click();
  }

  tentarfazerLoginErro(email, password) {
    fazerLogin(email, password);
  }
}

export default new Login();
