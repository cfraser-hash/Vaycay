
// VAYCAY API Routes

// Send JSON responses
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

// Handle API requests
function handleRoutes(req, res) {

    const method = req.method;
    const url = req.url;

    // Health check route
    if (method === "GET" && url === "/api") {

        return sendJson(res, 200, {
            success: true,
            message: "VAYCAY backend is running!",
            status: "Online"
        });
    }

    // API information route
    if (method === "GET" && url === "/api") {

        return sendJson(res, 200, {
            success: true,
            message: "Welcome to the VAYCAY API",
            endpoints: [
                "/api/health",
                "/api"
            ]
        });
    }

    // Unknown endpoint
    return sendJson(res, 404, {
        success: false,
        message: "API endpoint not found"
    });
}

// Export route handler
module.exports = handleRoutes;
