
// VAYCAY Backend Server

// Load environment variables
require("dotenv").config();

// Import Node.js HTTP module
const http = require("http");

// Import API routes
const handleRoutes = require("./routes");

// Set server port
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {

    // Send request to routing system
    handleRoutes(req, res);

});

// Start server
server.listen(PORT, () => {

    console.log("--------------------------------");
    console.log("       VAYCAY BACKEND");
    console.log("--------------------------------");
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`API information: http://localhost:${PORT}/api`);
    console.log("--------------------------------");

});

