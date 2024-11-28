import express from "express"
import Category from "../models/Category.js"

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find()
        res.status(200).json({
            status: "sucess",
            message: "Categories retrieved sucessfully",
            data: categories
        })
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve categories",
            error: err.message
        })
    }
})

export default router