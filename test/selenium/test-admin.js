const { Builder, By, Key, until } = require("selenium-webdriver");
const { producto, cliente } = require("../testData");
const assert = require("assert");

// Credenciales del administrador creadas inicialmente.
const adminCredentials = {
  email: "admin@test.com",
  password: "12345678"
};

// Función auxiliar para iniciar sesión como administrador
async function loginAsAdminSelenium(driver) {
  try {
      console.log('Iniciando sesión como administrador');
      await driver.get("http://localhost:1111/admin/login");
      await driver.findElement(By.id('email')).sendKeys(adminCredentials.email);
      await driver.findElement(By.id('password')).sendKeys(adminCredentials.password); 
      await driver.findElement(By.xpath('//button[contains(text(), "Sign in")]')).click();
      await driver.wait(until.urlContains('/admin/dashboard'), 10000);   
      console.log('Login de administrador completado con éxito');
  } catch (error) {
      console.error('Error en loginAsAdminSelenium:', error);
      // Es posible tomar fotos de errores en Selenium
      await driver.takeScreenshot().then(image => {
          require('fs').writeFileSync('error-login-admin.png', image, 'base64');
          console.log('Captura de pantalla guardada como error-login-admin.png');
      });
      throw error;
  }
}


// Prueba 1: Agregar un producto válido
async function agregarProductoValido(driver) {
  console.log("Ejecutando prueba: Agregar producto válido");
  await loginAsAdminSelenium(driver);

  // Navegación a la sección de productos
  await driver.findElement(By.linkText("Products")).click();
  await driver.wait(until.urlContains("/admin/products"), 5000);
  const addProductButton = await driver.findElement(
    By.css('a[href="/admin/product/new"]')
  );
  await driver.executeScript("arguments[0].click();", addProductButton);
  await driver.wait(until.urlContains("/admin/product/new"), 5000);

  // Llenando del formulario con datos de faker
  await driver.findElement(By.id("productTitle")).sendKeys(producto.nombre);
  await driver.findElement(By.id("productPrice")).sendKeys(producto.precio);
  await driver.findElement(By.id("productGtin")).sendKeys(producto.gtin);
  await driver.findElement(By.id("productBrand")).sendKeys(producto.marca);
  await driver.findElement(By.css("div.note-editable")).sendKeys(producto.descripcion);

  await driver.findElement(By.id("frm_edit_product_save")).click();

  // Verificación de resultados
  await driver.wait(until.elementLocated(By.id("notify_message")), 10000);
  const notification = await driver.findElement(By.id("notify_message")).getText();
  if (
    notification.includes("New product successfully created") ||
    notification.includes("Permalink already exists. Pick a new one")
  ) {
    console.log("✅ La prueba se ejecutó correctamente");
  } else {
    console.log("❌ Error en la prueba: No se mostró el mensaje esperado");
  }
}

// Prueba 2: Agregar un producto sin precio
async function agregarProductoInvalidoSinPrecio(driver) {
  console.log("Ejecutando prueba: Agregar producto inválido (sin precio)");
  await loginAsAdminSelenium(driver);

  // Ir a la sección de productos
  await driver.findElement(By.linkText("Products")).click();
  await driver.wait(until.urlContains("/admin/products"), 5000);

  // Se busca el elemento por su selector CSS y se clickea
  const addProductButton = await driver.findElement(
    By.css('a[href="/admin/product/new"]')
  );
  await driver.executeScript("arguments[0].click();", addProductButton);
  await driver.wait(until.urlContains("/admin/product/new"), 5000);

  await driver.findElement(By.id("productTitle")).sendKeys(producto.nombre);
  await driver.findElement(By.id("productGtin")).sendKeys(producto.gtin);
  await driver.findElement(By.id("productBrand")).sendKeys(producto.marca);
  await driver.findElement(By.css("div.note-editable")).sendKeys(producto.descripcion);

  await driver.findElement(By.id("frm_edit_product_save")).click();

  const priceField = await driver.findElement(By.id("productPrice"));
  const isFocused = await driver.executeScript(
    "return document.activeElement === arguments[0];",
    priceField
  );
  assert(isFocused);
  console.log("✅ La prueba se ejecutó correctamente");
}

