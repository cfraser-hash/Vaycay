// server/config/database/seedIndexes.js
const mongoose = require('mongoose');

async function createIndexes() {
  const db = mongoose.connection.db;

  // 1. users collection: Fast unique lookups for authentication
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });

  // 2. itineraries collection: Fast queries by trip or owner user
  await db.collection('itineraries').createIndex({ trip: 1 });
  await db.collection('itineraries').createIndex({ user: 1 });

  // 3. saved_trips collection: Prevent duplicate saved trips
  await db.collection('saved_trips').createIndex({ user: 1, trip: 1 }, { unique: true });

  // 4. posts collection: Fast feed sorting and user/trip filtering
  await db.collection('posts').createIndex({ created_at: -1 });
  await db.collection('posts').createIndex({ user: 1 });
  await db.collection('posts').createIndex({ trip: 1 });

  // 5. messages collection: Fast chat retrieval between sender/receiver
  await db.collection('messages').createIndex({ sender: 1, receiver: 1 });
  await db.collection('messages').createIndex({ sent_at: 1 });

  console.log('⚡ All collection indexes successfully created!');
}

module.exports = createIndexes;