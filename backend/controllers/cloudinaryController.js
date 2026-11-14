// VAYCAY Cloudinary Controller

const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

// Generate secure image upload signature
async function createProfilePhotoSignature(req, res) {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        
        if (!cloudName || !apiKey || !apiSecret) {
            return res.status(500).json({
                success: false,
                message: "Cloudinary is not configured."
            });
        }

        const { photoType } = req.body;

        if (photoType !== "profile" && photoType !== "cover") {
            return res.status(400).json({
                success: false,
                message: "Invalid photo type."
            });
        }

        const timestamp = Math.floor(Date.now() / 1000);

        const folder = photoType === "profile"
            ? "vaycay/profile-photos"
            : "vaycay/cover-photos";

        const publicId = `${photoType}_${req.user.userId}_${crypto.randomUUID()}`;

        const uploadParams = {
            timestamp,
            folder,
            public_id: publicId
        };

        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            apiSecret
        );

        return res.status(200).json({
            success: true,
            cloudName,
            apiKey,
            timestamp,
            folder,
            publicId,
            signature
        });

    } catch (error) {
        console.error("Cloudinary signature error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to prepare photo upload."
        });
    }
}

module.exports = {
    createProfilePhotoSignature
};
