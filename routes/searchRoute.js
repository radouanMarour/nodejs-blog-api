import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

router.get('/', async (req, res) => {
    const { query } = req.query
    console.log(query)
    try {
        const posts = await Post.find()
            .populate('author', 'name').populate('category', 'name');

        res.status(200).json({
            status: "success",
            message: "Posts retrieved successfully",
            data: posts,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve posts",
            error: err.message,
        });
    }
});

export default router