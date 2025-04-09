const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

async function cleanAndSeedDatabase() {
  const client = new MongoClient('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    const db = client.db('expresscart');
    
    // Limpia bases de datos de clientes y productos creados en anteriores pruebas
    await db.collection('customers').deleteMany({});
    await db.collection('products').deleteMany({});
    console.log('[INFO] Base de datos de clientes borrada');
    console.log('[INFO] Base de datos de productos borrada');

    // Se crea el cliente de prueba, con datos fijos y de faker (Se usa bcrypt ya que ExpressCart encripta la contraseña)
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    
    const testCustomer = {
      email: 'user@test.com', 
      password: hashedPassword,
      firstName: 'Cliente',
      lastName: 'De Prueba',
      company: faker.company.name(),
      address1: faker.location.streetAddress(),
      country: 'Colombia',
      state: faker.location.state(),
      postcode: faker.location.zipCode(),
      phone: faker.string.numeric(10),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('customers').insertOne(testCustomer);
    console.log('[SUCCESS] Cliente de prueba creado');
    console.log(`Email: ${testCustomer.email}`);
    console.log('Contraseña: Test1234!');

    // Crear productos de prueba con datos fijos y de faker
    const testProduct1 = {
      productPermalink: 'producto-de-prueba',
      productTitle: 'Producto de Prueba',
      productPrice: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
      productDescription: faker.lorem.paragraph(),
      productPublished: true,
      productTags: ['prueba', 'desarrollo'],
      productStock: faker.number.int({ min: 1, max: 100 }),
      productGTIN: faker.string.numeric({ length: 13 }),
      productBrand: faker.company.name(),
      productImage: '/images/placeholder.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const testProduct2 = {
      productPermalink: 'producto-de-prueba-2',
      productTitle: 'Producto de Prueba 2', 
      productPrice: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
      productDescription: faker.lorem.paragraph(),
      productPublished: true,
      productTags: ['prueba', 'desarrollo'],
      productStock: faker.number.int({ min: 1, max: 100 }),
      productGTIN: faker.string.numeric({ length: 13 }),
      productBrand: faker.company.name(),
      productImage: '/images/placeholder.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const testProduct3 = {
      productPermalink: 'producto-de-prueba-3',
      productTitle: 'Producto de Prueba 3', 
      productPrice: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
      productDescription: faker.lorem.paragraph(),
      productPublished: true,
      productTags: ['prueba', 'desarrollo'],
      productStock: faker.number.int({ min: 1, max: 100 }),
      productGTIN: faker.string.numeric({ length: 13 }),
      productBrand: faker.company.name(),
      productImage: '/images/placeholder.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const testProduct4 = {
      productPermalink: 'producto-de-prueba-4',
      productTitle: 'Producto de Prueba 4', 
      productPrice: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
      productDescription: faker.lorem.paragraph(),
      productPublished: true,
      productTags: ['prueba', 'desarrollo'],
      productStock: faker.number.int({ min: 1, max: 100 }),
      productGTIN: faker.string.numeric({ length: 13 }),
      productBrand: faker.company.name(),
      productImage: '/images/placeholder.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Inserta los productos de prueba en la BD
    await db.collection('products').insertMany([testProduct1, testProduct2, testProduct3, testProduct4]);

    console.log('\n[SUCCESS] Productos de prueba creados');
    console.log(`Nombre producto 1: ${testProduct1.productTitle}`);
    console.log(`Nombre producto 2: ${testProduct2.productTitle}`);
    console.log(`Nombre producto 3: ${testProduct3.productTitle}`);
    console.log(`Nombre producto 4: ${testProduct4.productTitle}`);

  } catch (error) {
    console.error('[ERROR]', error);
  } finally {
    await client.close();
  }
}

cleanAndSeedDatabase();