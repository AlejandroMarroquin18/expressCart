const { faker } = require('@faker-js/faker/locale/es');
const { By, until } = require('selenium-webdriver');

// Datos de prueba para productos
const producto = {
  nombre: faker.commerce.productName(),
  precio: faker.commerce.price({ min: 10, max: 1000, dec: 2 }), // Sintaxis actualizada
  gtin: faker.string.numeric({ length: 13 }), // Reemplazo para datatype.number
  marca: faker.company.name(), // companyName() cambió a name()
  descripcion: faker.lorem.paragraph()
};

// Datos de prueba para cliente
const cliente = {
  email: faker.internet.email(),
  empresa: faker.company.name(), 
  nombre: faker.person.firstName(), 
  apellido: faker.person.lastName(), 
  direccion: faker.location.streetAddress(), 
  pais: 'Colombia',
  estado: faker.location.state(), 
  codigo_postal: faker.location.zipCode(), 
  telefono: faker.string.numeric(10), 
  password: 'Test1234!'
};

// Función para login de administrador
async function loginAsAdminPlaywright(page) {
  await page.goto("http://localhost:1111/admin/login");
  await page.fill("#email", "admin@test.com");
  await page.fill("#password", "12345678");
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL("**/admin/dashboard");
}

// Función para agregar producto al carrito
async function agregarProductoAlCarrito(page) {
  await page.goto("http://localhost:1111");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.waitForSelector("#notify_message");
}

// En tu archivo testData.js
async function agregarProductoAlCarritoSelenium(driver) {
  try {
    console.log('Navegando a la página principal...');
    await driver.get("http://localhost:1111");
    
    console.log('Buscando botón "Add to cart"...');
    // Versión 1: Usando XPath para encontrar el primer botón con texto "Add to cart"
    const addToCartBtn = await driver.wait(
      until.elementLocated(By.xpath('(//button[contains(text(), "Add to cart")])[1]')),
      10000
    );
    
    // Versión alternativa 2: Si tiene una clase específica
    // const addToCartBtn = await driver.wait(
    //   until.elementLocated(By.css('button.add-to-cart:first-of-type')),
    //   10000
    // );
    
    console.log('Haciendo clic en "Add to cart"...');
    await driver.executeScript("arguments[0].click();", addToCartBtn);
    
    console.log('Esperando notificación...');
    await driver.wait(until.elementLocated(By.id('notify_message')), 10000);
    
    console.log('Producto agregado al carrito exitosamente');
  } catch (error) {
    console.error('Error en agregarProductoAlCarritoSelenium:', error);
    throw error;
  }
}

async function loginAsAdminSelenium(driver) {
  try {
      console.log('Navegando a página de login de administrador...');
      await driver.get("http://localhost:1111/admin/login");
      
      console.log('Rellenando formulario de login...');
      await driver.findElement(By.id('email')).sendKeys('admin@test.com');
      await driver.findElement(By.id('password')).sendKeys('12345678');
      
      console.log('Enviando formulario...');
      await driver.findElement(By.xpath('//button[contains(text(), "Sign in")]')).click();
      
      console.log('Esperando redirección al dashboard...');
      await driver.wait(until.urlContains('/admin/dashboard'), 10000);
      
      console.log('Login de administrador completado con éxito');
  } catch (error) {
      console.error('Error en loginAsAdminSelenium:', error);
      // Tomar screenshot del error
      await driver.takeScreenshot().then(image => {
          require('fs').writeFileSync('error-login-admin.png', image, 'base64');
          console.log('Captura de pantalla guardada como error-login-admin.png');
      });
      throw error; // Relanzar el error para manejarlo en el test
  }
}

module.exports = {
  producto,
  cliente,
  loginAsAdminPlaywright,
  loginAsAdminSelenium,
  agregarProductoAlCarrito,
  agregarProductoAlCarritoSelenium
};