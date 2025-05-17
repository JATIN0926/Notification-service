import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const formattedErrors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: formattedErrors.join(', '),
      errors: formattedErrors,
      data: null,
    });
  }

  console.error('Unhandled Error:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    errors: [],
    data: null,
  });
};

export default errorHandler;
