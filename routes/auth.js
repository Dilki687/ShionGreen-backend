const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library"); // Importing the Google OAuth2 Client

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Google Client ID from your environment variables

// Initialize OAuth2 Client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper function to generate JWT token
const generateJwtToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Create new user with plain text password
    const newUser = new User({ name, email, password, role });

    // Save user to database (password will be hashed by the pre("save") hook)
    await newUser.save();

    console.log("User Saved:", newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Error signing up", error: err });
  }
});

// Login Route (Email/Password)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("Submitted Password:", password);
    console.log("Stored Hashed Password:", user.password);

    // Compare the submitted password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match Result:", isMatch);

    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ user, token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Error logging in", error: err });
  }
});

// Google Login Route
router.post("/google", async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        password: null,
      });
      await user.save();
    }

    const token = generateJwtToken(user);
    res.status(200).json({ user, token });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(400).json({ message: "Invalid Google token" });
  }
});

// Google Signup Route
router.post("/google-signup", async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        googleId: payload.sub,
        name,
        email,
        password: null,
      });
      await user.save();
    }

    const token = generateJwtToken(user);
    res.status(200).json({ user, token });
  } catch (err) {
    console.error("Google Signup Error:", err);
    res.status(400).json({ message: "Invalid Google token" });
  }
});

module.exports = router;
