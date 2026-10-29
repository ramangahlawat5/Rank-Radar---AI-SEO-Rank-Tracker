import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register user
export const register = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if (!name || !email || !password) return res.status(400).json({
            success: false,
            message: "All fields are required" 
        });

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            await bcrypt.genSalt(10)
        );

        // Create user
        const user = await User.create({ name, email, password: hashedPassword });

        const token = generateToken(user._id);   // This token will be used for authentication in subsequent requests.

        res.status(201).json({ success: true, token, user });
    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({
            success: false,
            message: "All fields are required" 
        });

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user._id);        // _id is auto-generated in MongoDB

        res.status(200).json({ success: true, token, user });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get current user
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");    // The returned user won't contain the password field and userID will be added by middleware.
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Get user error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};













{/*
    User logs in
    |
    v
Server verifies credentials
    |
    v
JWT is generated using the user's ID
    |
    v
Token is sent to the frontend
    |
    v
Frontend sends the token with future requests


Salt Fn.

• Salt: A random piece of data added to a plaintext password before hashing. It ensures that identical passwords produce completely different hash outputs.
• Cost Factor (10): The number 10 represents the logarithmic work factor (or salt rounds). It means the underlying Blowfish-based hashing algorithm runs 2¹⁰ (1,024) iterations.
• Performance Impact: Each increment in the cost factor doubles the CPU time required to compute the hash (2¹¹ is twice as slow as 2¹⁰), making brute-force and dictionary attacks computationally expensive for attackers.

Bcrypt hashes and verifies the submitted password against the stored hash.
    Bcrypt uses a salt, so hashing the same password twice can produce different hash strings. bcrypt.compare() correctly verifies the password against the existing hash.


Improvements:
1. Although the password is hashed, you should never return it to the frontend during register or login. Instead, return a safe user object. Check how to do it later.
*/}