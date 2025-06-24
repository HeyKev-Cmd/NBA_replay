# NBA Game Event Replay Service

A Spring Boot service that subscribes to Kafka topics containing NBA game events and replays them via WebSocket to connected clients with **time-based replay functionality**.

## Features

- **Kafka Consumer**: Subscribes to NBA game event topics
- **WebSocket Server**: Broadcasts events to connected clients in real-time using raw JSON WebSocket
- **Time-Based Replay**: Replay events with original timing from any start point
- **Playback Speed Control**: Adjust replay speed (0.5x to 5.0x)
- **REST API**: Health checks and service status endpoints
- **Docker Support**: Containerized deployment

## 🎯 Time-Based Replay System

The service can replay events with their original timing:

1. **Client sends replay request**: `{"action": "start_replay", "startTime": "05:00", "speed": 1.0}`
2. **Service sets internal timer** to 05:00
3. **When event at 05:07 arrives**, service waits 7 seconds before sending to client
4. **Events are replayed** in chronological order with proper timing

### Example Flow:
```
Client: "Start replay from 05:00"
Service: Sets replay time to 05:00

Event arrives: {"timestamp": "05:07", "event_type": "rebound"}
Service: Waits 7 seconds, then sends to client

Event arrives: {"timestamp": "05:12", "event_type": "shot"}
Service: Waits 12 seconds, then sends to client
```

## Configuration

### Environment Variables

- `KAFKA_URL`: Kafka broker URL (default: `localhost:9092`)
- `KAFKA_TOPIC`: Kafka topic name (default: `nba-finals-game1`)

### Application Properties

The service uses the following configuration:

```properties
# Kafka Consumer Configuration
spring.kafka.bootstrap-servers=${KAFKA_URL:localhost:9092}
spring.kafka.consumer.group-id=replay-service-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer

# Kafka Topic Configuration
kafka.topic.name=${KAFKA_TOPIC:nba-finals-game1}

# WebSocket Configuration
websocket.endpoint=/ws/replay
```

## API Endpoints

### REST Endpoints

- `GET /api/health` - Health check
- `GET /api/status` - Service status information

### WebSocket Endpoints

- **Connection**: `ws://localhost:8081/ws/replay` (Raw JSON WebSocket)

### WebSocket Commands

#### Start Time-Based Replay
```json
{
  "action": "start_replay",
  "startTime": "05:00",
  "speed": 1.0
}
```

#### Stop Replay
```json
{
  "action": "stop_replay"
}
```

#### Get Replay Status
```json
{
  "action": "get_status"
}
```

## Game Event Format

The service expects JSON messages in the following format:

```json
{
    "firstname": "Al",
    "lastname": "Horford",
    "event_type": "rebound",
    "player_number": "42",
    "timestamp": "23:04"
}
```

## Running the Service

### Local Development

1. Build the project:
   ```bash
   ./mvnw clean package
   ```

2. Run the application:
   ```bash
   java -jar target/ReplayService-0.0.1-SNAPSHOT.jar
   ```

### Docker

1. Build the Docker image:
   ```bash
   docker build -t replay-service .
   ```

2. Run the container:
   ```bash
   docker run -p 8081:8081 \
     -e KAFKA_URL=kafka:19092 \
     -e KAFKA_TOPIC=nba-finals-game1 \
     replay-service
   ```

### Docker Compose

The service is included in the main `docker-compose.yml` file:

```bash
docker-compose up replay-service
```

## Testing

### Time-Based Replay Test

Use the provided `test-time-replay.html` file to test the time-based replay functionality:

1. Start the service
2. Open `test-time-replay.html` in a web browser
3. Click "Connect" to establish WebSocket connection to `ws://localhost:8081/ws/replay`
4. Set start time (e.g., "05:00") and speed (e.g., "1.0x")
5. Click "Start Replay"
6. Events will be replayed with proper timing

### Manual Testing

You can also test using curl:

```bash
# Health check
curl http://localhost:8081/api/health

# Service status
curl http://localhost:8081/api/status
```

### WebSocket Testing

Connect to the WebSocket endpoint and send JSON messages:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8081/ws/replay');

// Send replay request
ws.send(JSON.stringify({
  "action": "start_replay",
  "startTime": "00:00",
  "speed": 1.0
}));

// Listen for events
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## Architecture

```
Kafka Topic (nba-finals-game1)
    ↓
KafkaConsumerService (consumes messages)
    ↓
ReplayService (manages timing and replay)
    ↓
JsonWebSocketHandler (broadcasts JSON messages)
    ↓
Connected Clients (UI)
```

## Replay Features

### ✅ Time-Based Replay
- Start replay from any game time (MM:SS format)
- Events are replayed in chronological order
- Proper timing delays between events

### ✅ Playback Speed Control
- 0.5x (Slow motion)
- 1.0x (Normal speed)
- 2.0x (Fast forward)
- 5.0x (Very fast)

### ✅ Replay Controls
- Start replay from specific time
- Stop replay at any time
- Get current replay status
- View pending events count

### ✅ Real-Time Status
- Current replay time
- Playback speed
- Number of pending events
- Replay state (replaying/stopped)

## Dependencies

- Spring Boot 3.5.3
- Spring Kafka
- Spring WebSocket
- Jackson (JSON processing)
- Java 17