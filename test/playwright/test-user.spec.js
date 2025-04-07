const { test, expect } = require("@playwright/test");
const { cliente, loginAsAdminPlaywright } = require("../testData");

// Agregar un elemento al carrito de compras correctamente.
test.skip("Agregar producto al carrito con éxito", async ({ page }) => {
  // Ir a la página principal
  await page.goto("http://localhost:1111");

  // Existe también la forma getByRol para acceder a un elemento
  const link = page.getByRole("button", { name: "Add to cart" });
  await link.click();

  // Verificar que la notificación aparece
  const notificacion = page.locator("#notify_message");
  await notificacion.waitFor({ state: "attached", timeout: 10000 });
  await expect(notificacion).toBeVisible({ timeout: 10000 });

  // Verificar que el mensaje diga que el carrito fue actualizado con éxito
  await expect(notificacion).toContainText("Cart successfully updated");
});

// Creación de un usuario
test.skip("Agregar usuario en el proceso de compras", async ({ page }) => {
  // Ir a la página principal
  await page.goto("http://localhost:1111");

  // Existe también la forma getByRol para acceder a un elemento
  const link = page.getByRole("button", { name: "Add to cart" });
  await link.click();

  // Ir al proceso de pago
  await page.click('a[href="/checkout/cart"]');
  await page.click('a[href="/checkout/information"]');

  await page.waitForURL("**/checkout/information");

  // Completar los campos de registro de cliente
  await page.locator("#shipEmail").fill(cliente.email);
  await page.locator("#shipCompany").fill(cliente.empresa);
  await page.locator("#shipFirstname").fill(cliente.nombre);
  await page.locator("#shipLastname").fill(cliente.apellido);
  await page.locator("#shipAddr1").fill(cliente.direccion);
  await page.selectOption("#shipCountry", cliente.pais);
  await page.locator("#shipState").fill(cliente.estado);
  await page.locator("#shipPostcode").fill(cliente.codigo_postal);
  await page
    .locator('input[placeholder="Phone number"]')
    .fill(cliente.telefono);
  await page.locator("#newCustomerPassword").fill(cliente.password);

  const checkbox = page.locator('role=checkbox[name="Create an account"]');
  await checkbox.waitFor({ state: "visible", timeout: 5000 });
  await checkbox.click();

  await page.getByRole("link", { name: "Continue to shipping" }).click();
  await page.waitForURL("**/checkout/shipping");
});

// Compra sin añadir email
test.skip("Proceso de pago omitiendo el valor de email", async ({ page }) => {
  await page.goto("http://localhost:1111");

  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.click('a[href="/checkout/cart"]');
  await page.click('a[href="/checkout/information"]');
  await page.click('a[href="/checkout/shipping"]');

  // Completar los campos de registro de cliente omitiendo el campo email
  await page.locator("#shipCompany").fill(cliente.empresa);
  await page.locator("#shipFirstname").fill(cliente.nombre);
  await page.locator("#shipLastname").fill(cliente.apellido);
  await page.locator("#shipAddr1").fill(cliente.direccion);
  await page.selectOption("#shipCountry", cliente.pais);
  await page.locator("#shipState").fill(cliente.estado);
  await page.locator("#shipPostcode").fill(cliente.codigo_postal);
  await page
    .locator('input[placeholder="Phone number"]')
    .fill(cliente.telefono);
  await page.locator("#newCustomerPassword").fill(cliente.password);

  await page.getByRole("link", { name: "Continue to shipping" }).click();

  const campoEmail = page.locator("#shipEmail");
  await campoEmail.focus();

  // Verificamos que el campo email tenga el foco
  const isFocused = await campoEmail.evaluate(
    (el) => document.activeElement === el
  );
  await expect(isFocused).toBe(true);
});

// Test comprobando que que no se permitan valores negativos en el carrito
test.skip("Valores inválidos al añadir productos al carrito de compras", async ({
  page,
}) => {
  await page.goto("http://localhost:1111");

  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.click('a[href="/checkout/cart"]');

  // Colocar un valor negativo en el campo de cantidad en la página de carrito
  const campoCantidad = page.getByRole("spinbutton");
  await campoCantidad.fill("-1"); // Establecemos el valor a -1

  // Navegar a la siguiente página y verificar que el valor ha sido corregido
  await page.click('a[href="/checkout/information"]');
  const valorFinal = await page
    .locator("#container #cart")
    .getByRole("spinbutton")
    .inputValue();
  await expect(valorFinal).toBe("1"); // Verificar que el valor final sea "1"
});

// Login con valores inexistentes
test("Login de cliente incorrecto", async ({ page }) => {
  await page.goto("http://localhost:1111/customer/login");

  // Completar los campos de inicio de sesión con información incorrecta
  await page.locator("#email").fill("nouser@test.com");
  await page.locator("#password").fill("abcd");

  await page.locator("#customerloginForm").click();

  // Verificar que la notificación aparece
  const notificacion = page.locator("#notify_message");
  await notificacion.waitFor({ state: "attached", timeout: 10000 });
  await expect(notificacion).toBeVisible({ timeout: 10000 });
  await expect(notificacion).toContainText(
    "A customer with that email does not exist."
  );
});

// Login con credenciales incorrectas
test.skip("Login de cliente con password incorrecto", async ({ page }) => {
  await page.goto("http://localhost:1111/customer/login");

  // Completar los campos de inicio de sesión con el password incorrecto
  await page.locator("#email").fill("test@gmail.com");
  await page.locator("#password").fill("abcd");

  await page.locator("#customerloginForm").click();

  // Verificar que la notificación aparece
  const notificacion = page.locator("#notify_message");
  await notificacion.waitFor({ state: "attached", timeout: 10000 });
  await expect(notificacion).toBeVisible({ timeout: 10000 });
  await expect(notificacion).toContainText(
    "Access denied. Check password and try again."
  );
});

test("Eliminar producto para pruebas", async ({ page }) => {
  await loginAsAdminPlaywright(page);

  await page.getByRole("link", { name: "Products" }).click();

  await page.waitForURL("**/admin/products");

  page.on("dialog", async (dialog) => {
    // Aceptar el diálogo de confirmación (alerta)
    await dialog.accept();
  });

  const trashIcon = page.locator(
    "button.btn-delete-product svg.feather.feather-trash-2"
  );
  await trashIcon.click();

  
});
