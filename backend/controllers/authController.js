// VAYCAY Authentication Controller

const {
    createUser,
    findUserByEmail,
    findUserByUsername
} = require("../models/user");

const {
    hashPassword,
    verifyPassword,
    generateToken
} = require("../services/authService");

// USER SIGNUP
async function signup(req, res) {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password
        } = req.body;
console.log("SIGNUP REQUEST RECEIVED");
console.log("Signup data:", {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email
});
        // Validate required fields
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Check password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        // Check if email already exists
        const existingEmail = await findUserByEmail(email);

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Check if username already exists
        const existingUsername = await findUserByUsername(username);

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "This username is already taken."
            });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user in MongoDB
        const result = await createUser({
            firstName,
            lastName,
            username,
            email,
            passwordHash
        });

        // Get newly created user
        const user = await findUserByEmail(email);

        // Generate authentication token
        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Account created successfully!",
            token,
            user: {
                id: result.insertedId,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        console.error("Error details:", error.stack);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during signup."
        });
    }
}

// USER LOGIN
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Find user
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Verify password
        const passwordIsValid = await verifyPassword(
            password,
            user.passwordHash
        );

        if (!passwordIsValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate token
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during login."
        });
    }
}

// Export controller functions
module.exports = {
    signup,
    login
};