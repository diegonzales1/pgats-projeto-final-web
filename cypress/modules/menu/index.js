var Chance = require('chance');

class Menu {
  navegarParaLogin() {
    cy.get('a[href="/login"]').click();
  }

  logout() {
    cy.get('a[href="/logout"]').should("be.visible").click();
  }

}

export default new Menu();