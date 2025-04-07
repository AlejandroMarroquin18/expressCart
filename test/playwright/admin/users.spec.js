const { loginAsAdminPlaywright } = require("../../testData");
const { test, expect } = require("@playwright/test");

test.describe("Módulo de Administración - Usuarios", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdminPlaywright(page);
    await page.waitForURL("**/admin/dashboard");
    await page.click('a[href="/admin/user/new"]');
    await page.waitForURL("**/admin/user/new");
  });

  test("Error al crear usuario con contraseñas no coincidentes", async ({ page }) => {
    await page.fill("#usersName", "Nuevo usuario de prueba");
    await page.fill("#userEmail", "nuevo@user.com");
    await page.fill("#userPassword", "12345678");
    await page.fill('input[data-match="#userPassword"]', "otraClave456");
    await page.click("button[type=submit]");

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
    await expect(page.locator("#btnUserAdd")).toBeVisible();
  });
});