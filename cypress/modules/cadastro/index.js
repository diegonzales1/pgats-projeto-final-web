var Chance = require('chance');

class Cadastro {
  preencherFormularioCadastro() {
    const chance = new Chance();

    cy.get('#id_gender2').click();
    cy.get('input[data-qa="password"]').type('123456', { log: false });
    cy.get('select[data-qa="days"]').select('25');
    cy.get('select[data-qa="months"]').select('December');
    cy.get('select[data-qa="years"]').select('2002');
    cy.get('input[type=checkbox]#newsletter').check();
    cy.get('input[type=checkbox]#optin').check();
    cy.get('input#first_name').type(chance.first());
    cy.get('input#last_name').type(chance.last());
    cy.get('input#company').type(`PÓS ${chance.company()}`);
    cy.get('input#address1').type(chance.address());
    cy.get('input#address2').type(
      chance.string({ length: 6, pool: 'abcdef0123456789' }),
    );
    cy.get('select[data-qa="country"]').select('India');
    cy.get('input[data-qa="state"]').type(chance.state());
    cy.get('[data-qa="city"]').type(chance.city());
    cy.get('[data-qa="zipcode"]').type(chance.zip());
    cy.get('[data-qa="mobile_number"]').type('551599999999');
    cy.get('[data-qa="create-account"]').click();
  }
}

export default new Cadastro();
