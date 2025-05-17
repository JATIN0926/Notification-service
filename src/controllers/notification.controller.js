import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
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

  const notification = await Notification.create({
    userId,
    type,
    message,
    status: "pending",
  });

  await publishToQueue({
    notificationId: notification._id,
    userId,
    type,
    message,
    retryCount: 0,
  });

  res.status(202).json(
    new ApiResponse(
      202,
      {
        notificationId: notification._id,
        userId,
        notificationType: type,
        queuedAt: new Date(),
      },
      "Notification has been accepted and queued for processing."
    )
  );
});


const getNotificationStatus = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid notification ID format");
  }

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notificationId: notification._id,
        userId: notification.userId,
        type: notification.type,
        message: notification.message,
        status: notification.status,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      },
      "Notification status fetched successfully"
    )
  );
});

export { sendNotification  , getNotificationStatus};
