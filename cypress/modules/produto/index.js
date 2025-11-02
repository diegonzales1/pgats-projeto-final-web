var Chance = require('chance');

class Produtos {
  navegarParaProdutos() {
    cy.get('a[href="/products"]').click();
  }

visualizarDetalheDoProduto(numeroProduto = 1) {
    cy.get(`a[href="/product_details/${numeroProduto}"]`).click();
  }

  pesquisarProdutos(produto) {
    cy.get('[name="search"]').type(produto);
    cy.get("#submit_search > .fa").click();
  }

  adicionarProduto() {
    cy.get(
      ":nth-child(3) > .product-image-wrapper > .single-products > .productinfo > .btn"
    ).click();
  }

  navegarParaCarrinho() {
    cy.get("u").contains("View Cart").click();
  }

  fazerCheckout() {
    cy.get(".btn.btn-default.check_out").click();
  }

  contarProdutos() {
    return cy.get('.features_items .product-image-wrapper');
  }

  preencherFormularioPagamento() {
    cy.get('a[href="/payment"]').click();
    const chance = new Chance();
    cy.get('[data-qa="name-on-card"]').type(chance.first());
    cy.get('[data-qa="card-number"]').type(chance.cc());
    cy.get('[data-qa="cvc"]').type(
      chance.string({ pool: '0123456789', length: 3 })
    );
    cy.get('[data-qa="expiry-month"]').type(
      chance.integer({ min: 1, max: 12 }).toString().padStart(2, '0')
    );
    cy.get('[data-qa="expiry-year"]').type(
      chance.integer({ min: 2025, max: 2035 }).toString()
    );
    cy.get('[data-qa="pay-button"]').click();
  }
}

export default new Produtos();