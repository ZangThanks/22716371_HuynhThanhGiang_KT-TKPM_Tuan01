# RabbitMQ Message Queue với Node.js và Docker

Dự án demo sử dụng RabbitMQ để gửi và nhận messages với Node.js, được containerize bằng Docker.

## Cấu trúc dự án

```
.
├── producer/
│   ├── producer.js      # Ứng dụng gửi messages
│   ├── package.json
│   └── Dockerfile
├── consumer/
│   ├── consumer.js      # Ứng dụng nhận messages
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml   # Orchestration file
```

## Yêu cầu

- Docker Desktop
- Docker Compose

## Cách chạy

### 1. Build và chạy tất cả services:

```bash
docker-compose up --build
```

### 2. Chạy ở chế độ background (detached):

```bash
docker-compose up -d
```

### 3. Xem logs của các services:

```bash
# Xem tất cả logs
docker-compose logs -f

# Xem logs của producer
docker-compose logs -f producer

# Xem logs của consumer
docker-compose logs -f consumer
```

### 4. Dừng các services:

```bash
docker-compose down
```

## RabbitMQ Management UI

Sau khi chạy, bạn có thể truy cập RabbitMQ Management UI tại:

- URL: http://localhost:15672
- Username: `admin`
- Password: `admin`

## Mô tả hoạt động

1. **RabbitMQ**: Message broker chạy trên cổng 5672 (AMQP) và 15672 (Management UI)
2. **Producer**: Gửi message mỗi 3 giây đến queue `hello_queue`
3. **Consumer**: Lắng nghe và nhận messages từ queue `hello_queue`

## Kiến trúc

```
Producer → RabbitMQ (Queue: hello_queue) → Consumer
```

## Technologies

- **Node.js 18**: Runtime environment
- **amqplib**: RabbitMQ client library
- **RabbitMQ**: Message broker
- **Docker & Docker Compose**: Containerization
