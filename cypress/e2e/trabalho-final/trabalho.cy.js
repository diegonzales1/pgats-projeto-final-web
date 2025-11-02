/// <reference types="cypress" />"
import data from '../../fixtures/example.json';
import menu from '../../modules/menu';
import login from '../../modules/login';
import cadastro from '../../modules/cadastro';
import contato from '../../modules/contato';
import produtos from '../../modules/produto';

/**
 * 
 * Trabalho de Conclusão de Disciplina
  Orientações:

  Descrição do Trabalho de Conclusão
  Trabalho individual.

  Usando a aplicação fictícia Automation Exercise, crie um projeto que implementa os casos descritos na página "Test Cases":

  1, 2, 3, 4, 5, 6, 8, 9, 10 e 15
*/

describe('Validações de usuário - Trabalho Final', () => {
  beforeEach(() => {
    cy.visit('https://automationexercise.com');
    menu.navegarParaLogin();
  });

  it('Test Case 1: Register User', () => {
    login.preencherFormularioDePreCadastro();
    cadastro.preencherFormularioCadastro();

    cy.url().should('include', 'account_created');
    cy.contains('[data-qa="account-created"]', 'Account Created!');
  });

  it('Test Case 2: Login User with correct email and password', () => {
    login.fazerLogin('qa-tester-371@teste.com', 'Teste@1234');

    cy.get('i.fa-user').parent().should('contain', 'QA Tester 371');
    cy.get('a[href="/logout"]').should('be.visible');
  });

  it('Test Case 3: Login User with incorrect email and password', () => {
    login.fazerLogin(data.email, '54321');

    cy.get('form[action="/login"] > p').should(
      'contain',
      'Your email or password is incorrect!',
    );
  });

  it('Test Case 4: Logout User', () => {
    login.fazerLogin(data.email, data.password);

    cy.get('i.fa-user').parent().should('contain', data.name);

    menu.logout();

    cy.url().should('include', '/login');
  });

  it('Test Case 5: Register User with existing email', () => {
    login.preencherFormularioDePreCadastro(data.name, data.email);

    cy.contains('button', 'Signup').click();
    cy.get('.signup-form > form > p').should(
      'contain',
      'Email Address already exist!',
    );
  });

  it('Test Case 6: Contact Us Form', () => {
    contato.navegarParaFaleConosco();
    contato.preencherFormularioContato();

    cy.get('.status')
      .should('be.visible')
      .and(
        'have.text',
        'Success! Your details have been submitted successfully.',
      );

    cy.visit('https://automationexercise.com');
    cy.contains('Full-Fledged practice website for Automation Engineers');
  });

  it('Test Case 8: Verify All Products and product detail page', () => {
    produtos.navegarParaProdutos();
    cy.url().should('contain', 'products');
    cy.get('h2.title').should('be.visible').contains('All Products');

    produtos.contarProdutos().should('have.length', 34);

    produtos.visualizarDetalheDoProduto(18);
    cy.url().should('contain', 'product_details/18');

    cy.fixture('produto').then((produto) => {
      cy.get('.product-information h2').should('have.text', produto.name);

      cy.get('.product-information p')
        .eq(0)
        .should('have.text', `Category: ${produto.category}`);
      cy.get('.product-information span span').should(
        'have.text',
        produto.price,
      );
      cy.contains('p', 'Availability').should(
        'contain.text',
        produto.availability,
      );
      cy.contains('p', 'Condition').should('contain.text', produto.condition);
      cy.contains('p', 'Brand').should('contain.text', produto.brand);
    });
  });

  it('Test Case 9: Search Product', () => {
    produtos.navegarParaProdutos();

    cy.url().should('contain', 'products');
    cy.get('h2.title').should('be.visible').contains('All Products');

    cy.fixture('produto').then((produto) => {
      produtos.pesquisarProdutos(produto.name);
      produtos.contarProdutos().should('have.length', 1);

      cy.get('h2.title').should('be.visible').contains('Searched Products');

      cy.get('.productinfo').as('produtoEncontrado');

      cy.get('@produtoEncontrado').find('p').should('have.text', produto.name);
      cy.get('@produtoEncontrado')
        .find('h2')
        .should('have.text', produto.price);
    });
  });

  it('Test Case 10: Verify Subscription in home page', () => {
    cy.scrollTo('bottom');
    cy.get('.single-widget > h2').contains('Subscription');

    cy.get('#susbscribe_email').type(new Chance().email());
    cy.get('#subscribe').click();

    cy.get('.alert-success')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.eq('You have been successfully subscribed!');
      });
  });

  it('Test Case 15: Place Order: Register before Checkout', () => {
    login.preencherFormularioDePreCadastro();

    cy.log('Preenchendo o formulário de cadastro');
    cadastro.preencherFormularioCadastro();

    cy.url().should('contain', 'account_created');
    cy.contains('b', 'Account Created!');

    cy.log('Navegando para a página de produtos');
    produtos.navegarParaProdutos();

    cy.fixture('produto').then((produto) => {
      cy.log('Pesquisando por um produto');
      produtos.pesquisarProdutos(produto.name);

      cy.log('Adicionando produto ao carrinho');
      produtos.adicionarProduto();

      cy.log('Navegando para o carrinho de compras');
      produtos.navegarParaCarrinho();

      produtos.fazerCheckout();

      cy.log('Preenchendo o formulário de pagamento');
      produtos.preencherFormularioPagamento();
      cy.get('[data-qa="order-placed"]').should('have.text', 'Order Placed!');
      cy.contains(
        'p',
        'Congratulations! Your order has been confirmed!',
      ).should('be.visible');

      cy.log('Excluindo a conta criada');
      cy.get('a[href="/delete_account"]').click();
      cy.get('[data-qa="account-deleted"]').contains('Account Deleted!');

      cy.log('Continuando após exclusão de conta');
      cy.get('[data-qa="continue-button"]').click();
    });
  });
});
