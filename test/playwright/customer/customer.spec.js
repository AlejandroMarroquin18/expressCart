const { test, expect } = require("@playwright/test");
const { cliente, agregarProductoAlCarrito } = require("../../testData");

// Variable para compartir el usuario entre pruebas
let testUser = "user@test.com";

test.describe("Checkout y Autenticación", () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    // Crear una sola página para todas las pruebas
    page = await browser.newPage();
    await page.goto('http://localhost:1111');
  });

  test.afterAll(async () => {
    // Cerrar la página al finalizar
    await page.close();
  });

  // 1. Prueba de creación de usuario en checkout
  test("Creación de usuario durante el checkout", async () => {
    await agregarProductoAlCarrito(page);
    await page.click('a[href="/checkout/cart"]');
    await page.click('a[href="/checkout/information"]');
    await page.waitForURL("http://localhost:1111/checkout/information");

    // Completar formulario
    await page.locator("#shipEmail").fill(testUser);
    await page.locator("#shipCompany").fill(cliente.empresa);
    await page.locator("#shipFirstname").fill(cliente.nombre);
    await page.locator("#shipLastname").fill(cliente.apellido);
    await page.locator("#shipAddr1").fill(cliente.direccion);
    await page.selectOption("#shipCountry", cliente.pais);
    await page.locator("#shipState").fill(cliente.estado);
    await page.locator("#shipPostcode").fill(cliente.codigo_postal);
    await page.locator("#shipPhoneNumber").type(cliente.telefono);
    await page.locator("#newCustomerPassword").fill(cliente.password);

    // Finalizar registro
    await page.locator('role=checkbox[name="Create an account"]').click();
    await page.getByRole("link", { name: "Continue to shipping" }).click();
    await page.waitForURL("http://localhost:1111/checkout/shipping");
  });

  // 2. Prueba de error al omitir email
  test("Error al omitir el campo de email", async () => {
    await agregarProductoAlCarrito(page);
    await page.click('a[href="/checkout/cart"]');
    await page.click('a[href="/checkout/information"]');
    await page.waitForURL("http://localhost:1111/checkout/information");

    // Completar formulario sin email
    await page.locator("#shipCompany").fill(cliente.empresa);
    await page.locator("#shipFirstname").fill(cliente.nombre);
    await page.locator("#shipLastname").fill(cliente.apellido);
    await page.locator("#shipAddr1").fill(cliente.direccion);
    await page.selectOption("#shipCountry", cliente.pais);
    await page.locator("#shipState").fill(cliente.estado);
    await page.locator("#shipPostcode").fill(cliente.codigo_postal);
    await page.locator('input[placeholder="Phone number"]').fill(cliente.telefono);
    await page.locator("#newCustomerPassword").fill(cliente.password);

    // Intentar continuar
    await page.getByRole("link", { name: "Continue to shipping" }).click();

    // Verificar que el campo email tiene el foco
    const campoEmail = page.locator("#shipEmail");
    await campoEmail.focus();
    const isFocused = await campoEmail.evaluate(
      (el) => document.activeElement === el
    );
    await expect(isFocused).toBe(true);
  });

  // 3. Prueba de cantidad negativa
  test("Error al ingresar cantidad negativa en carrito", async () => {
    await agregarProductoAlCarrito(page);
    await page.click('a[href="/checkout/cart"]');
    
    // Colocar un valor negativo en el campo de cantidad
    const campoCantidad = page.getByRole("spinbutton");
    await campoCantidad.fill("-1");

    // Navegar a la siguiente página
    await page.click('a[href="/checkout/information"]');

    // Verificar que el valor ha sido corregido
    const valorFinal = await page
      .locator("#container #cart")
      .getByRole("spinbutton")
      .inputValue();
    await expect(valorFinal).toBe("1");
  });

  // 4. Prueba de login con email no registrado
  test("Error en login con email no registrado", async () => {
    await page.goto("http://localhost:1111/customer/login");
    await page.locator("#email").fill("noexiste@test.com");
    await page.locator("#password").fill("wrongpass");
    await page.locator("#customerloginForm").click();

    const notificacion = page.locator("#notify_message");
    await notificacion.waitFor({ state: "attached", timeout: 10000 });
    await expect(notificacion).toBeVisible({ timeout: 10000 });
    await expect(notificacion).toContainText(
      "A customer with that email does not exist."
    );
  });

  // 5. Prueba de login con contraseña incorrecta
  test("Error en login con contraseña incorrecta", async () => {
    await page.goto("http://localhost:1111/customer/login");
    await page.locator("#email").fill(testUser);
    await page.locator("#password").fill("wrongpassword");
    await page.locator("#customerloginForm").click();

    const notificacion = page.locator("#notify_message");
    await notificacion.waitFor({ state: "attached", timeout: 10000 });
    await expect(notificacion).toBeVisible({ timeout: 10000 });
    await expect(notificacion).toContainText(
      "Access denied. Check password and try again."
    );
  });
});