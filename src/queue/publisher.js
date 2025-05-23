import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();
const QUEUE_NAME = "notification_queue";

export const publishToQueue = async (message) => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);


  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log("Message sent to queue");
  setTimeout(() => {
    connection.close();
  }, 500);
};
