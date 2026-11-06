// VAYCAY API Service

const API_URL = "http://localhost:3000/api";

// Signup request
export async function signupUser(userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
}) {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Signup failed.");
    }

    return data;
}

// Login request
export async function loginUser(userData: {
    email: string;
    password: string;
}) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed.");
    }

    return data;
}