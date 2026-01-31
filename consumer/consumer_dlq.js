const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://admin:admin@rabbitmq:5672";
const QUEUE = "booking_queue";
const DEAD_LETTER_QUEUE = "booking_queue.dlq";

let channel;

async function connectWithRetry() {
  try {
    console.log("Consumer connecting...");
    const conn = await amqp.connect(RABBITMQ_URL);
    channel = await conn.createChannel();

    await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
    console.log(`Dead Letter Queue '${DEAD_LETTER_QUEUE}' created`);

    await channel.assertQueue(QUEUE, {
      durable: true,
      deadLetterExchange: "",
      deadLetterRoutingKey: DEAD_LETTER_QUEUE,
    });
    console.log(`Main Queue '${QUEUE}' created with DLQ support`);

    console.log("Waiting for messages...");
    console.log("Press CTRL+C to exit\n");

    // Consume từ queue chính
    channel.consume(
      QUEUE,
      async (msg) => {
        if (!msg) return;

        const body = msg.content.toString();
        console.log("Processing:", body);

        try {
          const data = JSON.parse(body);

          if (!data.bookingId) {
            throw new Error("Missing bookingId - Invalid message format!");
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));

          console.log("Process success");
          console.log(`Booking ID: ${data.bookingId}`);
          console.log(`Message: ${data.message}`);
          console.log(
            `  Timestamp: ${new Date(data.timestamp).toLocaleString()}`,
          );

          channel.ack(msg);
        } catch (err) {
          console.error("Error:", err.message);
          console.log("Sending message to DLQ...");

          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );
  } catch (err) {
    console.error("Consumer failed:", err.message);
    console.log("Retry in 3s...");
    setTimeout(connectWithRetry, 3000);
  }
}

connectWithRetry();
