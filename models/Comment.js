import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {
        type: String
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
}, { timestamps: true })

const CommentModel = mongoose.model('Comment', commentSchema)
export default CommentModel