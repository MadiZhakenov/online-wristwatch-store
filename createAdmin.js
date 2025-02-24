require("dotenv").config();  // Load environment variables

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { User } = require("./models/models"); // ✅ Correct import

mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const adminUser = new User({
            name: "admin",  // ✅ Use 'name' instead of 'username'
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin"
        });

        await adminUser.save();
        console.log("Admin user created successfully!");
    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        mongoose.connection.close();  // Ensure connection closes
    }
};

createAdmin();
