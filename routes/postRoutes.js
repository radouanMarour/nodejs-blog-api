import express from "express";
import Post from "../models/Post.js";
import verifyToken from "../middlewares.js";
import upload from "../configs/multer.js";
import cloudinary from "../configs/cloudinary.js";

const router = express.Router();

// Create a post
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const image = req.file.path;

        const imageUrl = await cloudinary.uploader.upload(image, { resource_type: 'auto' });

        const post = new Post({
            title,
            content,
            image: imageUrl.url,
            author: req.userId,
            category,
        });

        const savedPost = await post.save();

        res.status(201).json({
            status: "success",
            message: "Post created successfully",
            data: savedPost,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Failed to create post",
            error: err.message,
        });
    }
});

router.get('/search', async (req, res) => {
    const { query } = req.query
    try {
        const posts = await Post.find({ title: { $regex: query } })
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


// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'name').populate('category', 'name');

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

// Get a single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name').populate('category', 'name');

        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Post retrieved successfully",
            data: post,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve post",
            error: err.message,
        });
    }
});

// Update a post
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const { id } = req.params;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }

        if (post.author.toString() !== req.userId) {
            return res.status(403).json({
                status: "error",
                message: "You are not authorized to update this post",
            });
        }

        // Update fields
        if (title) post.title = title;
        if (content) post.content = content;
        if (category) post.category = category;

        if (req.file) {
            const imageUrl = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });
            post.image = imageUrl.url;
        }

        const updatedPost = await post.save();

        res.status(200).json({
            status: "success",
            message: "Post updated successfully",
            data: updatedPost,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Failed to update post",
            error: err.message,
        });
    }
});

// Delete a post
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }

        if (post.author.toString() !== req.userId) {
            return res.status(403).json({
                status: "error",
                message: "You are not authorized to delete this post",
            });
        }

        await Post.deleteOne({ _id: id });

        res.status(200).json({
            status: "success",
            message: "Post deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete post",
            error: err.message,
        });
    }
});

export default router;

