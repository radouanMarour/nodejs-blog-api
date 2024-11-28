import express from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import verifyToken from "../middlewares.js";

const router = express.Router();

// POST: /comments/:postId
router.post('/:postId', verifyToken, async (req, res) => {
    try {
        const { content } = req.body;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const newComment = new Comment({
            content,
            author: req.userId,
            post: postId,
        });

        const savedComment = await newComment.save();
        post.comments.push(savedComment._id); // Add the comment ID to the post's comments array
        await post.save();

        res.status(201).json({
            success: true,
            message: "Comment created successfully!",
            data: savedComment,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || "Server error",
        });
    }
});

// GET: /comments/:postId
router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId }).populate("author");
        res.status(200).json({
            success: true,
            data: comments,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || "Server error",
        });
    }
});


export default router