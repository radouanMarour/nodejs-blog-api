import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 8 },
    role: {
        type: String, enum: ['user', 'admin'], default: 'user'
    },
    bio: {
        type: String, maxLength: 200
    },
    profileImage: {
        type: String, default: ""
    }
}, { timestamps: true })

const userModel = mongoose.model('User', userSchema)

export default userModel