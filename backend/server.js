// VAYCAY Backend Server

// Load environment variables
require("dotenv").config();

// Import Node.js HTTP module
const http = require("http");

// Import API routes
const handleRoutes = require("./routes");

// Import MongoDB connection
const { connectDB } = require("./config/db");
const { createUserIndexes } = require("./models/user");

// Set server port
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
    // Allow frontend requests during local development
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    // Handle browser preflight requests
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    handleRoutes(req, res);
const { creatUserIndexes } = require("../models/User");

    // Send request to routing system
    handleRoutes(req, res);

});

// Start backend and database
async function startServer() {

    try {

        // Connect to MongoDB first
        await connectDB();
        await createUserIndexes();

        // Start HTTP server
        server.listen(PORT, () => {

            console.log("--------------------------------");
            console.log("       VAYCAY BACKEND");
            console.log("--------------------------------");
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`API information: http://localhost:${PORT}/api`);
            console.log("--------------------------------");

        });

    } catch (error) {

        console.error("Failed to start VAYCAY backend:", error.message);

        process.exit(1);

    }

}

// Initialize server
startServer();

