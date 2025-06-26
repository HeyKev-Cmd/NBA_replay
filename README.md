# NBA Real-time Game Replay System

![Languages](https://img.shields.io/badge/languages-English%2C%20Traditional%20Chinese-blue)

[English](README.md) | [繁體中文](README.zh-TW.md)

A comprehensive system for replaying NBA game events with precise timing control, built with Spring Boot, Kafka, WebSockets, and modern web technologies.

## 🏀 Overview

This system allows you to replay NBA game events with accurate timing, variable playback speeds, and real-time streaming to web clients. It's designed for sports analytics, game review, and educational purposes.

## ✨ Features

- **🎯 Time-Based Replay**: Start replay from any specific game time (HH:MM format)
- **⚡ Variable Playback Speed**: 0.5x to 96x speed control
- **🔄 Real-time Streaming**: WebSocket-based live event streaming
- **📊 Event Visualization**: Real-time display of game events in web UI
- **🎮 Interactive Controls**: Start, stop, and control replay from web interface
- **📈 Scalable Architecture**: Event-driven microservices with Kafka
- **🐳 Docker Support**: Complete containerized deployment
- **🔍 Kafka Management**: Built-in Redpanda Console for topic monitoring

## 🏗️ Architecture

The system uses a microservices architecture with the following components:

![Real-time NBA Architecture](docs/real-time-NBA-architecture.drawio.png)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Game Event    │    │      Kafka       │    │   Replay        │
│   Ingest        │───▶│      Broker      │───▶│   Service       │
│   Service       │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Redpanda        │    │   Web UI        │
                       │  Console         │    │   (WebSocket)   │
                       └──────────────────┘    └─────────────────┘
```

### Components

1. **Game Event Ingest Service**: Loads game data into Kafka topics
2. **Kafka Broker**: Apache Kafka for event streaming and storage
3. **Replay Service**: Spring Boot service that consumes events and manages replay timing
4. **Web UI**: HTML/JavaScript interface for controlling and viewing replays
5. **Redpanda Console**: Web-based Kafka management interface

## 🎬 Demo

Watch the system in action:

![NBA Replay System Demo](docs/result_demo_v1.gif)

📹 **[View Full Demo Video](docs/result_demo_v1.mp4)** - See the real-time NBA game replay system in action with variable playback speeds and precise timing control.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Java 17+ (for local development)
- Maven (for local development)

### 1. Start the System

```bash
# Clone the repository
git clone <repository-url>
cd NBA_replay

# Start all services
docker-compose up -d
```

### 2. Access the Services

- **Web UI**: http://localhost:8000/test-time-replay.html
- **Kafka Console**: http://localhost:8080
- **Replay Service API**: http://localhost:8081/api/health

### 3. Test the Replay

1. Open the Web UI in your browser
2. Click "Connect" to establish WebSocket connection
3. Set start time (e.g., "00:00") and speed (e.g., "5.0x")
4. Click "Start Replay" to begin playback
5. Watch events stream in real-time with proper timing

## 📋 Detailed Setup

### Docker Compose Services

The system includes the following services:

#### Kafka Broker
- **Port**: 9092 (external), 19092 (internal)
- **Purpose**: Event streaming and storage
- **Configuration**: Single-node setup with 3 partitions

#### Game Event Ingest Service
- **Purpose**: Loads NBA game data into Kafka topics
- **Topic**: `nba-finals-game1`
- **Data Source**: Basketball Reference play-by-play data

#### Replay Service
- **Port**: 8081 (external), 8081 (internal)
- **Purpose**: Manages replay timing and WebSocket streaming
- **Features**: Time-based replay, speed control, offset management

#### Redpanda Console
- **Port**: 8080
- **Purpose**: Web-based Kafka topic management
- **Features**: Topic browsing, message inspection, consumer monitoring

#### Replay UI
- **Port**: 8000
- **Purpose**: Web interface for replay control
- **Features**: Real-time event display, replay controls, status monitoring

### Environment Variables

```bash
# Kafka Configuration
KAFKA_URL=kafka:19092
KAFKA_TOPIC=nba-finals-game1

# Service Configuration
GAME_ID=game1
```

## 🎮 Usage Guide

### Web UI Controls

#### Connection
- **Connect**: Establishes WebSocket connection to replay service
- **Disconnect**: Closes WebSocket connection
- **Clear Events**: Clears the event display

#### Replay Controls
- **Start Time**: Game time to begin replay (HH:MM format)
- **Playback Speed**: Replay speed multiplier (0.5x to 96x)
- **Start Replay**: Begins replay from specified time
- **Stop Replay**: Stops current replay

#### Speed Options
- **0.5x**: Slow motion replay
- **1.0x**: Normal speed
- **2.0x**: Fast forward
- **5.0x**: Very fast
- **10.0x**: Ultra fast
- **20.0x**: Lightning speed
- **48.0x**: Instant replay
- **96.0x**: Flash speed

### API Endpoints

#### Health Check
```bash
curl http://localhost:8081/api/health
```

#### Service Status
```bash
curl http://localhost:8081/api/status
```

### WebSocket Commands

#### Start Replay
```javascript
{
    "destination": "/app/replay/start",
    "body": {
        "startTime": "05:00",
        "speed": 1.0
    }
}
```

#### Stop Replay
```javascript
{
    "destination": "/app/replay/stop"
}
```

#### Get Status
```javascript
{
    "destination": "/app/replay/status"
}
```

## 🔧 Development

### Local Development Setup

1. **Start Kafka only**:
   ```bash
   docker-compose up kafka redpanda-console -d
   ```

2. **Run services locally**:
   ```bash
   # Replay Service
   cd ReplayService
   ./mvnw spring-boot:run
   
   # Game Event Ingest Service
   cd GameEventIngestService
   ./mvnw spring-boot:run
   ```

3. **Serve UI locally**:
   ```bash
   cd ReplayService
   python -m http.server 8000
   ```

### Building Docker Images

```bash
# Build Replay Service
cd ReplayService
docker build -t replay-service .

# Build Game Event Ingest Service
cd GameEventIngestService
docker build -t game-event-ingest-service .
```

### Project Structure

```
NBA_replay/
├── docker-compose.yml              # Main orchestration
├── GameEventIngestService/         # Data ingestion service
│   ├── src/main/java/
│   ├── Dockerfile
│   └── pom.xml
├── ReplayService/                  # Replay management service
│   ├── src/main/java/
│   ├── test-time-replay.html      # Web UI
│   ├── Dockerfile
│   └── pom.xml
└── docs/                          # Documentation
    └── real-time-NBA-architecture.drawio.png
```

## 📊 Data Format

### Game Event Structure

```json
{
    "firstname": "Luka",
    "lastname": "Doncic",
    "event_type": "score-2",
    "player_number": "77",
    "timestamp": "00:22"
}
```

### Event Types

- `score-2`: Two-point field goal
- `score-3`: Three-point field goal
- `free-throw`: Free throw
- `rebound`: Rebound
- `assist`: Assist
- `foul`: Foul
- `turnover`: Turnover
- `steal`: Steal
- `block`: Block

## 🔍 Monitoring and Debugging

### Kafka Console

Access Redpanda Console at http://localhost:8080 to:
- Browse topics and partitions
- Inspect messages
- Monitor consumer groups
- View topic statistics

### Service Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f replay-service
docker-compose logs -f game-event-ingest-service
```

### Health Checks

```bash
# Check replay service health
curl http://localhost:8081/api/health

# Check service status
curl http://localhost:8081/api/status
```

## 🐛 Troubleshooting

### Common Issues

#### WebSocket Connection Failed
- **Cause**: Replay service not running or wrong port
- **Solution**: Check service logs and ensure port 8081 is accessible

#### No Events Displayed
- **Cause**: Kafka topic empty or consumer issues
- **Solution**: Check Kafka console and ensure game data is loaded

#### Replay Timing Issues
- **Cause**: Clock format mismatch or offset calculation errors
- **Solution**: Verify game time format (HH:MM) and check service logs

#### Docker Build Failures
- **Cause**: Missing Maven wrapper files
- **Solution**: Ensure `.mvn` directory is copied in Dockerfile

### Debug Commands

```bash
# Check Kafka topic
docker exec -it kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic nba-finals-game1 \
  --from-beginning

# Check service connectivity
docker exec -it replay-service curl localhost:8081/api/health

# View topic partitions
docker exec -it kafka kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --describe --topic nba-finals-game1
```

## 📈 Performance

### Optimization Tips

1. **Batch Processing**: Events are processed in batches for efficiency
2. **Offset Management**: Linear search for reliable start position
3. **Memory Management**: Events are streamed rather than loaded entirely
4. **Connection Pooling**: WebSocket connections are managed efficiently

### Scaling Considerations

- **Kafka Partitions**: Currently 3 partitions, can be increased for higher throughput
- **Consumer Groups**: Multiple replay services can run in parallel
- **WebSocket Connections**: Multiple clients can connect simultaneously

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Data sourced from [Basketball Reference](https://www.basketball-reference.com/)
- Built with Spring Boot, Apache Kafka, and WebSocket technologies
- Architecture inspired by real-time sports analytics systems