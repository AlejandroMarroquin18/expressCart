const { faker } = require('@faker-js/faker/locale/es');
const { By, until } = require('selenium-webdriver');

// Datos de prueba para productos
const producto = {
  nombre: faker.commerce.productName(),
  precio: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
  gtin: faker.string.numeric({ length: 13 }),
  marca: faker.company.name(), 
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



module.exports = {
  producto,
  cliente,
  agregarProductoAlCarritoSelenium
};