import mongoose from "mongoose";
import { faker } from '@faker-js/faker';
import bcrypt from "bcrypt";
import User from "./models/User.js"; // Adjust the import path to your User model
import Category from "./models/Category.js"; // Adjust the import path to your Category model
import Post from "./models/Post.js"; // Adjust the import path to your Post model
import dotenv from "dotenv"
dotenv.config()



mongoose.connect(process.env.MONGO_URI)
    .then(() => mongoose.connection.db.dropDatabase())
    .then(() => console.log('Database dropped successfully!'))
    .catch((err) => console.error(err));

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.log("Failed to connect to the database", err));

// Dummy data creation function
const createDummyData = async () => {
    try {
        const users = [];
        for (let i = 0; i < 5; i++) {
            let email;
            // Ensure email is unique
            do {
                email = faker.internet.email();
            } while (await User.findOne({ email })); // Check if email already exists

            const hashedPassword = await bcrypt.hash("12345678", 10);
            const newUser = new User({
                name: faker.person.fullName(),
                email: email, // Use the unique email
                password: hashedPassword,
            });
            users.push(await newUser.save());
            console.log(`User ${i + 1} created: ${newUser.name}`);
        }

        // Create 5 dummy categories
        const categories = [];
        for (let i = 0; i < 5; i++) {
            const newCategory = new Category({
                name: faker.commerce.department(),
            });
            categories.push(await newCategory.save());
            console.log(`Category ${i + 1} created: ${newCategory.name}`);
        }

        // Create 5 dummy posts
        for (let i = 0; i < 10; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];

            const newPost = new Post({
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraphs(),
                image: faker.image.urlPicsumPhotos(),
                author: randomUser._id,
                category: randomCategory._id,
            });

            await newPost.save();
            console.log(`Post ${i + 1} created: ${newPost.title}`);
        }

        console.log("Dummy users, categories, and posts created successfully!");
    } catch (err) {
        console.error("Error creating dummy data", err);
    } finally {
        mongoose.connection.close(); // Close the connection after the script is finished
    }
};

// Call the function to create dummy data
createDummyData();
