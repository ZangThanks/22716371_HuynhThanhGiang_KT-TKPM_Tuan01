const express = require("express");
const amqp = require("amqplib");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const RABBITMQ_URL = "amqp://admin:admin@rabbitmq:5672";
const QUEUE = "booking_queue";
const DEAD_LETTER_QUEUE = "booking_queue.dlq";

let channel;

async function connectRabbitMQ() {
  while (true) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      channel = await conn.createChannel();
      await channel.assertQueue(QUEUE, {
        durable: true,
        deadLetterExchange: "", // Default Exchange
        deadLetterRoutingKey: DEAD_LETTER_QUEUE,
      });

      console.log("Producer connected to RabbitMQ");
      break;
    } catch {
      console.log("Waiting for RabbitMQ...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// Send message UI
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RabbitMQ Producer API - DLQ Demo</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        h1 { color: #FF6600; }
        .info { background: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin-bottom: 20px; }
        .form-group { margin: 20px 0; }
        input, textarea { width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #FF6600; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px; }
        button:hover { background: #CC5200; }
        button.secondary { background: #6c757d; }
        button.secondary:hover { background: #5a6268; }
        .response { margin-top: 20px; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
      </style>
    </head>
    <body>
      <h1>RabbitMQ Producer API - DLQ Demo</h1>
      <div class="info">
        <strong>Dead Letter Queue Demo:</strong><br>
        Để test DLQ, hãy gửi message với field name sai (VD: <code>bookingIdd</code> thay vì <code>bookingId</code>).
        Message sai sẽ bị từ chối bởi consumer và chuyển vào Dead Letter Queue.
      </div>
      <div class="form-group">
        <label>Booking ID:</label>
        <input type="text" id="bookingId" placeholder="VD: BK123456" />
      </div>
      <div class="form-group">
        <label>Message:</label>
        <textarea id="message" rows="4" placeholder="Nhập message của bạn..."></textarea>
      </div>
      <button onclick="sendMessage()">Gửi Message Đúng</button>
      <button class="secondary" onclick="sendWrongMessage()">Gửi Message Sai (DLQ Test)</button>
      <div id="response"></div>
      
      <script>
        async function sendMessage() {
          const bookingId = document.getElementById('bookingId').value;
          const message = document.getElementById('message').value;
          const responseDiv = document.getElementById('response');
          
          if (!bookingId.trim()) {
            responseDiv.className = 'response error';
            responseDiv.textContent = 'Booking ID không được để trống!';
            return;
          }
          
          if (!message.trim()) {
            responseDiv.className = 'response error';
            responseDiv.textContent = 'Message không được để trống!';
            return;
          }
          
          try {
            const res = await fetch('/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId, message })
            });
            
            const data = await res.json();
            
            if (res.ok) {
              responseDiv.className = 'response success';
              responseDiv.innerHTML = '<strong>Gửi thành công!</strong><br>' + JSON.stringify(data, null, 2);
            } else {
              responseDiv.className = 'response error';
              responseDiv.textContent = 'Lỗi: ' + data.error;
            }
          } catch (error) {
            responseDiv.className = 'response error';
            responseDiv.textContent = 'Lỗi kết nối: ' + error.message;
          }
        }
        
        async function sendWrongMessage() {
          const bookingId = document.getElementById('bookingId').value;
          const message = document.getElementById('message').value;
          const responseDiv = document.getElementById('response');
          
          if (!bookingId.trim()) {
            responseDiv.className = 'response error';
            responseDiv.textContent = 'Booking ID không được để trống!';
            return;
          }
          
          if (!message.trim()) {
            responseDiv.className = 'response error';
            responseDiv.textContent = 'Message không được để trống!';
            return;
          }
          
          try {
            const res = await fetch('/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingIdd: bookingId, message })  // Sai field name
            });
            
            const data = await res.json();
            
            if (res.ok) {
              responseDiv.className = 'response success';
              responseDiv.innerHTML = '<strong>Message đã gửi (sẽ vào DLQ)!</strong><br>' + JSON.stringify(data, null, 2);
            } else {
              responseDiv.className = 'response error';
              responseDiv.textContent = 'Lỗi: ' + data.error;
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
  const { message, bookingId } = req.body;

  if (!message || !bookingId) {
    return res.status(400).json({ error: "message or orderId is required" });
  }

  const messageData = {
    ...req.body,
    timestamp: new Date(),
  };

  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(messageData)), {
    persistent: true,
  });

  console.log("Sent:", messageData);

  res.json({ status: "sent", dataSent: messageData });
});

connectRabbitMQ();

app.listen(3000, () => {
  console.log("Producer API listening on port 3000");
  console.log("Open http://localhost:3000 to test");
});
