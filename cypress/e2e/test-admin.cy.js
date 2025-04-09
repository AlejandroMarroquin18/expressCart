/*
CONJUNTO DE PRUEBAS PARA EL PANEL DE ADMINISTRACIÓN DE EXPRESSCART
* 
Este archivo contiene pruebas E2E para las funcionalidades de:
- Gestión de productos (creación, validaciones)
- Gestión de usuarios
- Procesamiento de órdenes

REQUISITOS:
- Servidor ExpressCart ejecutándose en localhost:1111
*/

// Credenciales del administrador creadas inicialmente.
const { faker } = require('@faker-js/faker/locale/es');

const adminCredentials = {
  email: "admin@test.com",
  password: "12345678"
};

const producto = {
  nombre: faker.commerce.productName(),
  precio: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
  gtin: faker.string.numeric({ length: 13 }),
  marca: faker.company.name(),
  descripcion: faker.lorem.paragraph(),
};

const admin = {
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

// Función auxiliar para iniciar sesión como admin
const loginAsAdmin = () => {
  cy.visit("http://localhost:1111/admin/login");
  cy.get('input[name="email"]').type(adminCredentials.email);
  cy.get('input[name="password"]').type(adminCredentials.password);
  cy.get('button[type="submit"]').click();
  cy.url().should("include", "/admin/dashboard");
};

// BLOQUE DE PRUEBAS 1 - PRUEBAS DE ADMINISTRACIÓN DE USUARIOS Y PRODUCTOS
describe("Panel de administración", () => {

  /*
  Prueba: Agregar producto válido
  Verifica que un producto con datos correctos se crea exitosamente
  */
  it("Admin puede agregar un nuevo producto correctamente", () => {
    loginAsAdmin();

    cy.contains("Products").click();
    cy.get('a[href="/admin/product/new"]').click({ force: true });

    // Esperamos que se cargue la página del formulario
    cy.url().should("include", "/admin/product/new");

    // Usamos los datos para completar el formulario
    cy.get("#productTitle").type(producto.nombre);
    cy.get("#productPrice").type(producto.precio);
    cy.get("#productGtin").type(producto.gtin);
    cy.get("#productBrand").type(producto.marca);
    cy.get("div.note-editable").type(producto.descripcion);

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

  /*
  Prueba: Error al omitir campo obligatorio precio
  Verifica que el sistema muestra error cuando falta el precio
  */
  it("Error al agregar producto sin precio", () => {
    loginAsAdmin();

    cy.contains("Products").click();
    cy.get('a[href="/admin/product/new"]').click({ force: true });

    // Esperamos que se cargue la página del formulario
    cy.url().should("include", "/admin/product/new");

    // Llenamos el formulario omitiendo el precio
    cy.get("#productTitle").type(producto.nombre);
    cy.get("#productGtin").type(producto.gtin);
    cy.get("#productBrand").type(producto.marca);
    cy.get("div.note-editable").type(producto.descripcion);

    cy.get("#frm_edit_product_save").click();

    // Verificamos que el campo de precio tiene el foco
    cy.get("#productPrice").should("be.focused");
  });

  /*
   Prueba: Error al crear usuario con contraseña que no coincide
   Verifica que el sistema muestra error cuando se registra un usuario con contraseñas diferentes
   */
   it("Error al crear usuario con contraseñas no coincidentes", () => {
    loginAsAdmin();

    cy.contains("Users").click();
    cy.get(".float-right > .btn").click();

    cy.url().should("include", "/admin/user/new");

    // Completar el formulario con contraseñas no coincidentes
    cy.get("#usersName").type(admin.nombre);
    cy.get("#userEmail").type(admin.email);
    cy.get("#userPassword").type(admin.password);
    cy.get('input[data-match="#userPassword"]').type("otraClave456");

    cy.get('button[type="submit"]').click();

    // Verificar que el campo de confirmación de contraseña tenga la clase has-error
    cy.get('input[data-match="#userPassword"]')
      .parent()
      .should("have.class", "has-error");
  });
});

// BLOQUE DE PRUEBAS 2 - PRUEBAS DE GESTIÓN DE ÓRDENES EN EL MÓDULO ADMIN
describe("Gestión de órdenes", () => {
  
  /*
   Prueba: Crear una orden con un formato de número no válido
   Verifica que el sistema muestra muestre un modal de error
   */
  it("Admin agrega un producto con un precio entero", () => {
    loginAsAdmin();

    cy.contains("Products").click();
    cy.get('a[href="/admin/product/new"]').click({ force: true });

    cy.url().should("include", "/admin/product/new");

    cy.get("#productTitle").type(producto.nombre);
    cy.get("#productGtin").type(producto.gtin);
    cy.get("#productBrand").type(producto.marca);
    cy.get("div.note-editable").type(producto.descripcion);
    cy.get("#productPrice").type("10"); 

    cy.get("#frm_edit_product_save").click();

    // Esperamos el modal de error
    cy.get("#validationModalBody p").should(
      "contain.text",
      "Should be a full 2 decimal value. Eg: 10.99"
    );
  });

  /*
   Prueba: Validación de campos en órdenes
   Verifica que el sistema rechace órdenes sin nombre de cliente
   */
  it("Error al crear orden sin nombre", () => {
    loginAsAdmin();

    cy.contains("Orders").click();
    cy.get('a[href="/admin/order/create"]').click();

    cy.url().should("include", "/admin/order/create");

    cy.get("#customerEmail").type(admin.email);
    cy.get("#orderLastName").type(admin.apellido);
    cy.get("#orderCompany").type(admin.empresa);
    cy.get("#orderAddress1").type(admin.direccion);
    cy.get("#orderState").type(admin.estado);
    cy.get("#orderPostcode").type(admin.codigo_postal);
    cy.get("#orderPhone").type(admin.telefono);

    cy.get("#orderCreate").click();

    // Verificamos que el campo de primer nombre tenga la clase "has-error"
    cy.get('input[name="orderFirstName"]')
      .parent()
      .should("have.class", "has-error");
  });

  /*
  Prueba: Crear un orden con el correo de un cliente no registrado
  Verifica que se maneje el error al crear una orden a un cliente que no está en la BD.
  */
  it("Admin crea una orden a un cliente que no ha sido registrado", () => {
    loginAsAdmin();

    cy.contains("Orders").click();
    cy.get('a[href="/admin/order/create"]').click();

    cy.url().should("include", "/admin/order/create");

    cy.get("#customerEmail").type(admin.email);
    cy.get("#orderFirstName").type(admin.nombre);
    cy.get("#orderLastName").type(admin.apellido);
    cy.get("#orderCompany").type(admin.empresa);
    cy.get("#orderAddress1").type(admin.direccion);
    cy.get("#orderState").type(admin.estado);
    cy.get("#orderPostcode").type(admin.codigo_postal);
    cy.get("#orderPhone").type(admin.telefono);

    cy.get("#lookupCustomer").click();

    // Verificar que el mensaje "No customers found" aparece
    cy.contains("No customers found").should("be.visible");
  });
});

/*
 Prueba: Eliminación de producto
 Verifica que el flujo de eliminar producto funcione
 */
it("Eliminar producto para pruebas", () => {
  cy.visit("http://localhost:1111/admin/login");
  cy.get('input[name="email"]').type(adminCredentials.email);
  cy.get('input[name="password"]').type(adminCredentials.password);
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
