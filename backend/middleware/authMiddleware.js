// VAYCAY Authentication Middleware

const jwt = require("jsonwebtoken");

// Verify user authentication
function authenticateUser(req, res, next) {
    try {
        // Get authorization header
        const authHeader = req.headers.authorization;

        // Check if token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach user information to request
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email
        };

        // Continue to controller
        Promise.resolve(next()).catch(error => {
            console.error("Authentication route error:", error);

            if (!res.writableEnded) {
                return res.status(500).json({
                    success: false,
                    message: "An internal server error occurred."
                });
             }
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });
    }
}

module.exports = {
    authenticateUser
};