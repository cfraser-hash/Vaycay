// VAYCAY Database Connection

const { MongoClient } = require("mongodb");

// MongoDB configuration
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI is missing from the .env file");
}
const dbName = process.env.DB_NAME || "vaycay";

// Create MongoDB client
const client = new MongoClient(uri);

let database;

// Connect to MongoDB
async function connectDB() {

    try {

        await client.connect();

        // Select VAYCAY database
        database = client.db(dbName);

        // Verify database connection
        await database.command({ ping: 1 });

        console.log("Connected to MongoDB successfully!");

        return database;

    } catch (error) {

        console.error("MongoDB connection failed:", error.message);

        throw error;

    }

}

// Access database throughout backend
function getDB() {

    if (!database) {
        throw new Error("Database has not been connected.");
    }

    return database;

}

// Export database functions
module.exports = {
    connectDB,
    getDB
};