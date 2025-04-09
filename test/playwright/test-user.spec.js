/*
PRUEBAS PARA EL FLUJO DE CLIENTE EN EXPRESSCART

Este archivo contiene pruebas E2E para las funcionalidades de cliente:
- Carrito de compras
- Registro de usuarios
- Proceso de checkout
- Login de clientes

REQUISITOS:
- Playwright instalado
- Servidor ExpressCart ejecutándose
- Datos de prueba en testData.js
*/

const { test, expect } = require("@playwright/test");
const { cliente } = require("../testData");

// Función auxiliar para agregar un producto al carrito exitosamente
async function addProductToCart(page) {
  await page.goto("http://localhost:1111");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await expect(page.locator("#notify_message")).toContainText("Cart successfully updated");
}

// Función auxiliar para navegar a la sección de información del checkout
async function goToCheckoutInformation(page) {
  await page.click('a[href="/checkout/cart"]');
  await page.click('a[href="/checkout/information"]');
  await page.waitForURL("**/checkout/information");
}

// BLOQUE DE PRUEBAS 1 - FLUJO DEL CARRITO Y EL CHECKOUT
test.describe('Flujo de carrito y checkout', () => {
  /**
   Prueba: Agregar producto al carrito exitosamente
   Verifica que se pueda agregar un producto y aparezca la notificación de éxito
   */
  test("Agregar producto al carrito con éxito", async ({ page }) => {
    await addProductToCart(page);
  });

  /*
   Prueba: Valores inválidos en cantidad de productos
   Verifica que el sistema corrija valores negativos en el carrito
   */
  test("Valores inválidos al añadir productos al carrito", async ({ page }) => {
    await addProductToCart(page);
    await page.click('a[href="/checkout/cart"]');
    
    // Intentar establecer cantidad negativa
    const quantityInput = page.getByRole("spinbutton");
    await quantityInput.fill("-1");
    await page.click('a[href="/checkout/information"]');
    
    // Verificar que se corrigió a 1
    const finalValue = await quantityInput.inputValue();
    await expect(finalValue).toBe("1");
  });
});

// BLOQUE DE PRUEBAS 2 - REGISTRO DE CLIENTES Y CHECKOUT
test.describe('Registro de clientes', () => {
  /*
   Prueba: Registro completo durante checkout
   Verifica el flujo completo de registro de nuevo cliente
   */
  test("Registro de usuario en proceso de compra", async ({ page }) => {
    await addProductToCart(page);
    await goToCheckoutInformation(page);
    
    // Completar formulario de registro
    await page.locator("#shipEmail").fill(cliente.email);
    await page.locator("#shipFirstname").fill(cliente.nombre);
    await page.locator("#shipLastname").fill(cliente.apellido);
    await page.locator("#shipAddr1").fill(cliente.direccion);
    await page.selectOption("#shipCountry", cliente.pais);
    
    // Marcar checkbox para crear cuenta
    await page.locator('role=checkbox[name="Create an account"]').click();
    await page.locator("#newCustomerPassword").fill(cliente.password);
    
    // Continuar a envío
    await page.getByRole("link", { name: "Continue to shipping" }).click();
    await page.waitForURL("http://localhost:1111/checkout/shipping");
  });

  /*
   Prueba: Validación de campo email obligatorio
   Verifica que el sistema detecte cuando falta el email
   */
  test("Checkout sin email muestra error", async ({ page }) => {
    await addProductToCart(page);
    await goToCheckoutInformation(page);
    
    // Omitir campo email y completar otros campos
    await page.locator("#shipFirstname").fill(cliente.nombre);
    await page.getByRole("link", { name: "Continue to shipping" }).click();
    
    // Verificar foco en campo email
    const emailField = page.locator("#shipEmail");
    await expect(emailField).toBeFocused();
    await expect(emailField.locator("..")).toHaveClass(/has-error/);
  });
});

// BLOQUE DE PRUEBAS 3 - AUTENTICACIÓN DE CLIENTES
test.describe('Autenticación de clientes', () => {
  /*
   Prueba: Login con credenciales inexistentes
   Verifica el mensaje de error cuando el email no existe
   */
  test("Login con usuario inexistente", async ({ page }) => {
    await page.goto("http://localhost:1111/customer/login");
    
    await page.locator("#email").fill("nouser@test.com");
    await page.locator("#password").fill("abcd");
    await page.locator("#customerloginForm").click();
    
    // Assert: Verifica mensaje de error
    await expect(page.locator("#notify_message"))
      .toContainText("A customer with that email does not exist.");
  });

  /*
   Prueba: Login con contraseña incorrecta
   Verifica el mensaje de error cuando la contraseña no coincide
   */
  test("Login con contraseña incorrecta", async ({ page }) => {
    await page.goto("http://localhost:1111/customer/login");
    
    await page.locator("#email").fill("user@test.com");
    await page.locator("#password").fill("incorrect");
    await page.locator("#customerloginForm").click();

    // Assert: Verifica mensaje de error
    await expect(page.locator("#notify_message"))
      .toContainText("Access denied. Check password and try again.");
  });
});