# NBA Replay System API Documentation

## Overview

This document provides detailed API documentation for the NBA Replay System services, including REST endpoints, WebSocket commands, and data formats.

## Replay Service API

### Base URL
- **Local Development**: `http://localhost:8081`
- **Docker**: `http://localhost:8082`

### REST Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
    "status": "UP",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Service Status
```http
GET /api/status
```

**Response:**
```json
{
    "service": "NBA Replay Service",
    "version": "1.0.0",
    "kafka": {
        "connected": true,
        "topic": "nba-finals-game1",
        "consumerGroup": "replay-service-group"
    },
    "websocket": {
        "activeConnections": 2,
        "endpoint": "/ws/replay"
    },
    "replay": {
        "active": false,
        "currentTime": null,
        "speed": null
    }
}
```

### WebSocket Endpoints

#### Connection
- **URL**: `ws://localhost:8082/ws/replay`
- **Protocol**: STOMP over SockJS

#### Topics

##### Game Events Topic
- **Destination**: `/topic/game-events`
- **Purpose**: Receives game events during replay
- **Message Format**:
```json
{
    "firstname": "Luka",
    "lastname": "Doncic",
    "eventType": "score-2",
    "playerNumber": "77",
    "timestamp": "00:22"
}
```

##### Replay Status Topic
- **Destination**: `/topic/replay-status`
- **Purpose**: Receives replay status updates
- **Message Format**:
```json
{
    "active": true,
    "currentTime": "05:30",
    "speed": 1.0,
    "pendingEvents": 15,
    "totalEvents": 129
}
```

#### Commands

##### Start Replay
- **Destination**: `/app/replay/start`
- **Payload**:
```json
{
    "startTime": "05:00",
    "speed": 1.0
}
```

**Parameters:**
- `startTime` (string, required): Game time to start replay (HH:MM format)
- `speed` (number, optional): Playback speed multiplier (default: 1.0)

**Response:**
```json
{
    "success": true,
    "message": "Replay started from 05:00 at 1.0x speed",
    "startTime": "05:00",
    "speed": 1.0
}
```

##### Stop Replay
- **Destination**: `/app/replay/stop`
- **Payload**: `{}` (empty object)

**Response:**
```json
{
    "success": true,
    "message": "Replay stopped",
    "currentTime": "07:15"
}
```

##### Get Replay Status
- **Destination**: `/app/replay/status`
- **Payload**: `{}` (empty object)

**Response:**
```json
{
    "active": true,
    "currentTime": "06:45",
    "speed": 2.0,
    "pendingEvents": 8,
    "totalEvents": 129,
    "startTime": "05:00"
}
```

##### Generic Replay Request
- **Destination**: `/app/replay/request`
- **Payload**:
```json
{
    "action": "start_replay",
    "startTime": "05:00",
    "speed": 1.0
}
```

**Actions:**
- `start_replay`: Start replay from specified time
- `stop_replay`: Stop current replay
- `get_status`: Get current replay status

## Game Event Ingest Service API

### Base URL
- **Local Development**: `http://localhost:8080`
- **Docker**: Internal service (no external port)

### REST Endpoints

#### Health Check
```http
GET /actuator/health
```

#### Ingest Game Data
```http
POST /api/ingest/game/{gameId}
```

**Parameters:**
- `gameId` (path): Unique identifier for the game

**Response:**
```json
{
    "success": true,
    "message": "Game data ingested successfully",
    "eventsProcessed": 129,
    "topic": "nba-finals-game1"
}
```

## Data Models

### GameEvent
```json
{
    "firstname": "string",
    "lastname": "string",
    "eventType": "string",
    "playerNumber": "string",
    "timestamp": "string"
}
```

**Fields:**
- `firstname`: Player's first name
- `lastname`: Player's last name
- `eventType`: Type of game event (see Event Types below)
- `playerNumber`: Player's jersey number
- `timestamp`: Game time in HH:MM format

### ReplayRequest
```json
{
    "startTime": "string",
    "speed": "number"
}
```

