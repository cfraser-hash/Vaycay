// VAYCAY API Routes

const { signup, login } = require("../controllers/authController");

const {
    getProfile,
    updateProfile,
    getFavorites,
    saveFavorite,
    removeFavorite
} = require("../controllers/userController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");

const {
    createProfilePhotoSignature
} = require("../controllers/cloudinaryController");

// Send JSON responses
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

// Express-style response adapter
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

// GEOAPIFY: SEARCH DESTINATIONS
async function searchDestinations(req, res, requestUrl) {
    try {
        const apiKey = process.env.GEOAPIFY_API_KEY;
        const query = requestUrl.searchParams.get("text")?.trim();

        if (!apiKey) {
            return sendJson(res, 500, {
                success: false,
                message: "Geoapify API key is not configured."
            });
        }

        if (!query || query.length < 2 || query.length > 120) {
            return sendJson(res, 400, {
                success: false,
                message: "Enter at least 2 characters to search."
            });
        }

        const geoUrl = new URL(
            "https://api.geoapify.com/v1/geocode/autocomplete"
        );

        geoUrl.searchParams.set("text", query);
        geoUrl.searchParams.set("format", "json");
        geoUrl.searchParams.set("limit", "8");
        geoUrl.searchParams.set("apiKey", apiKey);

        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoResponse.ok) {
            console.error("Geoapify autocomplete error:", geoData);

            return sendJson(res, 502, {
                success: false,
                message: "Unable to search destinations right now."
            });
        }

        const results = (geoData.results || []).map((place) => ({
            id: place.place_id,
            name: place.name || place.address_line1 || place.formatted,
            country: place.country || "",
            city: place.city || "",
            state: place.state || "",
            formatted: place.formatted || "",
            latitude: place.lat,
            longitude: place.lon,
            type: place.result_type || ""
        }));

        return sendJson(res, 200, {
            success: true,
            results
        });

    } catch (error) {
        console.error("Destination search error:", error);

        return sendJson(res, 502, {
            success: false,
            message: "Destination search failed."
        });
    }
}

// GEOAPIFY: FIND NEARBY ATTRACTIONS
async function searchNearbyPlaces(req, res, requestUrl) {
    try {
        const apiKey = process.env.GEOAPIFY_API_KEY;

        const latitude = Number(requestUrl.searchParams.get("lat"));
        const longitude = Number(requestUrl.searchParams.get("lon"));

        const category =
            requestUrl.searchParams.get("category") || "attractions";

        const categoryOptions = {
            attractions: "tourism",
            museums: "entertainment.museum",
            beaches: "beach",
            parks: "leisure.park",
            culture: "entertainment.culture"
        };
        const radius = category === "beaches" ? 150000 : 10000;

        if (!apiKey) {
            return sendJson(res, 500, {
                success: false,
                message: "Geoapify API key is not configured."
            });
        }

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return sendJson(res, 400, {
                success: false,
                message: "A valid latitude and longitude are required."
            });
        }

        if (!categoryOptions[category]) {
            return sendJson(res, 400, {
                success: false,
                message: "Invalid attraction category."
            });
        }

        const geoUrl = new URL(
            "https://api.geoapify.com/v2/places"
        );

        geoUrl.searchParams.set(
            "categories",
            categoryOptions[category]
        );

        geoUrl.searchParams.set(
            "filter",
            `circle:${longitude},${latitude},${radius}`
        );

        geoUrl.searchParams.set(
            "bias",
            `proximity:${longitude},${latitude}`
        );

        geoUrl.searchParams.set("limit", "20");
        geoUrl.searchParams.set("apiKey", apiKey);

        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoResponse.ok) {
            console.error("Geoapify places error:", geoData);

            return sendJson(res, 502, {
                success: false,
                message: "Unable to find nearby attractions."
            });
        }

        const results = await Promise.all(
            (geoData.features || [])
                .filter((feature) => feature.properties.place_id)
                .map(async (feature) => {
                    const place = feature.properties || {};

                    const name =
                        place.name ||
                        place.address_line1 ||
                        "Unnamed place";


                    let image = null;
                    let imageAttribution = null;

                    try {
                        const imageUrl = new URL(
                            "https://commons.wikimedia.org/w/api.php"
                        );

                        const searchText = name;

                        imageUrl.searchParams.set("action", "query");
                        imageUrl.searchParams.set("generator", "search");
                        imageUrl.searchParams.set("gsrsearch", searchText);
                        imageUrl.searchParams.set("gsrnamespace", "6");
                        imageUrl.searchParams.set("gsrlimit", "5");
                        imageUrl.searchParams.set("prop", "imageinfo");
                        imageUrl.searchParams.set("iiprop", "url|mime|extmetadata");
                        imageUrl.searchParams.set("iiurlwidth", "600");
                        imageUrl.searchParams.set("format", "json");
                        imageUrl.searchParams.set("origin", "*");

                        const imageResponse = await fetch(imageUrl);
                        const imageData = await imageResponse.json();
                            console.log("WIKIMEDIA STATUS:", imageResponse.status);
                            console.log("WIKIMEDIA RESULTS:", Object.keys(imageData.query?.pages || {}).length);
                            console.log("WIKIMEDIA ERROR:", imageData.error || "None");``

                        const pages = Object.values(
                            imageData.query?.pages || {}
                        ).sort((a, b) => (a.index || 0) - (b.index || 0));

                        // Only accept common photo formats
                        const validExtensions = [
                            ".jpg",
                            ".jpeg",
                            ".png",
                            ".webp",
                            ".gif"
                        ];

                        console.log("IMAGE SEARCH:", name);
                        console.log("PAGES FOUND:", pages.length);

                        const matchingPage = pages.find((page) => {
                            const imageInfo = page.imageinfo?.[0];

                            if (!imageInfo) {
                                return false;
                            }


                            return (
                                imageInfo.mime?.startsWith('image/') &&
                                imageInfo.mime != "image/svg+xml"
                            )
                        });

                        const imageInfo = matchingPage?.imageinfo?.[0];

                        if (imageInfo) {
                            image =
                                imageInfo.thumburl ||
                                imageInfo.url ||
                                null;

                            imageAttribution =
                                imageInfo.extmetadata?.Artist?.value ||
                                null;
                        }

                    } catch (imageError) {
                        console.error(
                            `Image lookup failed for ${name}:`,
                            imageError.message
                        );
                    }


                    return {
                        id: place.place_id,
                        name,
                        address: place.formatted || "",
                        latitude: place.lat,
                        longitude: place.lon,
                        categories: place.categories || [],
                        distance: place.distance || null,
                        image,
                        imageAttribution
                    };
                })
        );
                return sendJson(res, 200, {
            success: true,
            results
        });

    } catch (error) {
        console.error("Nearby places error:", error);

        return sendJson(res, 502, {
            success: false,
            message: "Nearby attraction search failed."
        });
    }
}

