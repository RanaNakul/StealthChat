import { generateStreamToken } from "../lib/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.user.id);
    res.status(200).json({
      success: true,
      message: "Token generated successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate token",
      error: error.message,
    });
    console.error("Error in getStreamToken controller:", error);
  }
};
