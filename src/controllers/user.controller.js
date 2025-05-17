import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUserNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const notifications = await Notification.find({ userId }).sort({
    createdAt: -1,
  });

  // Respond with notifications
  res.status(200).json(new ApiResponse(200, notifications));
});

const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    throw new ApiError(400, "name, email and phone are required");
  }

  if (!/^\+91\d{10}$/.test(phone)) {
    throw new ApiError(400, "Phone number must be in +91XXXXXXXXXX format");
  }

  // Check if user already exists by email or phone (optional)
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });
  if (existingUser) {
    throw new ApiError(400, "User with this email or phone already exists");
  }

  const user = await User.create({ name, email, phone });

  res.status(201).json(new ApiResponse(201, user, "User created successfully"));
});

export { getUserNotifications, createUser };
