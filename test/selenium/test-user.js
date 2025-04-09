const { Builder, By, Key, until } = require("selenium-webdriver");
const { cliente } = require("../testData");
const assert = require("assert");

// Función auxiliar para ejecutar las pruebas
async function runTest(testName, testFunction) {
  try {
    console.log(`Ejecutando prueba: ${testName}`);
    await testFunction();
    console.log("✅ La prueba se ejecutó correctamente");
  } catch (error) {
    console.log(`❌ Error en la prueba: ${error.message}`);
  }
}

// Prueba 1: Agregar producto al carrito con éxito
async function agregarProductoAlCarrito() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("http://localhost:1111");

    // Localizar el botón "Add to cart" usando el selector adecuado para un enlace (<a>)
    const addToCartButton = await driver.findElement(
      By.css("a.btn.btn-primary.add-to-cart")
    );
    await addToCartButton.click();

    // Esperar que aparezca la notificación de éxito
    const notifyMessage = await driver.wait(until.elementLocated(By.id("notify_message")),10000);
    const notificationText = await notifyMessage.getText();
    // Verificar que la notificación contiene el mensaje esperado
    assert(notificationText.includes("Cart successfully updated"));
  } finally {
    await driver.quit();
  }
}

// Prueba 2: Agregar usuario en el proceso de compras
async function agregarUsuarioEnProcesoDeCompras() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("http://localhost:1111");

    // Agregar el producto al carrito
    const addToCartButton = await driver.findElement(
      By.css("a.btn.btn-primary.add-to-cart")
    );
    await addToCartButton.click();

    // Ir al proceso de pago
    await driver.findElement(By.css('a[href="/checkout/cart"]')).click();
    await driver.findElement(By.css('a[href="/checkout/information"]')).click();
    await driver.wait(until.urlContains("/checkout/information"), 5000);

    // Completar los campos
    await driver.findElement(By.id("shipEmail")).sendKeys(cliente.email);
    await driver.findElement(By.id("shipCompany")).sendKeys(cliente.empresa);
    await driver.findElement(By.id("shipFirstname")).sendKeys(cliente.nombre);
    await driver.findElement(By.id("shipLastname")).sendKeys(cliente.apellido);
    await driver.findElement(By.id("shipAddr1")).sendKeys(cliente.direccion);
    await driver.findElement(By.id("shipCountry")).sendKeys(cliente.pais);
    await driver.findElement(By.id("shipState")).sendKeys(cliente.estado);
    await driver.findElement(By.id("shipPostcode")).sendKeys(cliente.codigo_postal);
    await driver.findElement(By.css('input[placeholder="Phone number"]')).sendKeys(cliente.telefono);
    await driver.findElement(By.id("newCustomerPassword")).sendKeys(cliente.password);

    // Localizar el checkbox de "Create an account"
    const checkbox = await driver.findElement(By.id("createAccountCheckbox"));

    // Forzar el clic en el checkbox usando JavaScript
    await driver.executeScript("arguments[0].click();", checkbox);

    // Continuar con el proceso de pago
    await driver.findElement(By.linkText("Continue to shipping")).click();
    await driver.wait(until.urlContains("/checkout/shipping"), 5000);
  } finally {
    await driver.quit();
  }
}

// Prueba 3: Proceso de pago omitiendo el valor de email
async function procesoPagoOmitiendoEmail() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("http://localhost:1111");
    // Localizar el botón "Add to cart" usando el selector adecuado para un enlace (<a>)
    const addToCartButton = await driver.findElement(
        By.css("a.btn.btn-primary.add-to-cart")
      );
    await addToCartButton.click();
    await driver.findElement(By.css('a[href="/checkout/cart"]')).click();
    await driver.findElement(By.css('a[href="/checkout/information"]')).click();

    await driver.findElement(By.id("shipCompany")).sendKeys(cliente.empresa);
    await driver.findElement(By.id("shipFirstname")).sendKeys(cliente.nombre);
    await driver.findElement(By.id("shipLastname")).sendKeys(cliente.apellido);
    await driver.findElement(By.id("shipAddr1")).sendKeys(cliente.direccion);
    await driver.findElement(By.id("shipCountry")).sendKeys(cliente.pais);
    await driver.findElement(By.id("shipState")).sendKeys(cliente.estado);
    await driver.findElement(By.id("shipPostcode")).sendKeys(cliente.codigo_postal);
    await driver.findElement(By.css('input[placeholder="Phone number"]')).sendKeys(cliente.telefono);
    await driver.findElement(By.id("newCustomerPassword")).sendKeys(cliente.password);

    const emailField = await driver.findElement(By.id("shipEmail"));
    emailField.focus();

    const isFocused = await driver.executeScript(
      "return document.activeElement === arguments[0];",
      emailField
    );
    assert(isFocused, "El campo de email no tiene el foco");
  } finally {
    await driver.quit();
  }
}

// Prueba 4: Verificar valores inválidos al añadir productos al carrito
async function valoresInvalidosCarrito() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("http://localhost:1111");
    const addToCartButton = await driver.findElement(By.css("a.btn.btn-primary.add-to-cart"));
    await addToCartButton.click();
    await driver.findElement(By.css('a[href="/checkout/cart"]')).click();

    const quantityInput = await driver.findElement(By.css('input[type="number"][data-cartid]'));
    await quantityInput.sendKeys("-1");

    await driver.findElement(By.css('a[href="/checkout/information"]')).click();
    const updatedQuantity = await driver.findElement(By.css('input[type="number"][data-cartid]')).getAttribute("value");
    assert.strictEqual(
      updatedQuantity,
      "1",
      "El valor final del carrito no es correcto"
    );
  } finally {
    await driver.quit();
  }
}

// Prueba 5: Login con valores inexistentes
async function loginIncorrecto() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    // Datos incorrectos para el login
    await driver.get("http://localhost:1111/customer/login");
    await driver.findElement(By.id("email")).sendKeys("nouser@test.com");
    await driver.findElement(By.id("password")).sendKeys("abcd");
    await driver.findElement(By.id("customerloginForm")).click();

    const notification = await driver.wait(until.elementLocated(By.id("notify_message")),10000);
    const notificationText = await notification.getText();
    assert(
      notificationText.includes("A customer with that email does not exist."),
      "El mensaje de error no es el esperado"
    );
  } finally {
    await driver.quit();
  }
}

// Ejecutar todas las pruebas
(async () => {
  await runTest('Agregar producto al carrito con éxito', agregarProductoAlCarrito);
  await runTest("Agregar usuario en el proceso de compras", agregarUsuarioEnProcesoDeCompras);
  await runTest('Proceso de pago omitiendo el valor de email', procesoPagoOmitiendoEmail); //Falla
  await runTest('Valores inválidos al añadir productos al carrito', valoresInvalidosCarrito);
  await runTest('Login de cliente incorrecto', loginIncorrecto);
})();
