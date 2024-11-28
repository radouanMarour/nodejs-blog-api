import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import verifyToken from "../middlewares.js";
import upload from "../configs/multer.js";
import cloudinary from "../configs/cloudinary.js";

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const TOKEN_EXPIRY = "1h"; // Token expiry time

// Register a user
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Name, email, and password are required.",
        });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "User already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({
            status: "success",
            message: "User registered successfully.",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Server error.",
            error: err.message,
        });
    }
});

// Login a user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email and password are required.",
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found.",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                status: "error",
                message: "Invalid credentials.",
            });
        }

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });

        res.status(200).json({
            status: "success",
            message: "Login successful.",
            data: { token },
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Server error.",
            error: err.message,
        });
    }
});

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found.",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Profile retrieved successfully.",
            data: user,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Server error.",
            error: err.message,
        });
    }
});

// Update user profile
router.put("/profile", verifyToken, async (req, res) => {
    const { name, email, bio, profileImage } = req.body;

    if (!name && !email && !bio && !req.file) {
        return res.status(400).json({
            status: "error",
            message: "At least one field (name, email, or bio) is required for update.",
        });
    }

    try {
        if (req.file) {
            const imageUrl = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });
            profileImage = imageUrl.url;
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { name, email, bio, profileImage },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                status: "error",
                message: "User not found.",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Profile updated successfully.",
            data: updatedUser,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Server error.",
            error: err.message,
        });
    }
});


// Update user profile image
router.put("/profile/image", verifyToken, upload.single("profileImage"), async (req, res) => {
    try {
        let imageUrl = ""
        if (req.file) {
            imageUrl = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { profileImage: imageUrl.url },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                status: "error",
                message: "User not found.",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Image updated successfully.",
            data: updatedUser,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Server error.",
            error: err.message,
        });
    }
});

export default router;

