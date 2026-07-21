const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
    try {
        // Force Node.js to use Google DNS for this application to bypass your Wi-Fi's DNS block
        dns.setServers(['8.8.8.8', '8.8.4.4']);

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

module.exports = connectDB;