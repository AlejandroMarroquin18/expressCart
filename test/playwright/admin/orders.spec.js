const { loginAsAdminPlaywright } = require("../../testData");
const { test, expect } = require("@playwright/test");

test.describe("Módulo de Administración - Órdenes", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdminPlaywright(page);
    await page.waitForURL("**/admin/dashboard");
    await page.click('a[href="/admin/order/create"]');
    await page.waitForURL("**/admin/order/create");
  });

  test("Error al omitir el campo de nombre del cliente", async ({ page }) => {
    await page.fill("#customerEmail", "nuevouser@gmail.com");
    await page.fill("#orderLastName", "Marroquin");
    await page.fill("#orderCompany", "Univalle");
    await page.fill("#orderAddress1", "Cali 122");
    await page.selectOption("#orderCountry", "Colombia");
    await page.fill("#orderState", "Valle");
    await page.fill("#orderPostcode", "710022");
    await page.fill("#orderPhone", "3007294428");
    await page.click("#orderCreate");

    const contenedorConfirmacion = page
      .locator('input[name="orderFirstName"]')
      .locator("..");
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

  test("Error al buscar cliente no registrado", async ({ page }) => {
    await page.fill("#customerEmail", "nuevouser@gmail.com");
    await page.click("#lookupCustomer");

    const mensajeError = page.locator("text=No customers found");
    await expect(mensajeError).toBeVisible({ timeout: 5000 });
  });
});