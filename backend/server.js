
// VAYCAY Backend Server

// Import Node.js HTTP module
const http = require("http");

// Set server port
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {

    // Set response headers
    res.setHeader("Content-Type", "application/json");

    // Health check endpoint
    if (req.method === "GET" && req.url === "/api/health") {

        res.writeHead(200);

        res.end(JSON.stringify({
            success: true,
            message: "VAYCAY backend is running!",
            status: "Online"
        }));

        return;
    }

    // Default response for unknown routes
    res.writeHead(404);

    res.end(JSON.stringify({
        success: false,
        message: "API endpoint not found"
    }));
});

// Start server
server.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("       VAYCAY BACKEND");
    console.log("--------------------------------");
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log("--------------------------------");
});
