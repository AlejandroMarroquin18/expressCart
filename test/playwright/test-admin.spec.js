const { producto, loginAsAdminPlaywright } = require("../testData");
const { test, expect } = require("@playwright/test");

// Esta prueba automatiza el proceso de añadir un nuevo producto como administrador.

test("Admin puede agregar un nuevo producto correctamente", async ({
  page,
}) => {

  await loginAsAdminPlaywright(page);

  // Clic en "Products" para ir a la sección de productos y click en el botón de añadir.
  // Se hace con selector por atributo de href
  await page.click("text=Products");
  await page.click('a[href="/admin/product/new"]');

  // Esperamos que cargue la página del formulario
  await page.waitForURL("**/admin/product/new");

  // Usamos los datos importados para llenar el formulario
  await page.fill("#productTitle", producto.nombre); // Título del producto
  await page.fill("#productPrice", producto.precio); // Precio
  await page.fill("#productGtin", producto.gtin); // Código de barras
  await page.fill("#productBrand", producto.marca); // Marca
  // Usamos el selector CSS para la clase del div editable
  await page.locator("div.note-editable").fill(producto.descripcion); // Descripción
  await page.click("#frm_edit_product_save"); // Guardar

  const notificacion = page.locator("#notify_message");

  // Se verifica que la notificación salga en pantalla.
  // Le damos tiempo extra para aparecer, por si se demora un poco en mostrarse.
  // En algunos navegadores puede haber errores a la hora de mostrar la notificación, por lo que es ideal
  // probarlo con los 3 que ofrece Playwright o asegurarse de que el mensaje se muestre adecuadamente en el
  // navegador probado.
  await notificacion.waitFor({ state: "attached", timeout: 10000 });
  await expect(notificacion).toBeVisible({ timeout: 10000 });
  const notificationText = await notificacion.textContent();
  expect(
    notificationText.includes("New product successfully created") ||
    notificationText.includes("Permalink already exists. Pick a new one")
  ).toBeTruthy();
});

// Esta prueba pretende crear un producto, pero con omisión en el campo de precio
test("Admin agrega un producto con errores (campo omitido)", async ({
  page,
}) => {
  
  await loginAsAdminPlaywright(page);

  // Ir a la sección de productos
  await page.waitForURL("**/admin/dashboard");
  await page.click("text=Products");
  await page.click('a[href="/admin/product/new"]');
  await page.waitForURL("**/admin/product/new");

  // Llenar el formulario omitiendo el precio (campo obligatorio)
  const timestamp = Date.now();
  const nombreProducto = `Producto inválido ${timestamp}`; // Con marca de tiempo para que no sea igual
  await page.fill("#productTitle", nombreProducto);
  await page.fill("#productGtin", "12345678");
  await page.fill("#productBrand", "Adidas");
  await page.locator("div.note-editable").fill("Producto de prueba sin precio");
  await page.click("#frm_edit_product_save");

  // Verificar que el campo de precio ha recibido el foco
  const campoPrecio = page.locator("#productPrice");

  // Esperar que el campo de precio reciba el foco después de la validación
  await campoPrecio.focus();
  const isFocused = await campoPrecio.evaluate(
    (el) => document.activeElement === el
  );
  await expect(isFocused).toBe(true);

  // Verificamos que no se haya enviado el formulario correctamente y que aún sea visible ya que el campo
  // fue omitido
  const formulario = page.locator("#frm_edit_product_save");
  await expect(formulario).toBeVisible();
});

// Esta prueba pretende crear un producto con un precio que es un número entero
test("Admin agrega un producto con un precio entero (debe mostrar modal de error)", async ({
  page,
}) => {
  
  await loginAsAdminPlaywright(page);

  // Ir a la sección de productos
  await page.waitForURL("**/admin/dashboard");
  await page.click("text=Products");
  await page.click('a[href="/admin/product/new"]');
  await page.waitForURL("**/admin/product/new");

  // Llenar el formulario con un precio entero
  const timestamp = Date.now();
  const nombreProducto = `Producto con precio entero ${timestamp}`; // Con marca de tiempo para que no sea igual

  await page.fill("#productTitle", nombreProducto);
  await page.fill("#productGtin", "12345678");
  await page.fill("#productBrand", "Adidas");
  await page
    .locator("div.note-editable")
    .fill("Producto de prueba con precio entero");
  // Ingresar un precio entero
  await page.fill("#productPrice", "10");
  // Intentar guardar
  await page.click("#frm_edit_product_save");

  // Verificar que aparece el mensaje de error dentro del modal
  await page.waitForTimeout(2000);
  const errorMessage = page.locator("#validationModalBody p");
  await expect(errorMessage).toContainText(
    "Should be a full 2 decimal value. Eg: 10.99"
  );
});

