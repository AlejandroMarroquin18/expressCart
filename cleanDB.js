// cleanDB-auto.js
const { MongoClient } = require('mongodb');

async function cleanDatabase() {
  const client = new MongoClient('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    const db = client.db('expresscart');
    
    await db.collection('customers').deleteMany({ email: { $ne: 'admin@test.com' } });
    await db.collection('products').deleteMany({});
    
    console.log('✅ Base de datos limpiada');
  } finally {
    await client.close();
  }
}

cleanDatabase().catch(console.error);