**Fields:**
- `startTime`: Game time to start replay (HH:MM format)
- `speed`: Playback speed multiplier (0.5 to 96.0)

### ReplayStatus
```json
{
    "active": "boolean",
    "currentTime": "string",
    "speed": "number",
    "pendingEvents": "number",
    "totalEvents": "number",
    "startTime": "string"
}
```

## Event Types

| Event Type | Description | Example |
|------------|-------------|---------|
| `score-2` | Two-point field goal | Made 2pt shot |
| `score-3` | Three-point field goal | Made 3pt shot |
| `free-throw` | Free throw | Made free throw |
| `rebound` | Rebound | Defensive rebound |
| `assist` | Assist | Pass leading to score |
| `foul` | Foul | Personal foul |
| `turnover` | Turnover | Lost ball |
| `steal` | Steal | Stolen ball |
| `block` | Block | Blocked shot |

## Error Responses

### Standard Error Format
```json
{
    "error": "string",
    "message": "string",
    "timestamp": "string",
    "path": "string"
}
```

### Common Error Codes

| HTTP Code | Error | Description |
|-----------|-------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Example Error Responses

#### Invalid Start Time
```json
{
    "error": "Bad Request",
    "message": "Invalid start time format. Expected HH:MM",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/app/replay/start"
}
```

#### Kafka Connection Error
```json
{
    "error": "Service Unavailable",
    "message": "Unable to connect to Kafka broker",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/status"
}
```

## WebSocket Connection Examples

### JavaScript Client Example
```javascript
// Connect to WebSocket
const socket = new SockJS('http://localhost:8082/ws/replay');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);
    
    // Subscribe to game events
    stompClient.subscribe('/topic/game-events', function (message) {
        const event = JSON.parse(message.body);
        console.log('Game event:', event);
    });
    
    // Subscribe to replay status
    stompClient.subscribe('/topic/replay-status', function (message) {
        const status = JSON.parse(message.body);
        console.log('Replay status:', status);
    });
});

// Start replay
stompClient.send("/app/replay/start", {}, JSON.stringify({
    startTime: "05:00",
    speed: 1.0
}));

// Stop replay
stompClient.send("/app/replay/stop", {}, JSON.stringify({}));
```

### cURL Examples

#### Health Check
```bash
curl -X GET http://localhost:8082/api/health
```

#### Service Status
```bash
curl -X GET http://localhost:8082/api/status
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KAFKA_URL` | `localhost:9092` | Kafka broker URL |
| `KAFKA_TOPIC` | `nba-finals-game1` | Kafka topic name |
| `SERVER_PORT` | `8081` | Service port |

### Application Properties

```properties
# Kafka Configuration
spring.kafka.bootstrap-servers=${KAFKA_URL:localhost:9092}
spring.kafka.consumer.group-id=replay-service-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer

# WebSocket Configuration
websocket.endpoint=/ws/replay

# Logging
logging.level.ReplayService=INFO
logging.level.org.apache.kafka=WARN
```

## Rate Limiting

Currently, there are no rate limits implemented. However, consider implementing rate limiting for production deployments:

- WebSocket connections: 100 per minute per IP
- REST API calls: 1000 per minute per IP
- Replay requests: 10 per minute per user

## Security

### Current Implementation
- No authentication required
- Plain HTTP/WebSocket connections
- No input validation beyond basic format checking

### Production Recommendations
- Implement JWT authentication
- Use HTTPS/WSS for all connections
- Add input validation and sanitization
- Implement rate limiting
- Add CORS configuration for web clients
- Use environment variables for sensitive configuration

## Monitoring

### Health Check Endpoints
- `/api/health`: Basic health status
- `/api/status`: Detailed service status
- `/actuator/health`: Spring Boot actuator health check

### Metrics to Monitor
- WebSocket connection count
- Kafka consumer lag
- Replay request frequency
- Error rates
- Response times

### Logging
- Application logs: `INFO` level for normal operations
- Kafka logs: `WARN` level to reduce noise
- Error logs: `ERROR` level with stack traces 