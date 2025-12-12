import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protectRoute = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized access - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized access - Invalid token" });
    }
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Unauthorized access - User not found" });
    }

    // console.log("user:", user);
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
