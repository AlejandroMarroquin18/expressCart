const { Builder, By, Key, until } = require("selenium-webdriver");
const { producto } = require("../testData");
const assert = require("assert");

async function loginAsAdminSelenium(driver) {
  // Lógica de inicio de sesión como admin
  await driver.get("http://localhost:1111/admin/login");
  await driver.findElement(By.name("email")).sendKeys("admin@test.com");
  await driver.findElement(By.name("password")).sendKeys("12345678");
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains("/admin/dashboard"), 5000);
}

// Prueba para agregar un producto válido
async function agregarProductoValido(driver) {
  console.log("Ejecutando prueba: Agregar producto válido");
  await loginAsAdminSelenium(driver);

  // Ir a la sección de productos
  await driver.findElement(By.linkText("Products")).click();
  await driver.wait(until.urlContains("/admin/products"), 5000);

  const addProductButton = await driver.findElement(
    By.css('a[href="/admin/product/new"]')
  );
  await driver.executeScript("arguments[0].click();", addProductButton);
  await driver.wait(until.urlContains("/admin/product/new"), 5000);

  await driver
    .findElement(By.id("productTitle"))
    .sendKeys("Producto de prueba");
  await driver.findElement(By.id("productPrice")).sendKeys("29.99");
  await driver.findElement(By.id("productGtin")).sendKeys("12345678");
  await driver.findElement(By.id("productBrand")).sendKeys("Adidas");
  await driver
    .findElement(By.css("div.note-editable"))
    .sendKeys("Este es un producto automatizado de prueba");

  await driver.findElement(By.id("frm_edit_product_save")).click();

  await driver.wait(until.elementLocated(By.id("notify_message")), 10000);
  const notification = await driver
    .findElement(By.id("notify_message"))
    .getText();
  if (
    notification.includes("New product successfully created") ||
    notification.includes("Permalink already exists. Pick a new one")
  ) {
    console.log("✅ La prueba se ejecutó correctamente");
  } else {
    console.log("❌ Error en la prueba: No se mostró el mensaje esperado");
  }
}

// Prueba para agregar un producto con un campo obligatorio omitido
async function agregarProductoInvalidoSinPrecio(driver) {
  console.log("Ejecutando prueba: Agregar producto inválido (sin precio)");
  await loginAsAdminSelenium(driver);

  // Ir a la sección de productos
  await driver.findElement(By.linkText("Products")).click();
  await driver.wait(until.urlContains("/admin/products"), 5000);

  const addProductButton = await driver.findElement(
    By.css('a[href="/admin/product/new"]')
  );
  await driver.executeScript("arguments[0].click();", addProductButton);
  await driver.wait(until.urlContains("/admin/product/new"), 5000);

  const timestamp = Date.now();
  const nombreProducto = `Producto inválido ${timestamp}`;
  await driver.findElement(By.id("productTitle")).sendKeys(nombreProducto);
  await driver.findElement(By.id("productGtin")).sendKeys("12345678");
  await driver.findElement(By.id("productBrand")).sendKeys("Adidas");
  await driver
    .findElement(By.css("div.note-editable"))
    .sendKeys("Producto de prueba sin precio");

  await driver.findElement(By.id("frm_edit_product_save")).click();

  const priceField = await driver.findElement(By.id("productPrice"));
  const isFocused = await driver.executeScript(
    "return document.activeElement === arguments[0];",
    priceField
  );
  assert(isFocused);
  console.log("✅ La prueba se ejecutó correctamente");
}

// Prueba para agregar un producto con un precio entero
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

  const timestamp = Date.now();
  const nombreProducto = `Producto con precio entero ${timestamp}`;
  await driver.findElement(By.id("productTitle")).sendKeys(nombreProducto);
  await driver.findElement(By.id("productGtin")).sendKeys("12345678");
  await driver.findElement(By.id("productBrand")).sendKeys("Adidas");
  await driver
    .findElement(By.css("div.note-editable"))
    .sendKeys("Producto de prueba con precio entero");
  await driver.findElement(By.id("productPrice")).sendKeys("10");

  await driver.findElement(By.id("frm_edit_product_save")).click();

  const modalErrorMessage = await driver.wait(
    until.elementLocated(By.css("#validationModalBody p")),
    5000
  );
  const errorMessage = await modalErrorMessage.getText();
  assert(errorMessage.includes("Should be a full 2 decimal value. Eg: 10.99"));
  console.log("✅ La prueba se ejecutó correctamente");
}

// Prueba para agregar un usuario con contraseñas no coincidentes
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

  await driver
    .findElement(By.id("usersName"))
    .sendKeys("Nuevo usuario de prueba");
  await driver.findElement(By.id("userEmail")).sendKeys("nuevo@user.com");
  await driver.findElement(By.id("userPassword")).sendKeys("12345678");
  await driver
    .findElement(By.css('input[data-match="#userPassword"]'))
    .sendKeys("otraClave456");

  await driver.findElement(By.css('button[type="submit"]')).click();

  const confirmPasswordContainer = await driver.findElement(
    By.css("div.form-group.has-error.has-danger")
  );
  const classAttribute = await confirmPasswordContainer.getAttribute("class");
  assert(classAttribute.includes("has-error"));
  console.log("✅ La prueba se ejecutó correctamente");
}

// Prueba para crear una orden y no llenar el campo de nombre
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

  await driver
    .findElement(By.id("customerEmail"))
    .sendKeys("nuevouser@gmail.com");
  await driver.findElement(By.id("orderLastName")).sendKeys("Marroquin");
  await driver.findElement(By.id("orderCompany")).sendKeys("Univalle");
  await driver.findElement(By.id("orderAddress1")).sendKeys("Cali 122");
  await driver.findElement(By.id("orderState")).sendKeys("Valle");
  await driver.findElement(By.id("orderPostcode")).sendKeys("710022");
  await driver.findElement(By.id("orderPhone")).sendKeys("3007294428");

  await driver.findElement(By.id("orderCreate")).click();

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
  await driver
    .findElement(By.id("customerEmail"))
    .sendKeys("nuevouser@gmail.com");
  await driver.findElement(By.id("orderFirstName")).sendKeys("Alejandro");
  await driver.findElement(By.id("orderLastName")).sendKeys("Marroquin");
  await driver.findElement(By.id("orderCompany")).sendKeys("Univalle");
  await driver.findElement(By.id("orderAddress1")).sendKeys("Cali 122");
  await driver.findElement(By.id("orderState")).sendKeys("Valle");
  await driver.findElement(By.id("orderPostcode")).sendKeys("710022");
  await driver.findElement(By.id("orderPhone")).sendKeys("3007294428");

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
  console.log("Mensaje de error:", messageText); 
  assert(messageText.includes("No customers found")); 

  console.log("✅ La prueba se ejecutó correctamente");
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
  } catch (error) {
    console.log("❌ Error en la prueba:", error.message);
  } finally {
    await driver.quit();
  }
})();
