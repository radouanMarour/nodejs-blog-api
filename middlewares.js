import jwt from "jsonwebtoken"
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY)
        req.userId = decoded.id
        next()
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export default verifyToken