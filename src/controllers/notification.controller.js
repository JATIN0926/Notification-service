import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import sendEmail from "../services/email.service.js";
import sendSMS from "../services/sms.service.js";
import { publishToQueue } from "../queue/publisher.js";

const sendNotification = asyncHandler(async (req, res) => {
  const { userId, type, message } = req.body;

  if (!userId || !type || !message) {
    throw new ApiError(400, "userId, type, and message are required");
  }

  if (!["email", "sms", "in-app"].includes(type)) {
    throw new ApiError(400, "Invalid notification type");
  }

  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await publishToQueue({
    userId,
    type,
    message,
    retryCount: 0,
  });

  res
    .status(202)
    .json(new ApiResponse(202, null, "Notification queued successfully"));
});

export { sendNotification };
