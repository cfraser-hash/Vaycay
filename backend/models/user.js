// VAYCAY User Model

const { getDB } = require("../config/db");

// Get MongoDB users collection
function getUsersCollection() {

    const database = getDB();

    return database.collection("users");

}

// Create database indexes
async function createUserIndexes() {

    const users = getUsersCollection();

    await users.createIndex(
        { email: 1 },
        { unique: true }
    );

    await users.createIndex(
        { username: 1 },
        { unique: true }
    );

    console.log("User indexes created successfully!");

}

// Create a new user
async function createUser(userData) {

    const users = getUsersCollection();

    const newUser = {

        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,

        // Store hashed password, never plain text
        passwordHash: userData.passwordHash,

        // Default profile information
        profilePicture: "",
        bio: "",

        createdAt: new Date(),
        updatedAt: new Date()

    };

    const result = await users.insertOne(newUser);

    return result;

}

// Find user by email
async function findUserByEmail(email) {

    const users = getUsersCollection();

    return await users.findOne({
        email: email.toLowerCase().trim()
    });

}

// Find user by username
async function findUserByUsername(username) {

    const users = getUsersCollection();

    return await users.findOne({
        username: username.toLowerCase().trim()
    });

}

// Find user by ID
async function findUserById(id) {

    const { ObjectId } = require("mongodb");

    const users = getUsersCollection();

    if (!ObjectId.isValid(id)) {
        return null;
    }

    return await users.findOne({
        _id: new ObjectId(id)
    });

}

// Export User functions
module.exports = {
    getUsersCollection,
    createUserIndexes,
    createUser,
    findUserByEmail,
    findUserByUsername,
    findUserById
};