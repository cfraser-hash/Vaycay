// server/config/syncDb.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const createIndexes = require('./seedIndexes');

// Load environment variables from .env file
dotenv.config();

async function syncDatabase() {
  try {
    // 1. Connect to MongoDB Atlas securely using environment variables
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://cfraser_db_user:QOIwOwx19gzu5BJF@vaycayproject.3usvts5.mongodb.net/VAYCAY?retryWrites=true&w=majority";
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    const db = mongoose.connection.db;

    // 2. Load and Apply Schemas from schemas.json
    const schemasPath = path.join(__dirname, 'schemas.json');
    if (fs.existsSync(schemasPath)) {
      const rawData = fs.readFileSync(schemasPath);
      const schemas = JSON.parse(rawData);

      for (const item of schemas) {
        await db.command({
          collMod: item.collection,
          validator: item.validator,
          validationLevel: 'strict'
        }).catch(async (err) => {
          // If collection doesn't exist yet, create it with validator
          if (err.codeName === 'NamespaceNotFound') {
            await db.createCollection(item.collection, { validator: item.validator });
          }
        });
        console.log(`📋 Applied schema validation to '${item.collection}' collection.`);
      }
    }

    // 3. Apply Indexes from seedIndexes.js
    await createIndexes();

    console.log('🚀 Database sync complete! Check MongoDB Compass to verify.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error.message);
    process.exit(1);
  }
}

syncDatabase();


