describe("Pruebas de Administración de Productos y Usuarios", () => {
  // Función para iniciar sesión como admin
  const loginAsAdmin = () => {
    cy.visit("http://localhost:1111/admin/login");
    cy.get('input[name="email"]').type("admin@test.com");
    cy.get('input[name="password"]').type("12345678");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/admin/dashboard");
  };

  // Prueba 1: Agregar producto correctamente
  it("Admin puede agregar un nuevo producto correctamente", () => {
    loginAsAdmin();

    cy.contains("Products").click();
    cy.get('a[href="/admin/product/new"]').click({ force: true });

    // Esperamos que se cargue la página del formulario
    cy.url().should("include", "/admin/product/new");

    // Usamos los datos para completar el formulario
    cy.get("#productTitle").type("Producto de prueba");
    cy.get("#productPrice").type("29.99");
    cy.get("#productGtin").type("12345678");
    cy.get("#productBrand").type("Adidas");
    cy.get("div.note-editable").type(
      "Este es un producto automatizado de prueba"
    );

    cy.get("#frm_edit_product_save").click();

    // Verificamos la notificación
    cy.get("#notify_message")
      .should("be.visible")
      .then(($message) => {
        const messageText = $message.text();
        // Verifica si el texto contiene uno de los dos mensajes esperados
        expect(messageText).to.satisfy(
          (text) =>
            text.includes("New product successfully created") ||
            text.includes("Permalink already exists. Pick a new one")
        );
      });
  });

  // Prueba 2: Agregar producto con error (campo omitido)
  it("Admin agrega un producto con errores (campo omitido)", () => {
    loginAsAdmin();

    cy.contains("Products").click();
    cy.get('a[href="/admin/product/new"]').click({ force: true });

    // Esperamos que se cargue la página del formulario
    cy.url().should("include", "/admin/product/new");

    // Llenamos el formulario omitiendo el precio
    const timestamp = Date.now();
    const nombreProducto = `Producto inválido ${timestamp}`;
    cy.get("#productTitle").type(nombreProducto);
    cy.get("#productGtin").type("12345678");
    cy.get("#productBrand").type("Adidas");
    cy.get("div.note-editable").type("Producto de prueba sin precio");

    cy.get("#frm_edit_product_save").click();

    // Verificamos que el campo de precio tiene el foco
    cy.get("#productPrice").should("be.focused");
  });

  // Prueba 3: Agregar producto con precio entero (debe mostrar un error)
  it("Admin agrega un producto con un precio entero (debe mostrar modal de error)", () => {
    loginAsAdmin();

    cy.contains("Products").click();
    cy.get('a[href="/admin/product/new"]').click({ force: true });

    cy.url().should("include", "/admin/product/new");

    const timestamp = Date.now();
    const nombreProducto = `Producto con precio entero ${timestamp}`;
    cy.get("#productTitle").type(nombreProducto);
    cy.get("#productGtin").type("12345678");
    cy.get("#productBrand").type("Adidas");
    cy.get("div.note-editable").type("Producto de prueba con precio entero");
    cy.get("#productPrice").type("10"); 

    cy.get("#frm_edit_product_save").click();

    // Esperamos el modal de error
    cy.get("#validationModalBody p").should(
      "contain.text",
      "Should be a full 2 decimal value. Eg: 10.99"
    );
  });

  // Prueba 4: Crear un usuario con contraseñas diferentes
  it("Admin crea un usuario con claves no coincidentes", () => {
    loginAsAdmin();

    cy.contains("Users").click();
    cy.get(".float-right > .btn").click();

    cy.url().should("include", "/admin/user/new");

    // Completar el formulario con contraseñas no coincidentes
    cy.get("#usersName").type("Nuevo usuario de prueba");
    cy.get("#userEmail").type("nuevo@user.com");
    cy.get("#userPassword").type("12345678");
    cy.get('input[data-match="#userPassword"]').type("otraClave456");

    cy.get('button[type="submit"]').click();

    // Verificar que el campo de confirmación de contraseña tenga la clase "has-error"
    cy.get('input[data-match="#userPassword"]')
      .parent()
      .should("have.class", "has-error");
  });

  // Prueba 5: Crear una orden sin completar el campo de nombre
  it("Admin crea una orden y no llena el campo de nombre", () => {
    loginAsAdmin();

    cy.contains("Orders").click();
    cy.get('a[href="/admin/order/create"]').click();

    cy.url().should("include", "/admin/order/create");

    cy.get("#customerEmail").type("nuevouser@gmail.com");
    cy.get("#orderLastName").type("Marroquin");
    cy.get("#orderCompany").type("Univalle");
    cy.get("#orderAddress1").type("Cali 122");
    cy.get("#orderState").type("Valle");
    cy.get("#orderPostcode").type("710022");
    cy.get("#orderPhone").type("3007294428");

    cy.get("#orderCreate").click();

    // Verificamos que el campo de primer nombre tenga la clase "has-error"
    cy.get('input[name="orderFirstName"]')
      .parent()
      .should("have.class", "has-error");
  });

  // Prueba 6: Crear una orden a un cliente no registrado
  it("Admin crea una orden a un cliente que no ha sido registrado", () => {
    loginAsAdmin();

    cy.contains("Orders").click();
    cy.get('a[href="/admin/order/create"]').click();

    cy.url().should("include", "/admin/order/create");

    cy.get("#customerEmail").type("nuevouser@gmail.com");
    cy.get("#orderFirstName").type("Alejandro");
    cy.get("#orderLastName").type("Marroquin");
    cy.get("#orderCompany").type("Univalle");
    cy.get("#orderAddress1").type("Cali 122");
    cy.get("#orderState").type("Valle");
    cy.get("#orderPostcode").type("710022");
    cy.get("#orderPhone").type("3007294428");

    cy.get("#lookupCustomer").click();

    // Verificar que el mensaje "No customers found" aparece
    cy.contains("No customers found").should("be.visible");
  });
});
