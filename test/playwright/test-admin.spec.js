/*
PRUEBAS DE PLAYWRIGHT PARA ADMINISTRADOR DE EXPRESSCART
* 
Este archivo contiene pruebas E2E no exhaustivas para el panel de administración de ExpressCart.
Incluye: login, gestión de productos, usuarios y órdenes.

REQUISITOS:
- Playwright instalado
- Servidor ExpressCart ejecutándose (localhost:1111)
- Datos de prueba en testData.js
*/

const { producto } = require("../testData");
const { test, expect } = require("@playwright/test");

// Credenciales del administrador creadas inicialmente.
const adminCredentials = {
  email: "admin@test.com",
  password: "12345678"
};

// Función auxiliar para iniciar sesión como administrador.
async function loginAsAdmin(page) {
  await page.goto("http://localhost:1111/admin/login"); // Navega a la página de login.
  await page.fill("#email", adminCredentials.email);    // Se completan los campos.
  await page.fill("#password", adminCredentials.password);
  await page.getByRole('button', { name: 'Sign in' }).click(); // Con click() se emula un click en un botón definido
  await page.waitForURL("**/admin/dashboard");
}

// Función auxiliar para navegar a la sección de crear un nuevo producto.
async function navigateToProducts(page) {
  await page.click("text=Products");
  await page.click('a[href="/admin/product/new"]');
  await page.waitForURL("**/admin/product/new");
}

// BLOQUE DE PRUEBAS 1 - PRUEBAS DE ADMINISTRACIÓN DE USUARIOS Y PRODUCTOS
test.describe('Panel de Administración', () => {
  // Este beforeEach se ejecuta ANTES de cada test en el bloque
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  /*
   Prueba: Agregar producto válido
   Verifica que un producto con datos correctos se crea exitosamente
   */
  test("Agregar nuevo producto correctamente", async ({ page }) => {
    await navigateToProducts(page);

    // Se completan los campos de producto.
    await page.fill("#productTitle", producto.nombre);
    await page.fill("#productPrice", producto.precio);
    await page.fill("#productGtin", producto.gtin);
    await page.fill("#productBrand", producto.marca);
    await page.locator("div.note-editable").fill(producto.descripcion);
    await page.click("#frm_edit_product_save");

    // Assert: Verifica notificación de éxito
    await expect(page.locator("text=New product successfully created"))
      .toBeVisible({ timeout: 5000 });
  });

  /*
   Prueba: Error al omitir campo obligatorio precio
   Verifica que el sistema muestra error cuando falta el precio
   */
  test("Error al agregar producto sin precio", async ({ page }) => {
    await navigateToProducts(page);
    
    const nombreProducto = `Producto inválido ${Date.now()}`;
    await page.fill("#productTitle", nombreProducto);
    await page.click("#frm_edit_product_save");

    // Assert: El campo precio debe recibir foco por el error
    const campoPrecio = page.locator("#productPrice");
    await expect(campoPrecio).toBeFocused();
    await expect(page.locator("#frm_edit_product_save")).toBeVisible();
  });

  /*
   Prueba: Error al crear usuario con contraseña que no coincide
   Verifica que el sistema muestra error cuando se registra un usuario con contraseñas diferentes
   */
  test("Error al crear usuario con contraseñas no coincidentes", async ({ page }) => {
    await page.click('a[href="/admin/user/new"]');
    await page.waitForURL("**/admin/user/new");

    await page.fill("#usersName", "Nuevo usuario");
    await page.fill("#userEmail", `test${Date.now()}@user.com`);
    await page.fill("#userPassword", "12345678");
    await page.fill('input[data-match="#userPassword"]', "otraClave456");
    await page.click("button[type=submit]");

    // Assert: El campo precio debe recibir foco por el error y mostrar la clase has-error
    const campoConfirmacion = page.locator('input[data-match="#userPassword"]');
    await expect(campoConfirmacion.locator("..")).toHaveClass(/has-error/);
    await expect(campoConfirmacion).toBeFocused();
  });
});

// BLOQUE DE PRUEBAS 2 - PRUEBAS DE GESTIÓN DE ÓRDENES EN EL MÓDULO ADMIN
test.describe('Gestión de órdenes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.click('a[href="/admin/order/create"]');
    await page.waitForURL("**/admin/order/create");
  });

  /*
   Prueba: Validación de campos en órdenes
   Verifica que el sistema rechace órdenes sin nombre de cliente
   */
  test("Error al crear orden sin nombre", async ({ page }) => {
    await page.fill("#customerEmail", "test@example.com");
    await page.fill("#orderLastName", "Apellido");
    await page.click("#orderCreate");

    // Assert: Debe mostrar error en el campo nombre Y TENER LA CLASE HAS-ORDER
    const campoNombre = page.locator('input[name="orderFirstName"]');
    await expect(campoNombre.locator("..")).toHaveClass(/has-error/);
    await expect(campoNombre).toBeFocused();
  });

  /*
 Prueba: Crear un orden con el correo de un cliente no registrado
 Verifica que se maneje el error al crear una orden a un cliente que no está en la BD.
 */
  test("Búsqueda de cliente no registrado", async ({ page }) => {
    await page.fill("#customerEmail", `nonexistent${Date.now()}@test.com`);
    await page.click("#lookupCustomer");

    // Assert: Verifica notificación de advertencia
    await expect(page.locator("text=No customers found"))
      .toBeVisible({ timeout: 5000 });
  });
});

/*
 Prueba: Eliminación de producto
 Verifica que el flujo de eliminar producto funcione
 */
test("Eliminar producto", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("link", { name: "Products" }).click();
  
  // Configura el manejador para el diálogo de confirmación
  page.on("dialog", dialog => dialog.accept());

  // Assert: Verifica mensaje de eliminación exitosa
  await page.locator("button.btn-delete-product").first().click();
  await expect(page.locator("text=Product successfully deleted"))
    .toBeVisible({ timeout: 5000 });
});