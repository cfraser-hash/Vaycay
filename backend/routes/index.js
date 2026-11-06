// VAYCAY API Routes

const { signup, login } = require("../controllers/authController");

const {
    getProfile,
    updateProfile
} = require("../controllers/userController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");

// Send JSON responses
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

// Express-style response adapter for our native Node.js server
function createResponseAdapter(res) {
    return {
        status(code) {
            this.statusCode = code;
            return this;
        },

        json(data) {
            sendJson(res, this.statusCode || 200, data);
        }
    };
}

// Handle API requests
async function handleRoutes(req, res) {
    const method = req.method;
    const url = new URL(req.url, "http://localhost").pathname 

    let body = "";

    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            req.body = body ? JSON.parse(body) : {};

            const response = createResponseAdapter(res);

            // HEALTH CHECK
            if (method === "GET" && url === "/api/health") {
                return sendJson(res, 200, {
                    success: true,
                    message: "VAYCAY backend is running!",
                    status: "Online"
                });
            }

            // API INFORMATION
            if (method === "GET" && url === "/api") {
                return sendJson(res, 200, {
                    success: true,
                    message: "Welcome to the VAYCAY API!",
                    endpoints: [
                        "GET /api/health",
                        "POST /api/auth/signup",
                        "POST /api/auth/login",
                        "GET /api/users/profile",
                        "PUT /api/users/profile"
                    ]
                });
            }

            // SIGNUP
            if (method === "POST" && url === "/api/auth/signup") {
                return await signup(req, response);
            }

            // LOGIN
            if (method === "POST" && url === "/api/auth/login") {
                return await login(req, response);
            }

            // GET USER PROFILE
            if (method === "GET" && url === "/api/users/profile") {
                return authenticateUser(req, response, async () => {
                    await getProfile(req, response);
                });
            }

            // UPDATE USER PROFILE
            if (method === "PUT" && url === "/api/users/profile") {
                return authenticateUser(req, response, async () => {
                    await updateProfile(req, response);
                });
            }

            // UNKNOWN ROUTE
            return sendJson(res, 404, {
                success: false,
                message: "API endpoint not found."
            });

        } catch (error) {
            console.error("Route error:", error);

            if (!res.writableEnded) {
                return sendJson(res, 400, {
                    success: false,
                    message: "Invalid request."
                });
            }
        }
    });
}

module.exports = handleRoutes;
