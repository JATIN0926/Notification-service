import amqp from "amqplib";

const QUEUE_NAME = "notification_queue";

export const publishToQueue = async (message) => {
  const connection = await amqp.connect("amqp://rabbitmq");

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
