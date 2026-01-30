const amqp = require("amqplib");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let channel = null;
let connection = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Kết nối RabbitMQ
async function connectRabbitMQ() {
  let retries = 10;

  while (retries > 0) {
    try {
      console.log("Đang kết nối đến RabbitMQ...");
      connection = await amqp.connect("amqp://admin:admin@rabbitmq:5672");
      console.log("Kết nối RabbitMQ thành công!");

      channel = await connection.createChannel();
      const queue = "hello_queue";

      await channel.assertQueue(queue, {
        durable: true,
      });

      console.log(`Queue '${queue}' đã sẵn sàng!`);
      return true;
    } catch (error) {
      console.log(`Không thể kết nối, thử lại... (${retries} lần còn lại)`);
      retries--;
      await sleep(5000);
      if (retries === 0) {
        console.error("Không thể kết nối đến RabbitMQ");
        return false;
      }
    }
  }
}

// Send message UI
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RabbitMQ Producer API</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        h1 { color: #FF6600; }
        .form-group { margin: 20px 0; }
        input, textarea { width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #FF6600; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #CC5200; }
        .response { margin-top: 20px; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
      </style>
    </head>
    <body>
      <h1>RabbitMQ Producer API</h1>
      <div class="form-group">
        <label>Message:</label>
        <textarea id="message" rows="4" placeholder="Nhập message của bạn..."></textarea>
      </div>
      <button onclick="sendMessage()">Gửi Message</button>
      <div id="response"></div>
      
      <script>
        async function sendMessage() {
          const message = document.getElementById('message').value;
          const responseDiv = document.getElementById('response');
          
          if (!message.trim()) {
            responseDiv.className = 'response error';
            responseDiv.textContent = 'Message không được để trống!';
            return;
          }
          
          try {
            const res = await fetch('/api/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message })
            });
            
            const data = await res.json();
            
            if (res.ok) {
              responseDiv.className = 'response success';
              responseDiv.textContent = data.message;
              document.getElementById('message').value = '';
            } else {
              responseDiv.className = 'response error';
              responseDiv.textContent = data.error;
            }
          } catch (error) {
            responseDiv.className = 'response error';
            responseDiv.textContent = 'Lỗi kết nối: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.post("/send", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message không được để trống" });
  }

  if (!channel) {
    return res.status(503).json({ error: "RabbitMQ chưa sẵn sàng" });
  }

  try {
    const queue = "hello_queue";
    const fullMessage = `${message} - Thời gian: ${new Date().toLocaleString()}`;

    channel.sendToQueue(queue, Buffer.from(fullMessage), {
      persistent: true,
    });

    console.log(`Đã gửi: ${fullMessage}`);

    res.json({
      success: true,
      message: "Message đã được gửi thành công!",
      sentMessage: fullMessage,
    });
  } catch (error) {
    res.status(500).json({ error: "Sending message error: " + error.message });
  }
});

async function start() {
  await connectRabbitMQ();

  app.listen(PORT, "0.0.0.0", () => {
    console.log("API runnning on http://localhost:" + PORT);
  });
}

start().catch(console.error);