// HANDLE API REQUESTS
async function handleRoutes(req, res) {
    const requestUrl = new URL(
        req.url,
        "http://localhost"
    );

    const method = req.method;
    const url = requestUrl.pathname;

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
                        "PUT /api/users/profile",
                        "POST /api/users/profile-photo/sign",
                        "GET /api/places/autocomplete?text=Paris",
                        "GET /api/places/nearby?lat=48.8584&lon=2.2945&category=attractions",
                        "GET /api/users/favorites",
                        "POST /api/users/favorites",
                        "DELETE /api/users/favorites/:favoriteId"
                    ]
                });
            }

            // GEOAPIFY DESTINATION AUTOCOMPLETE
            if (
                method === "GET" &&
                url === "/api/places/autocomplete"
            ) {
                return await searchDestinations(
                    req,
                    res,
                    requestUrl
                );
            }

            // GEOAPIFY NEARBY ATTRACTIONS
            if (
                method === "GET" &&
                url === "/api/places/nearby"
            ) {
                return await searchNearbyPlaces(
                    req,
                    res,
                    requestUrl
                );
            }

            // CREATE PROFILE PHOTO UPLOAD SIGNATURE
            if (
                method === "POST" &&
                url === "/api/users/profile-photo/sign"
            ) {
                return authenticateUser(req, response, async () => {
                    await createProfilePhotoSignature(req, response);
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
            // GET USER FAVORITES
            if (
                method === "GET" &&
                url === "/api/users/favorites"
            ) {
                return authenticateUser(req, response, async () => {
                    await getFavorites(req, response);
                });
            }

            // SAVE USER FAVORITE
            if (
                method === "POST" &&
                url === "/api/users/favorites"
            ) {
                return authenticateUser(req, response, async () => {
                    await saveFavorite(req, response);
                });
            }

            // REMOVE USER FAVORITE
            const favoriteMatch = url.match(
                /^\/api\/users\/favorites\/([^/]+)$/
            );

            if (method === "DELETE" && favoriteMatch) {
                req.params = {
                    favoriteId: decodeURIComponent(favoriteMatch[1])
                };

                return authenticateUser(req, response, async () => {
                    await removeFavorite(req, response);
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
    
