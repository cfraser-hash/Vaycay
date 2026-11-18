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
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || "",
        coverPhoto: user.coverPhoto || "",
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
            profilePicture,
            coverPhoto,
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

            updates.first_name = firstName.trim();
        }

        if (lastName !== undefined) {
            if (typeof lastName !== "string" || !lastName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Last name cannot be empty."
                });
            }

            updates.last_name = lastName.trim();
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

        if (coverPhoto !== undefined) {
            if (typeof coverPhoto !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid cover photo value."
                });
            }

             updates.coverPhoto = coverPhoto;
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
// GET SAVED FAVORITES
async function getFavorites(req, res) {
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
            favorites: user.favorites || []
        });

    } catch (error) {
        console.error("Get favorites error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve favorites."
        });
    }
}

// SAVE AN ATTRACTION TO FAVORITES
async function saveFavorite(req, res) {
    try {
        const {
            id,
            name,
            address,
            latitude,
            longitude,
            category,
            distance
        } = req.body;

        if (
            typeof id !== "string" || !id.trim() ||
            typeof name !== "string" || !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid attraction ID and name are required."
            });
        }

        const user = await findUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const favorites = user.favorites || [];

        if (favorites.some(item => item.id === id)) {
            return res.status(200).json({
                success: true,
                message: "Attraction is already saved.",
                alreadySaved: true
            });
        }

        const favorite = {
            id: id.trim(),
            name: name.trim(),
            address: typeof address === "string" ? address : "",
            latitude: Number.isFinite(Number(latitude))
                ? Number(latitude) : null,
            longitude: Number.isFinite(Number(longitude))
                ? Number(longitude) : null,
            category: typeof category === "string" ? category : "",
            distance: Number.isFinite(Number(distance))
                ? Number(distance) : null,
            savedAt: new Date()
        };

        const users = getUsersCollection();

        await users.updateOne(
            { _id: user._id },
            { $push: { favorites: favorite } }
        );

        return res.status(201).json({
            success: true,
            message: "Attraction saved to favorites!",
            favorite
        });

    } catch (error) {
        console.error("Save favorite error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save favorite."
        });
    }
}

// REMOVE AN ATTRACTION FROM FAVORITES
async function removeFavorite(req, res) {
    try {
        const { favoriteId } = req.params;

        if (!favoriteId) {
            return res.status(400).json({
                success: false,
                message: "Favorite ID is required."
            });
        }

        const user = await findUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const users = getUsersCollection();

        await users.updateOne(
            { _id: user._id },
            {
                $pull: {
                    favorites: { id: favoriteId }
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Favorite removed."
        });

    } catch (error) {
        console.error("Remove favorite error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to remove favorite."
        });
    }
}
// Export functions
module.exports = {
    getProfile,
    updateProfile,
    getFavorites,
    saveFavorite,
    removeFavorite
};