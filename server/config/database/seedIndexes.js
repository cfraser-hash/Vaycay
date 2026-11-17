/**
 * Database Index Seeder — VAYCAY
 */
const mongoose = require('mongoose');

async function createIndexes() {
  const db = mongoose.connection.db;

  // 1. users collection: Unique constraints for authentication
  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { username: 1 }, unique: true }
  ]);

  // 2. destinations collection: Search by name/country and filter by tags
  await db.collection('destinations').createIndexes([
    { key: { name: 1, country: 1 } },
    { key: { tags: 1 } }
  ]);

  // 3. itineraries collection: Fast lookups by trip or owner
  await db.collection('itineraries').createIndexes([
    { key: { trip: 1 } },
    { key: { user: 1 } }
  ]);

  // 4. saved_trips collection: Prevent duplicate trip bookmarks
  await db.collection('saved_trips').createIndexes([
    { key: { user: 1, trip: 1 }, unique: true }
  ]);

  // 5. posts collection: Chronological feed sorting and filtering
  await db.collection('posts').createIndexes([
    { key: { created_at: -1 } },
    { key: { user: 1 } },
    { key: { trip: 1 } }
  ]);

  // 6. comments collection: Chronological post comment threads and user lookup
  await db.collection('comments').createIndexes([
    { key: { post: 1, created_at: 1 } },
    { key: { user: 1 } }
  ]);

  // 7. likes collection: Enforce one like per user per post
  await db.collection('likes').createIndexes([
    { key: { post: 1, user: 1 }, unique: true }
  ]);

  // 8. follows collection: Prevent duplicate follows and speed up follower lists
  await db.collection('follows').createIndexes([
    { key: { followerUserId: 1, followedUserId: 1 }, unique: true },
    { key: { followedUserId: 1 } }
  ]);

  // 9. messages collection: Direct message thread retrieval
  await db.collection('messages').createIndexes([
    { key: { sender: 1, receiver: 1 } },
    { key: { sent_at: 1 } }
  ]);

  console.log('⚡ All collection indexes successfully created!');
}

module.exports = createIndexes;