// Prueba 3: Agregar un producto con otro formato de precio
async function agregarProductoConPrecioEntero(driver) {
  console.log("Ejecutando prueba: Agregar producto con precio entero");
  await loginAsAdminSelenium(driver);

  // Ir a la sección de productos
  await driver.findElement(By.linkText("Products")).click();
  await driver.wait(until.urlContains("/admin/products"), 5000);

  const addProductButton = await driver.findElement(
    By.css('a[href="/admin/product/new"]')
  );
  await driver.executeScript("arguments[0].click();", addProductButton);
  await driver.wait(until.urlContains("/admin/product/new"), 5000);

  await driver.findElement(By.id("productTitle")).sendKeys(producto.nombre);
  await driver.findElement(By.id("productGtin")).sendKeys(producto.gtin);
  await driver.findElement(By.id("productBrand")).sendKeys(producto.marca);
  await driver.findElement(By.css("div.note-editable")).sendKeys(producto.descripcion);
  await driver.findElement(By.id("productPrice")).sendKeys("10");

  await driver.findElement(By.id("frm_edit_product_save")).click();

  // Se espera el modal con el error
  const modalErrorMessage = await driver.wait(
    until.elementLocated(By.css("#validationModalBody p")),
    5000
  );
  const errorMessage = await modalErrorMessage.getText();
  assert(errorMessage.includes("Should be a full 2 decimal value. Eg: 10.99"));
  console.log("✅ La prueba se ejecutó correctamente");
}

// Prueba 4: Se agrega un usuario con contraseñas distintas
async function agregarUsuarioConContrasenasDistintas(driver) {
  console.log("Ejecutando prueba: Agregar usuario con contraseñas distintas");
  await loginAsAdminSelenium(driver);

  // Ir a la sección de agregar un nuevo usuario
  await driver.findElement(By.linkText("Users")).click();
  await driver.wait(until.urlContains("/admin/users"), 5000);

  const addUserButton = await driver.findElement(
    By.css('a[href="/admin/user/new"]')
  );
  await driver.executeScript("arguments[0].click();", addUserButton);
  await driver.wait(until.urlContains("/admin/user/new"), 5000);

  // Completar el formulario de usuario
  await driver.findElement(By.id("usersName")).sendKeys(cliente.nombre);
  await driver.findElement(By.id("userEmail")).sendKeys(cliente.email);
  await driver.findElement(By.id("userPassword")).sendKeys(cliente.password);
  await driver.findElement(By.css('input[data-match="#userPassword"]')).sendKeys("otraClave");

  await driver.findElement(By.css('button[type="submit"]')).click();

  // Espera que el selector de CSS tenga la clase has-error
  const confirmPasswordContainer = await driver.findElement(
    By.css("div.form-group.has-error.has-danger")
  );
  const classAttribute = await confirmPasswordContainer.getAttribute("class");
  assert(classAttribute.includes("has-error"));
  console.log("✅ La prueba se ejecutó correctamente");
}

