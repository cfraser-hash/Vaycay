// VAYCAY User Controller

const {
    findUserById,
    findUserByUsername,
    getUsersCollection
} = require("../models/user");

// Remove private information before returning a user
function formatUser(user) {
    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt
    };
}

// GET USER PROFILE
async function getProfile(req, res) {
    try {
        const user = await findUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            user: formatUser(user)
        });

    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve profile."
        });
    }
}

// UPDATE USER PROFILE
async function updateProfile(req, res) {
    try {
        const {
            firstName,
            lastName,
            username,
            bio,
            profilePicture
        } = req.body;

        const user = await findUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const updates = {};

        // Validate and prepare allowed profile updates
        if (firstName !== undefined) {
            if (typeof firstName !== "string" || !firstName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "First name cannot be empty."
                });
            }

            updates.firstName = firstName.trim();
        }

        if (lastName !== undefined) {
            if (typeof lastName !== "string" || !lastName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Last name cannot be empty."
                });
            }

            updates.lastName = lastName.trim();
        }

        if (username !== undefined) {
            if (typeof username !== "string" || !username.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Username cannot be empty."
                });
            }

            const normalizedUsername = username.trim().toLowerCase();

            const existingUser = await findUserByUsername(
                normalizedUsername
            );

            if (
                existingUser &&
                existingUser._id.toString() !== user._id.toString()
            ) {
                return res.status(409).json({
                    success: false,
                    message: "Username is already taken."
                });
            }

            updates.username = normalizedUsername;
        }

        if (bio !== undefined) {
            if (typeof bio !== "string" || bio.length > 300) {
                return res.status(400).json({
                    success: false,
                    message: "Bio must be 300 characters or fewer."
                });
            }

            updates.bio = bio.trim();
        }

        if (profilePicture !== undefined) {
            if (typeof profilePicture !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid profile picture value."
                });
            }

            updates.profilePicture = profilePicture;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No profile updates provided."
            });
        }

        updates.updatedAt = new Date();

        const users = getUsersCollection();

        await users.updateOne(
            { _id: user._id },
            { $set: updates }
        );

        const updatedUser = await findUserById(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user: formatUser(updatedUser)
        });

    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update profile."
        });
    }
}

// Export functions
module.exports = {
    getProfile,
    updateProfile
};