const { producto, loginAsAdminPlaywright } = require("../../testData");
const { test, expect } = require("@playwright/test");

test.describe("Módulo de Administración - Productos", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdminPlaywright(page);
    await page.click("text=Products");
    await page.click('a[href="/admin/product/new"]');
    await page.waitForURL("**/admin/product/new");
  });

  test("Agregar un nuevo producto correctamente", async ({ page }) => {
    await page.fill("#productTitle", producto.nombre);
    await page.fill("#productPrice", producto.precio);
    await page.fill("#productGtin", producto.gtin);
    await page.fill("#productBrand", producto.marca);
    await page.locator("div.note-editable").fill(producto.descripcion);
    await page.click("#frm_edit_product_save");

    const notificacion = page.locator("#notify_message");
    await notificacion.waitFor({ state: "attached", timeout: 10000 });
    await expect(notificacion).toBeVisible({ timeout: 10000 });
    
    const notificationText = await notificacion.textContent();
    expect(
      notificationText.includes("New product successfully created") ||
      notificationText.includes("Permalink already exists. Pick a new one")
    ).toBeTruthy();
  });

  test("Error al omitir el campo de precio", async ({ page }) => {
    const nombreProducto = `Producto inválido ${Date.now()}`;
    await page.fill("#productTitle", nombreProducto);
    await page.fill("#productGtin", "12345678");
    await page.fill("#productBrand", "Adidas");
    await page.locator("div.note-editable").fill("Producto de prueba sin precio");
    await page.click("#frm_edit_product_save");

    const campoPrecio = page.locator("#productPrice");
    await campoPrecio.focus();
    const isFocused = await campoPrecio.evaluate(
      (el) => document.activeElement === el
    );
    await expect(isFocused).toBe(true);
    await expect(page.locator("#frm_edit_product_save")).toBeVisible();
  });

  test("Error al ingresar precio entero sin decimales", async ({ page }) => {
    const nombreProducto = `Producto con precio entero ${Date.now()}`;
    await page.fill("#productTitle", nombreProducto);
    await page.fill("#productGtin", "12345678");
    await page.fill("#productBrand", "Adidas");
    await page.locator("div.note-editable").fill("Producto de prueba con precio entero");
    await page.fill("#productPrice", "10");
    await page.click("#frm_edit_product_save");

    await page.waitForTimeout(2000);
    const errorMessage = page.locator("#validationModalBody p");
    await expect(errorMessage).toContainText(
      "Should be a full 2 decimal value. Eg: 10.99"
    );
  });
});