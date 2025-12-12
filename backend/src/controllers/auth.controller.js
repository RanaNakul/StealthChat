import User from "../models/User.model.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

export const signup = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists, please use a different email" });
    }

    const idx = Math.random().toString(36).substring(7);
    const avatarUrl = `https://api.dicebear.com/9.x/fun-emoji/png?seed=${idx}`;

    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePicture: avatarUrl,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePicture || "",
      });
      // console.log(`Stream user upserted successfully for ${newUser.fullName}`);
    } catch (error) {
      console.error("Error upserting Stream user:", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Helps prevent CSRF attacks
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // TODO: Update user status to online
    // user.isOnline = true; // Set user as online
    // user.lastSeen = new Date(); // Update last seen time
    // await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const onboard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = req.user._id;
  const { fullName, bio, profilePicture, country, userName } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName) {
      user.fullName = fullName;
    }

    user.userName = userName;
    user.bio = bio;
    user.country = country;
    user.isOnboarded = true;

    if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    try {
      // Upsert user in Stream
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePicture || "",
        username: user.userName,
      });
    } catch (error) {
      console.error("Error upserting Stream user during onboarding:", error);
    }

    res.status(200).json({
      success: true,
      message: "User onboarding successful",
      user,
    });
  } catch (error) {
    console.error("Error in onboarding controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user._id;
  const { fullName, bio, profilePicture, country, userName } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (userName) {
      user.userName = userName;
    }

    if (bio) {
      user.bio = bio;
    }
    if (country) {
      user.country = country;
    }

    if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    try {
      // Upsert user in Stream
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePicture || "",
        username: user.userName,
      });
    } catch (error) {
      console.error(
        "Error upserting Stream user during profile update:",
        error
      );
    }

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStatus = async (req, res) => {
  const userId = req.user._id;
  const { status } = req.body; // expected values: 'online', 'offline', 'busy'

  // console.log(status)
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log(user)

    user.isOnline = status;
    if (status === "offline") {
      user.lastSeen = new Date();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in updateStatus controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};