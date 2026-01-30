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
  const queue = "hello_queue";

  await channel.assertQueue(queue, {
    durable: true,
  });

  console.log("Consumer đang chờ nhận messages...");
  console.log("Nhấn CTRL+C để thoát\n");

  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const content = msg.content.toString();
      console.log(`Đã nhận: ${content}`);

      channel.ack(msg);
    }
  });
}

receiveMessage().catch(console.error);
