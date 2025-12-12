import User from "../models/User.model.js";
import FriendRequest from "../models/FriendRequest.model.js";
import e from "express";

export const getRecommendedUsers = async (req, res) => {
  try {
    const currentUser = req.user;

    const excludedIds = [...(currentUser.friends || []), currentUser._id];

    const recommendedUsers = await User.find({
      _id: { $nin: excludedIds },
      isOnboarded: true,
      location: {
        $geoWithin: {
          $centerSphere: [
            currentUser.location.coordinates,
            50 / 6371, // 50 km in radians
          ],
        },
      },
    })
      .limit(18)
      .exec();

    let recommendedUserIds = new Set(
      recommendedUsers.map((u) => u._id.toString())
    );

    // If fewer than 18, get more from same country
    // if (recommendedUsers.length < 18) {
    //   const additionalUsers = await User.find({
    //     _id: { $nin: [...excludedIds, ...Array.from(recommendedUserIds)] },
    //     isOnboarded: true,
    //     country: currentUser.country,
    //   })
    //     .limit(18 - recommendedUsers.length)
    //     .exec();

    //   // Push only new users not already in recommendedUsers
    //   additionalUsers.forEach((user) => {
    //     if (!recommendedUserIds.has(user._id.toString())) {
    //       recommendedUsers.push(user);
    //       recommendedUserIds.add(user._id.toString());
    //     }
    //   });
    // }

    res.status(200).json({
      success: true,
      message: "Recommended users fetched successfully",
      recommendedUsersCount: recommendedUsers.length,
      recommendedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recommended users",
      error: error.message,
    });
  }
};

export const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends");

    res.status(200).json({
      success: true,
      message: "Friends fetched successfully",
      friends: user.friends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching friends",
      error: error.message,
    });
  }
};

export const sendFriendRequest = async (req, res) => {
  const recipientId = req.params.id;
  const senderId = req.user._id;

  if (recipientId === senderId.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot send a friend request to yourself",
    });
  }

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    if (recipient.friends.includes(senderId)) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: senderId,
      recipient: recipientId,
    });

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      friendRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending friend request",
      error: error.message,
    });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user._id;

  try {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Check if the current user is the recipient of the request
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this friend request",
      });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user to the other's friends list
    const sender = await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    const recipient = await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    // Optionally, remove the friend request after acceptance
    // await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({
      success: true,
      message: "Friend request accepted successfully",
      friendRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accepting friend request",
      error: error.message,
    });
  }
};

export const declineFriendRequest = async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user._id;

  try {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Check if the current user is the recipient of the request
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to decline this friend request",
      });
    }

    friendRequest.status = "declined";
    await friendRequest.save();

    // Optionally, remove the friend request after declining
    // await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({
      success: true,
      message: "Friend request declined successfully",
      friendRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error declining friend request",
      error: error.message,
    });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const incomingReqs = await FriendRequest.find({
      recipient: userId,
      status: "pending",
    })
      .populate("sender", "fullName profilePicture")
      .exec();

    const acceptedReqs = await FriendRequest.find({
      recipient: userId,
      status: "accepted",
    })
      .populate("sender", "fullName profilePicture")
      .exec();

    res.status(200).json({
      success: true,
      message: "Friend requests fetched successfully",
      incomingReqs,
      acceptedReqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching friend requests",
      error: error.message,
    });
  }
};

export const getOutgoingFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const outgoingReqs = await FriendRequest.find({
      sender: userId,
      status: "pending",
    })
      .populate("recipient", "userName profilePicture")
      .exec();

    res.status(200).json({
      success: true,
      message: "Outgoing friend requests fetched successfully",
      outgoingReqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching outgoing friend requests",
      error: error.message,
    });
  }
};