// Prueba 5: Crear una orden y no llenar el campo de nombre
async function crearOrdenSinNombre(driver) {
  console.log("Ejecutando prueba: Crear orden sin llenar el campo de nombre");
  await loginAsAdminSelenium(driver);

  // Ir a la sección de crear una nueva orden
  await driver.findElement(By.linkText("Orders")).click();
  await driver.wait(until.urlContains("/admin/orders"), 5000);

  const createOrderButton = await driver.findElement(
    By.css('a[href="/admin/order/create"]')
  );
  await driver.executeScript("arguments[0].click();", createOrderButton);
  await driver.wait(until.urlContains("/admin/order/create"), 5000);

  // Se completa el formulario
  await driver.findElement(By.id("customerEmail")).sendKeys(cliente.email);
  await driver.findElement(By.id("orderLastName")).sendKeys(cliente.apellido);
  await driver.findElement(By.id("orderCompany")).sendKeys(cliente.empresa);
  await driver.findElement(By.id("orderAddress1")).sendKeys(cliente.direccion);
  await driver.findElement(By.id("orderState")).sendKeys(cliente.estado);
  await driver.findElement(By.id("orderPostcode")).sendKeys(cliente.codigo_postal);
  await driver.findElement(By.id("orderPhone")).sendKeys(cliente.telefono);

  await driver.findElement(By.id("orderCreate")).click();

  // Se espera la clase hass-error y has-danger
  const firstNameContainer = await driver.findElement(
    By.css("div.form-group.has-error.has-danger")
  );
  await driver.wait(
    until.elementLocated(By.css("div.form-group.has-error.has-danger")),
    7000
  );
  const classAttribute = await firstNameContainer.getAttribute("class");
  assert(classAttribute.includes("has-error"));
  console.log("✅ La prueba se ejecutó correctamente");
}

//Prueba 6: Crear una orden a un cliente que no se ha registrado
async function crearOrdenClienteNoRegistrado(driver) {
  console.log("Ejecutando prueba: Crear orden a un cliente no registrado");

  await loginAsAdminSelenium(driver);

  // Ir a la sección de crear una nueva orden
  await driver.findElement(By.linkText("Orders")).click();
  await driver.wait(until.urlContains("/admin/orders"), 5000);

  // Hacer clic en el enlace para crear una nueva orden
  const createOrderButton = await driver.findElement(
    By.css('a[href="/admin/order/create"]')
  );
  await driver.executeScript("arguments[0].click();", createOrderButton);
  await driver.wait(until.urlContains("/admin/order/create"), 5000);

  // Llenar el formulario de orden con un cliente no registrado
  await driver.findElement(By.id("customerEmail")).sendKeys(cliente.email);
  await driver.findElement(By.id("orderFirstName")).sendKeys(cliente.nombre);
  await driver.findElement(By.id("orderLastName")).sendKeys(cliente.apellido);
  await driver.findElement(By.id("orderCompany")).sendKeys(cliente.empresa);
  await driver.findElement(By.id("orderAddress1")).sendKeys(cliente.direccion);
  await driver.findElement(By.id("orderState")).sendKeys(cliente.estado);
  await driver.findElement(By.id("orderPostcode")).sendKeys(cliente.codigo_postal);
  await driver.findElement(By.id("orderPhone")).sendKeys(cliente.telefono);

  // Hacer clic en el botón para buscar el cliente
  await driver.findElement(By.id("lookupCustomer")).click();

  // Esperar que el mensaje "No customers found" aparezca
  const noCustomerMessage = await driver.wait(
    until.elementLocated(
      By.xpath("//*[contains(text(),'No customers found')]")
    ),
    5000
  );
  const messageText = await noCustomerMessage.getText();
  assert(messageText.includes("No customers found")); 
  console.log("✅ La prueba se ejecutó correctamente");
}

// Prueba 7: Eliminar producto para pruebas
async function eliminarProducto(driver) {
  try {
    await loginAsAdminSelenium(driver);

    await driver.findElement(By.linkText("Products")).click();
    await driver.wait(until.urlContains("/admin/products"), 5000);

    // Localizar el contenedor del botón de eliminación
    const deleteButton = await driver.findElement(
      By.css("button.btn-delete-product")
    );
    await deleteButton.click();

    await driver.switchTo().alert().accept(); // Aceptar el diálogo de confirmación
  } finally {
    await driver.quit();
  }
}

(async () => {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    // Ejecutar pruebas
    await agregarProductoValido(driver); 
    await agregarProductoInvalidoSinPrecio(driver);
    await agregarProductoConPrecioEntero(driver); 
    await agregarUsuarioConContrasenasDistintas(driver); 
    await crearOrdenSinNombre(driver);
    await crearOrdenClienteNoRegistrado(driver);
    await eliminarProducto(driver);
  } catch (error) {
    console.log("❌ Error en la prueba:", error.message);
  } finally {
    await driver.quit();
  }
})();
