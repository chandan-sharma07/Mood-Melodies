const blacklistModel = require("../models/blacklist.model");
const redisClient = require("../config/cache");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isBlacklistedInRedis = await redisClient.get(token);
        if (isBlacklistedInRedis === "blacklisted") {
            return res.status(401).json({ message: "Unauthorized (Token Blacklisted)" });
        }

        const isBlacklistedInDB = await blacklistModel.findOne({ token });
        if (isBlacklistedInDB) {
            return res.status(401).json({ message: "Unauthorized (Token Blacklisted in DB)" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.error(error);
        res.status(500).json({ message: "Error authenticating user" });
    }
};

module.exports = authMiddleware;