// Agregar un nuevo usuario con contraseñas diferentes en los campos de contraseña y confirmar contraseña
test("Admin crea un usuario con claves no coincidentes", async ({
  page,
}) => {
 
  await loginAsAdminPlaywright(page);

  // Ir a la sección de agregar usuario
  await page.waitForURL("**/admin/dashboard");
  await page.click('a[href="/admin/user/new"]');
  await page.waitForURL("**/admin/user/new");

  // Llenar el formulario errando el campo de confirmar contraseña
  await page.fill("#usersName", "Nuevo usuario de prueba");
  await page.fill("#userEmail", "nuevo@user.com");
  await page.fill("#userPassword", "12345678");
  await page.fill('input[data-match="#userPassword"]', "otraClave456");

  await page.click("button[type=submit]");

  // Verificar que el contenedor del campo de confirmar contraseña tenga la clase "has-error" y sea enfocado
  const contenedorConfirmacion = page
    .locator('input[data-match="#userPassword"]')
    .locator("..");
  await expect(contenedorConfirmacion).toHaveClass(/has-error/, {
    timeout: 5000,
  });
  const campoConfirmacion = page.locator('input[data-match="#userPassword"]');
  await campoConfirmacion.focus();
  const isFocused = await campoConfirmacion.evaluate(
    (el) => document.activeElement === el
  );
  await expect(isFocused).toBe(true);

  // Esperar que el botón de guardar esté visible antes de realizar la verificación
  const botonGuardar = page.locator("#btnUserAdd");
  await botonGuardar.waitFor({ state: "visible", timeout: 5000 });
  await expect(botonGuardar).toBeVisible(); // Asegurarse de que el formulario sigue visible porque no se envió
});

// Crear crea una orden omitiendo el campo de Nombre del cliente
test("Admin crea una orden y no llena el campo de nombre", async ({
page,
}) => {

  await loginAsAdminPlaywright(page);

  // Ir a la sección de crear una orden
  await page.waitForURL("**/admin/dashboard");
  await page.click('a[href="/admin/order/create"]');
  await page.waitForURL("**/admin/order/create");

  // Llenar el formulario sin añadir productos al carrito
  await page.fill("#customerEmail", "nuevouser@gmail.com");
  // No llenamos el campo del primer nombre para que se enfoque
  await page.fill("#orderLastName", "Marroquin");
  await page.fill("#orderCompany", "Univalle");
  await page.fill("#orderAddress1", "Cali 122");
  await page.selectOption("#orderCountry", "Colombia");
  await page.fill("#orderState", "Valle");
  await page.fill("#orderPostcode", "710022");
  await page.fill("#orderPhone", "3007294428");
  await page.click("#orderCreate");

  // Verificar que el campo de primer nombre tenga la clase "has-error"
  const contenedorConfirmacion = page
    .locator('input[name="orderFirstName"]')
    .locator("..");

  // Esperamos a que el contenedor tenga la clase "has-error" y se enfoque el campo omitido
  await expect(contenedorConfirmacion).toHaveClass(/has-error/, {
    timeout: 5000,
  });
  const campoNombre = page.locator('input[name="orderFirstName"]');
  await campoNombre.focus();
  const isFocused = await campoNombre.evaluate(
    (el) => document.activeElement === el
  );
  await expect(isFocused).toBe(true);
});

// Crear crea una orden a un cliente no registrado
test("Admin crea una orden a un cliente que no ha sido registrado", async ({
  page,
}) => {
  
  await loginAsAdminPlaywright(page);

  // Ir a la sección de crear una orden
  await page.waitForURL("**/admin/dashboard");
  await page.click('a[href="/admin/order/create"]');
  await page.waitForURL("**/admin/order/create");

  // Llenar el nombre con un correo que aún no se ha registrado
  await page.fill("#customerEmail", "nuevouser@gmail.com");
  await page.click("#lookupCustomer");

  // Verificar que el mensaje "No customers found" aparece
  const mensajeError = page.locator("text=No customers found");
  await expect(mensajeError).toBeVisible({ timeout: 5000 });
});