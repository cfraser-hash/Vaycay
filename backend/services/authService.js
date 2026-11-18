// VAYCAY Authentication Service

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Hash a password before saving it
async function hashPassword(password) {
    const saltRounds = 10;

    return await bcrypt.hash(password, saltRounds);
}

// Check password during login
async function verifyPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
}

// Generate JWT authentication token
function generateToken(user) {
    return jwt.sign(
        {
            userId: user._id.toString(),
            username: user.username,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1h"
        }
    );
}

// Export authentication functions
module.exports = {
    hashPassword,
    verifyPassword,
    generateToken
};