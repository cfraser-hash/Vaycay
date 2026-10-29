// server/config/seedIndexes.js
const mongoose = require('mongoose');

async function createIndexes() {
  const db = mongoose.connection.db;

  // 1. users collection
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  // 2. saved_trips collection
  await db.collection('saved_trips').createIndex({ user: 1, trip: 1 }, { unique: true });

  // 3. posts collection
  await db.collection('posts').createIndex({ created_at: -1 });
  await db.collection('posts').createIndex({ user: 1 });
  await db.collection('posts').createIndex({ trip: 1 });

  // 4. messages collection
  await db.collection('messages').createIndex({ sender: 1, receiver: 1 });
  await db.collection('messages').createIndex({ sent_at: 1 });

  console.log('⚡ All collection indexes successfully created!');
}

module.exports = createIndexes;

