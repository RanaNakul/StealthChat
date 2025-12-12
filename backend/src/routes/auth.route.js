import express from "express";
import { body } from "express-validator";
const router = express.Router();

import {
  login,
  signup,
  logout,
  onboard,
  updateProfile,
  updateStatus,
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  login
);

router.post(
  "/signup",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  signup
);

router.post("/logout", logout);

// TODO: forget-password
// TODO: change-password

router.post(
  "/onboarding",
  [
    body("userName").notEmpty().withMessage("userName is required"),
    body("bio").notEmpty().withMessage("Bio is required"),
    body("country").notEmpty().withMessage("Country is required"),
  ],
  protectRoute,
  onboard
);

router.post("/update-profile", protectRoute, updateProfile);

router.post("/update-status", protectRoute, updateStatus)

// Get current user if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
