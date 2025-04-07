describe("Pruebas del sistema de compras y gestión de productos", () => {
  const { cliente, producto } = require("../../test/testData");

  // Prueba 1. Agregar producto al carrito
  it("Agregar producto al carrito con éxito", () => {
    // Ir a la página
    cy.visit("http://localhost:1111");

    cy.get('p.text-center > .btn').click();

    // Esperar que el mensaje sea visible
    cy.get("#notify_message")
      .should("be.visible")
      .and("contain.text", "Cart successfully updated");
  });

  // Prueba 2. Crear usuario en el proceso de compras
  it("Agregar usuario en el proceso de compras", () => {
    cy.visit("http://localhost:1111");

    cy.get('p.text-center > .btn').click();
    cy.get('a[href="/checkout/cart"]').click();
    cy.get('a[href="/checkout/information"]').click();

    cy.url().should("include", "/checkout/information");

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
    cy.url().should("include", "/checkout/shipping");
  });

  // Prueba 3. Proceso de pago omitiendo el valor del email
  it("Proceso de pago omitiendo el valor de email", () => {
    cy.visit("http://localhost:1111");

    cy.get('p.text-center > .btn').click();
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

  // Prueba 4. Ingresar un valor inválido al añadir un producto.
  it("Valores inválidos al añadir productos al carrito de compras", () => {
    cy.visit("http://localhost:1111");

    cy.get('p.text-center > .btn').click();
    cy.get('a[href="/checkout/cart"]').click();

    cy.get('input[type="number"][data-cartid]').clear().type("-1");

    cy.get('a[href="/checkout/information"]').click();

    cy.get('input[type="number"][data-cartid]').should("have.value", "1");
  });

  it("Login de cliente incorrecto", () => {
    cy.visit("http://localhost:1111/customer/login");

    cy.get("#email").type("nouser@test.com");
    cy.get("#password").type("abcd");
    cy.get('#customerloginForm').click();

    cy.get("#notify_message")
      .should("be.visible")
      .and("contain.text", "A customer with that email does not exist.");
  });

  // Prueba 5. Ingresar con password incorrecto
  it("Login de cliente con password incorrecto", () => {
    cy.visit("http://localhost:1111/customer/login");

    cy.get("#email").type("test@gmail.com");
    cy.get("#password").type("abcd");
    cy.get('#customerloginForm').click();

    cy.get("#notify_message")
      .should("be.visible")
      .and("contain.text", "Access denied. Check password and try again.");
  });

  // Prueba 6. Eliminar prodcuto.
  it("Eliminar producto para pruebas", () => {
    cy.visit("http://localhost:1111/admin/login");
    cy.get('input[name="email"]').type("admin@test.com");
    cy.get('input[name="password"]').type("12345678");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/admin/dashboard");
    cy.visit('http://localhost:1111/admin/products');
    cy.get('.list-group > :nth-child(2) > .btn').click();

    cy.on("window:confirm", (conf) => {
      expect(conf).to.equal("Are you sure you want to delete this product?");
      return true;
    });

    cy.get("#notify_message")
      .should("be.visible")
      .and("contain.text", "Product successfully deleted");
  });
});