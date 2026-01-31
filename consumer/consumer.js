const amqp = require("amqplib");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function receiveMessage() {
  let connection;
  let retries = 10;

  while (retries > 0) {
    try {
      console.log("Đang kết nối đến RabbitMQ...");
      connection = await amqp.connect("amqp://admin:admin@rabbitmq:5672");
      console.log("Kết nối thành công!");
      break;
    } catch (error) {
      console.log(`Không thể kết nối, thử lại... (${retries} lần còn lại)`);
      retries--;
      await sleep(5000);
      if (retries === 0) {
        console.error("Không thể kết nối đến RabbitMQ");
        process.exit(1);
      }
    }
  }

  const channel = await connection.createChannel();
  const queue = "booking_queue";

  await channel.assertQueue(queue, {
    durable: true,
  });

  console.log("Consumer đang chờ nhận messages...");

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const content = msg.content.toString();

      try {
        const messageData = JSON.parse(content);
        console.log(`Booking ID: ${messageData.bookingId}`);
        console.log(`Message: ${messageData.message}`);
        console.log(
          `Timestamp: ${new Date(messageData.timestamp).toLocaleString()}`,
        );
      } catch (error) {
        console.log(`Đã nhận (text): ${content}`);
      }

      channel.ack(msg);
    }
  });
}

receiveMessage().catch(console.error);
