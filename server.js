import express from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from "dotenv"

import postRoutes from './routes/postRoutes.js'
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import commentRoutes from './routes/commentRoutes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.ORIGIN_URL || "http://localhost:5173", // Update with the Netlify or Vercel URL
    credentials: true
}));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)

// Connect to MongoDB
connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

// Sample Route
// app.get('/', (req, res) => res.send('Blog API is running'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
