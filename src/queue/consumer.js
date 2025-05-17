import amqp from "amqplib";
import sendEmail from "../services/email.service.js";
import sendSMS from "../services/sms.service.js";
import Notification from "../models/notification.model.js";
import connectDB from "../config/db.js";
import User from "../models/user.model.js";

const QUEUE_NAME = "notification_queue";
const MAX_RETRIES = 3;

export const startConsumer = async () => {
  try {
    // ✅ DB connect
    await connectDB();
    console.log("✅ MongoDB connected");

    // ✅ RabbitMQ connect
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log("🎯 Waiting for messages in queue...");

    // ✅ Consumer start
    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        console.log("📩 Message received from queue");
        const data = JSON.parse(msg.content.toString());
        const { userId, type, message, retryCount = 0 } = data;

        console.log(
          `➡️  Processing notification for user: ${userId}, type: ${type}`
        );

        let status = "failed";

        try {
          // ✅ Fetch user from DB
          const user = await User.findById(userId);
          if (!user) throw new Error(`User not found: ${userId}`);

          const phone = user.phone;
          const email = user.email;

          if (type === "email") {
            if (!email) throw new Error("User email missing.");
            console.log(`📧 Sending email to ${email}`);
            await sendEmail(email, "New Notification", message);
          } else if (type === "sms") {
            if (!phone) throw new Error("User phone missing.");
            console.log(`📱 Sending SMS to ${phone}`);
            await sendSMS(phone, message);
          } else {
            console.log("📲 In-app notification assumed sent");
          }

          status = "sent";
        } catch (err) {
          console.error(
            `❌ Failed to send notification (try ${retryCount + 1}):`,
            err
          );

          if (retryCount < MAX_RETRIES) {
            console.log("🔁 Requeuing message for retry...");
            channel.sendToQueue(
              QUEUE_NAME,
              Buffer.from(
                JSON.stringify({ ...data, retryCount: retryCount + 1 })
              ),
              { persistent: true }
            );
          }
        }

        try {
          await Notification.create({ userId, type, message, status });
          console.log(`✅ Notification saved with status: ${status}`);
        } catch (dbErr) {
          console.error("❌ Failed to save notification to DB:", dbErr);
        }

        channel.ack(msg);
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("❌ Consumer failed to start:", err);
  }
};

// ✅ Automatically start consumer when this file runs
startConsumer();
