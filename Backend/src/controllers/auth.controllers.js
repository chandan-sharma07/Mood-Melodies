const userModels = require("../models/user.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");
const redisClient = require("../config/cache");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 3 * 24 * 60 * 60 * 1000,
};

const sanitizeUser = (user) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  return safeUser;
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    const isAlreadyExist = await userModels.findOne({
      $or: [{ email }, { username }],
    });
    if (isAlreadyExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModels.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.cookie("token", token, cookieOptions);
    res
      .status(200)
      .json({
        message: "User registered successfully",
        user: sanitizeUser(user),
      });
  } catch (error) {
    console.log("Register body:", req.body);
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Error registering user" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userModels.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.cookie("token", token, cookieOptions);
    res
      .status(200)
      .json({
        message: "User logged in successfully",
        user: sanitizeUser(user),
      });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, process.env.JWT_SECRET);

    const isBlacklisted = await blacklistModel.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await blacklistModel.create({ token });
    await redisClient.set(token, "blacklisted", "EX", 60 * 60 * 24 * 3);

    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error logging out user",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await userModels.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "User fetched successfully",
        user: sanitizeUser(user),
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

const logMood = async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood) return res.status(400).json({ message: "Mood is required" });

    const user = await userModels.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.moodHistory.push({ mood, timestamp: new Date() });

    const moodCounts = {};
    let maxMood = user.favoriteMood || "Neutral";
    let maxCount = 0;
    user.moodHistory.forEach((h) => {
      moodCounts[h.mood] = (moodCounts[h.mood] || 0) + 1;
      if (moodCounts[h.mood] > maxCount) {
        maxCount = moodCounts[h.mood];
        maxMood = h.mood;
      }
    });
    user.favoriteMood = maxMood;

    await user.save();
    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error logging mood" });
  }
};

const logSong = async (req, res) => {
  try {
    const user = await userModels.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.totalSongsPlayed = (user.totalSongsPlayed || 0) + 1;
    await user.save();

    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error logging song" });
  }
};

const getRecommendedArtists = async (req, res) => {
  try {
    const artists = [
      "Arijit Singh",
      "KK",
      "Shreya Ghoshal",
      "Atif Aslam",
      "Anuv Jain",
    ];
    res.status(200).json({ success: true, artists });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error fetching artists" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  logMood,
  logSong,
  getRecommendedArtists,
};
