import twilio from 'twilio';
import dotenv from "dotenv";
import { ApiError } from '../utils/ApiError.js';

dotenv.config();
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log('SMS sent:', result.sid);
    return result;
  } catch (err) {
    console.error('SMS sending failed:', err);
    throw new ApiError(400, 'Failed to send SMS');
  }
};

export default sendSMS;
