import Notification from '../models/notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /notifications
const sendNotification = asyncHandler(async (req, res, next) => {
  const { userId, type, message } = req.body;

  // Basic validation
  if (!userId || !type || !message) {
    throw new ApiError(400, 'userId, type, and message are required');
  }

  if (!['email', 'sms', 'in-app'].includes(type)) {
    throw new ApiError(400, 'Invalid notification type');
  }

  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  // Create notification (initial status 'pending')
  const notification = await Notification.create({
    userId,
    type,
    message,
    status: 'pending',
  });

  // For now, we just save it without sending real email/sms
  // Later, you can add sending logic here or in a worker queue

  res.status(201).json(new ApiResponse(201, notification, 'Notification created successfully'));
});

export { sendNotification };
