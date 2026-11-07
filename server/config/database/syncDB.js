// server/config/database/syncDB.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const createIndexes = require('./seedIndexes');

dotenv.config();

async function syncDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI secret/environment variable is missing!');
    }

    // Explicitly set dbName to 'VAYCAY'
    await mongoose.connect(mongoUri, { dbName: 'VAYCAY' });
    console.log('✅ Connected to MongoDB Atlas (VAYCAY database) successfully!');

    const db = mongoose.connection.db;
    const schemasPath = path.join(__dirname, 'schemas.json');

    // Load and Apply Schemas from schemas.json (same folder)
    if (fs.existsSync(schemasPath)) {
      const schemas = JSON.parse(fs.readFileSync(schemasPath, 'utf8'));

      for (const item of schemas) {
        try {
          // 1. Remove old validator rule completely to clear Atlas cache
          await db.command({
            collMod: item.collection,
            validator: {}
          });

          // 2. Apply new validator rule from schemas.json
          await db.command({
            collMod: item.collection,
            validator: item.validator,
            validationLevel: 'strict'
          });
          console.log(`📋 Updated schema validation for '${item.collection}'.`);
        } catch (err) {
          if (err.codeName === 'NamespaceNotFound' || err.code === 26) {
            await db.createCollection(item.collection, { validator: item.validator });
            console.log(`📋 Created '${item.collection}' collection with schema validation.`);
          } else {
            console.error(`❌ Failed to apply schema to '${item.collection}':`, err.message);
          }
        }
      }
    } else {
      console.error(`❌ schemas.json not found at path: ${schemasPath}`);
    }

    // Apply Indexes from seedIndexes.js
    await createIndexes();

    console.log('🚀 Database sync complete! Check MongoDB Compass to verify.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error.message);
    process.exit(1);
  }
}

syncDatabase();