import express from "express";
// import { body } from "express-validator";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getMyFriends,
  getRecommendedUsers,
  sendFriendRequest,
  getFriendRequests,
  getOutgoingFriendRequests,
} from "../controllers/user.controller.js";

const router = express.Router();

// Apply the authentication middleware to all routes in this router
router.use(protectRoute);

router.get("/", getRecommendedUsers);

router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.delete("/friend-request/:id/decline", declineFriendRequest);

router.get("/friend-requests", getFriendRequests);

router.get("/outgoing-friend-requests", getOutgoingFriendRequests);



export default router;
