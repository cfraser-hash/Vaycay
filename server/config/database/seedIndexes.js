// server/config/database/seedIndexes.js
const mongoose = require('mongoose');

async function createIndexes() {
  const db = mongoose.connection.db;

  // 1. users collection
  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { username: 1 }, unique: true }
  ]);

  // 2. itineraries collection
  await db.collection('itineraries').createIndexes([
    { key: { trip: 1 } },
    { key: { user: 1 } }
  ]);

  // 3. saved_trips collection
  await db.collection('saved_trips').createIndexes([
    { key: { user: 1, trip: 1 }, unique: true }
  ]);

  // 4. posts collection
  await db.collection('posts').createIndexes([
    { key: { created_at: -1 } },
    { key: { user: 1 } },
    { key: { trip: 1 } }
  ]);

  // 5. comments collection
  await db.collection('comments').createIndexes([
    { key: { post: 1, created_at: 1 } },
    { key: { user: 1 } }
  ]);

  // 6. likes collection (prevent duplicate likes by the same user on a post)
  await db.collection('likes').createIndexes([
    { key: { post: 1, user: 1 }, unique: true }
  ]);

  // 7. messages collection
  await db.collection('messages').createIndexes([
    { key: { sender: 1, receiver: 1 } },
    { key: { sent_at: 1 } }
  ]);

  console.log('⚡ All collection indexes successfully created!');
}

module.exports = createIndexes;

  console.log('⚡ All collection indexes successfully created!');
}

module.exports = createIndexes;
