/*
CONJUNTO DE PRUEBAS PARA EL FLUJO DE COMPRAS EN EXPRESSCART

Este archivo contiene pruebas E2E para:
- Carrito de compras
- Registro de usuarios durante el checkout
- Proceso de pago
- Autenticación de clientes
 
REQUISITOS:
- Servidor ExpressCart ejecutándose en localhost:1111
*/

// A parecer Cypress provoca errores al importar archivos
const { faker } = require('@faker-js/faker/locale/es');
    
const producto = {
  nombre: faker.commerce.productName(),
  precio: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
  gtin: faker.string.numeric({ length: 13 }),
  marca: faker.company.name(),
  descripcion: faker.lorem.paragraph(),
};

const cliente = {
  email: faker.internet.email(),
  empresa: faker.company.name(),
  nombre: faker.person.firstName(),
  apellido: faker.person.lastName(),
  direccion: faker.location.streetAddress(),
  pais: 'Colombia',
  estado: faker.location.state(),
  codigo_postal: faker.location.zipCode(),
  telefono: faker.string.numeric(10),
  password: 'Test1234!',
};

// BLOQUE DE PRUEBAS 1 - FLUJO DEL CARRITO Y EL CHECKOUT
describe("Flujo de carrito y checkout", () => {

  /**
 Prueba: Agregar producto al carrito exitosamente
  Verifica que se pueda agregar un producto y aparezca la notificación de éxito
  */
  it("Agregar producto al carrito con éxito", () => {
    // Ir a la página
    cy.visit("http://localhost:1111");

    cy.get('p.text-center > .btn').first().click();

    // Esperar que el mensaje sea visible
    cy.get("#notify_message")
      .should("be.visible")
      .and("contain.text", "Cart successfully updated");
  });

  /*
  Prueba: Valores inválidos en cantidad de productos
  Verifica que el sistema corrija valores negativos en el carrito
  */
  it("Valores inválidos al añadir productos al carrito de compras", () => {
    cy.visit("http://localhost:1111");

    cy.get('p.text-center > .btn').first().click();
    cy.get('a[href="/checkout/cart"]').click();

    cy.get('input[type="number"][data-cartid]').clear().type("-1");

    cy.get('a[href="/checkout/information"]').click();

    cy.get('input[type="number"][data-cartid]').should("have.value", "1");
  });
});

describe("Registro de clientes", () => {
  /*
  Prueba: Registro completo durante checkout
  Verifica el flujo completo de registro de nuevo cliente
  */
  it("Registrar usuario en el proceso de compras", () => {
    cy.visit("http://localhost:1111");

    cy.get('p.text-center > .btn').first().click();
    cy.get('a[href="/checkout/cart"]').click();
    cy.get('a[href="/checkout/information"]').click();

    cy.url().should("include", "/checkout/information");

    // Compeltar el formulario
    cy.get("#shipEmail").type(cliente.email);
    cy.get("#shipCompany").type(cliente.empresa);
    cy.get("#shipFirstname").type(cliente.nombre);
    cy.get("#shipLastname").type(cliente.apellido);
    cy.get("#shipAddr1").type(cliente.direccion);
    cy.get("#shipCountry").select(cliente.pais);
    cy.get("#shipState").type(cliente.estado);
    cy.get("#shipPostcode").type(cliente.codigo_postal);
    cy.get('input[placeholder="Phone number"]').type(cliente.telefono);
    cy.get("#newCustomerPassword").type(cliente.password);

    cy.get('#createAccountCheckbox').check();

    cy.get('a[href="/checkout/shipping"]').click();

    // Se espera la URL
    cy.url().should("include", "/checkout/shipping");
  });

  /*
  Prueba: Validación de campo email obligatorio
  Verifica que el sistema detecte cuando falta el email
  */
  it("Proceso de pago omitiendo el valor de email", () => {
    cy.visit("http://localhost:1111");

    cy.get('p.text-center > .btn').first().click();
    cy.get('a[href="/checkout/cart"]').click();
    cy.get('a[href="/checkout/information"]').click();
    cy.get('a[href="/checkout/shipping"]').click();

    cy.get("#shipCompany").type(cliente.empresa);
    cy.get("#shipFirstname").type(cliente.nombre);
    cy.get("#shipLastname").type(cliente.apellido);
    cy.get("#shipAddr1").type(cliente.direccion);
    cy.get("#shipCountry").select(cliente.pais);
    cy.get("#shipState").type(cliente.estado);
    cy.get("#shipPostcode").type(cliente.codigo_postal);
    cy.get('input[placeholder="Phone number"]').type(cliente.telefono);
    cy.get("#newCustomerPassword").type(cliente.password);

    cy.get('a[href="/checkout/shipping"]').click();

    cy.get("#shipEmail").focus();

    cy.get("#shipEmail").should("have.focus");
  });
});

// BLOQUE DE PRUEBAS 3 - AUTENTICACIÓN DE CLIENTES
describe("Autenticación de clientes", () => {

  /*
  Prueba: Login con credenciales inexistentes
  Verifica el mensaje de error cuando el email no existe
  */
  it("Login de cliente inexistente", () => {
    cy.visit("http://localhost:1111/customer/login");

    cy.get("#email").type("nouser@test.com");
    cy.get("#password").type("abcd");
    cy.get('#customerloginForm').click();

    cy.get("#notify_message")
      .should("be.visible")
      .and("contain.text", "A customer with that email does not exist.");
  });

  /*
  Prueba: Login con contraseña incorrecta
  Verifica el mensaje de error cuando la contraseña no coincide
  */
  it("Login de cliente con password incorrecto", () => {
    cy.visit("http://localhost:1111/customer/login");

    cy.get("#email").type("user@test.com");
    cy.get("#password").type("abcd");
    cy.get('#customerloginForm').click();

    // Verifica el mensaje de error
    cy.get("#notify_message")
      .should("be.visible")
      .and("contain.text", "Access denied. Check password and try again.");
  });
});