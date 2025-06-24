# NBA Replay System Deployment Guide

## Overview

This guide covers deploying the NBA Replay System in various environments, from local development to production.

## Prerequisites

### System Requirements

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Java**: Version 17 or higher (for local development)
- **Maven**: Version 3.6 or higher (for local development)
- **Memory**: Minimum 4GB RAM, 8GB recommended
- **Storage**: Minimum 10GB free space
- **Network**: Ports 8000, 8080, 8081, 9092 available

### Operating System Support

- **Linux**: Ubuntu 20.04+, CentOS 8+, RHEL 8+
- **macOS**: 10.15+ (Catalina or later)
- **Windows**: Windows 10/11 with WSL2 or Docker Desktop

## Local Development Deployment

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd NBA_replay

# Verify Docker is running
docker --version
docker-compose --version
```

### 2. Start All Services

```bash
# Start all services in detached mode
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Verify Deployment

```bash
# Check service health
curl http://localhost:8081/api/health

# Check Kafka console
curl http://localhost:8080

# Check web UI
curl http://localhost:8000/test-time-replay.html
```

### 4. Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| Web UI | http://localhost:8000/test-time-replay.html | Replay interface |
| Kafka Console | http://localhost:8080 | Kafka management |
| Replay Service | http://localhost:8081 | API and WebSocket |

## Production Deployment

### Docker Compose Production

#### 1. Create Production Compose File

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  kafka:
    image: apache/kafka:latest
    container_name: kafka-prod
    ports:
      - '9092:9092'
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,INTERNAL://0.0.0.0:19092,CONTROLLER://0.0.0.0:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://your-domain.com:9092,INTERNAL://kafka:19092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,INTERNAL:PLAINTEXT,CONTROLLER:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: INTERNAL
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_NUM_PARTITIONS: 3
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
    volumes:
      - kafka-data:/var/lib/kafka/data
    restart: unless-stopped

  game-event-ingest-service:
    build:
      context: ./GameEventIngestService
      dockerfile: Dockerfile
    container_name: game-event-ingest-service-prod
    depends_on:
      kafka:
        condition: service_healthy
    environment:
      - KAFKA_URL=kafka:19092
      - GAME_ID=game1
    restart: unless-stopped

  replay-service:
    build:
      context: ./ReplayService
      dockerfile: Dockerfile
    container_name: replay-service-prod
    ports:
      - "8081:8081"
    depends_on:
      kafka:
        condition: service_healthy
    environment:
      - KAFKA_URL=kafka:19092
      - KAFKA_TOPIC=nba-finals-game1
      - SERVER_PORT=8081
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  replay-ui:
    image: nginx:alpine
    container_name: replay-ui-prod
    ports:
      - "80:80"
    volumes:
      - ./ReplayService/test-time-replay.html:/usr/share/nginx/html/index.html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - replay-service
    restart: unless-stopped

volumes:
  kafka-data:
```

#### 2. Create Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream replay-service {
        server replay-service:8081;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        location /ws/ {
            proxy_pass http://replay-service;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            proxy_pass http://replay-service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### 3. Deploy to Production

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Kubernetes Deployment

#### 1. Create Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: nba-replay
```

#### 2. Create ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nba-replay-config
  namespace: nba-replay
data:
  KAFKA_URL: "kafka:19092"
  KAFKA_TOPIC: "nba-finals-game1"
  SERVER_PORT: "8081"
```

#### 3. Create Kafka Deployment

```yaml
# kafka-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka
  namespace: nba-replay
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kafka
  template:
    metadata:
      labels:
        app: kafka
    spec:
      containers:
      - name: kafka
        image: apache/kafka:latest
        ports:
        - containerPort: 9092
        env:
        - name: KAFKA_NODE_ID
          value: "1"
        - name: KAFKA_PROCESS_ROLES
          value: "broker,controller"
        - name: KAFKA_LISTENERS
          value: "PLAINTEXT://0.0.0.0:9092,INTERNAL://0.0.0.0:19092,CONTROLLER://0.0.0.0:9093"
        - name: KAFKA_ADVERTISED_LISTENERS
          value: "PLAINTEXT://kafka:9092,INTERNAL://kafka:19092"
        - name: KAFKA_CONTROLLER_LISTENER_NAMES
          value: "CONTROLLER"
        - name: KAFKA_LISTENER_SECURITY_PROTOCOL_MAP
          value: "PLAINTEXT:PLAINTEXT,INTERNAL:PLAINTEXT,CONTROLLER:PLAINTEXT"
        - name: KAFKA_INTER_BROKER_LISTENER_NAME
          value: "INTERNAL"
        - name: KAFKA_CONTROLLER_QUORUM_VOTERS
          value: "1@kafka:9093"
        - name: KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR
          value: "1"
        - name: KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR
          value: "1"
        - name: KAFKA_TRANSACTION_STATE_LOG_MIN_ISR
          value: "1"
        - name: KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS
          value: "0"
        - name: KAFKA_NUM_PARTITIONS
          value: "3"
        - name: KAFKA_AUTO_CREATE_TOPICS_ENABLE
          value: "true"
        volumeMounts:
        - name: kafka-data
          mountPath: /var/lib/kafka/data
      volumes:
      - name: kafka-data
        persistentVolumeClaim:
          claimName: kafka-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: kafka
  namespace: nba-replay
spec:
  selector:
    app: kafka
  ports:
  - port: 9092
    targetPort: 9092
  - port: 19092
    targetPort: 19092
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: kafka-pvc
  namespace: nba-replay
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

#### 4. Create Replay Service Deployment

```yaml
# replay-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: replay-service
  namespace: nba-replay
spec:
  replicas: 2
  selector:
    matchLabels:
      app: replay-service
  template:
    metadata:
      labels:
        app: replay-service
    spec:
      containers:
      - name: replay-service
        image: replay-service:latest
        ports:
        - containerPort: 8081
        env:
        - name: KAFKA_URL
          valueFrom:
            configMapKeyRef:
              name: nba-replay-config
              key: KAFKA_URL
        - name: KAFKA_TOPIC
          valueFrom:
            configMapKeyRef:
              name: nba-replay-config
              key: KAFKA_TOPIC
        - name: SERVER_PORT
          valueFrom:
            configMapKeyRef:
              name: nba-replay-config
              key: SERVER_PORT
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 8081
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: replay-service
  namespace: nba-replay
spec:
  selector:
    app: replay-service
  ports:
  - port: 80
    targetPort: 8081
  type: LoadBalancer
```

#### 5. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Apply configurations
kubectl apply -f configmap.yaml
kubectl apply -f kafka-deployment.yaml
kubectl apply -f replay-service-deployment.yaml

# Check deployment status
kubectl get pods -n nba-replay
kubectl get services -n nba-replay
```

## Environment-Specific Configurations

### Development Environment

```bash
# Environment variables
export KAFKA_URL=localhost:9092
export KAFKA_TOPIC=nba-finals-game1
export SERVER_PORT=8081

# Start services
docker-compose up -d
```

### Staging Environment

```bash
# Environment variables
export KAFKA_URL=kafka-staging:19092
export KAFKA_TOPIC=nba-finals-game1-staging
export SERVER_PORT=8081

# Start services
docker-compose -f docker-compose.staging.yml up -d
```

### Production Environment

```bash
# Environment variables
export KAFKA_URL=kafka-prod:19092
export KAFKA_TOPIC=nba-finals-game1-prod
export SERVER_PORT=8081
export LOG_LEVEL=WARN

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring and Logging

### Health Checks

```bash
# Check service health
curl http://localhost:8081/api/health

# Check detailed status
curl http://localhost:8081/api/status

# Check Docker container health
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Logging

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f replay-service
docker-compose logs -f kafka

# View logs with timestamps
docker-compose logs -f --timestamps
```

### Metrics

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df

# Check network usage
docker network ls
```

## Backup and Recovery

### Kafka Data Backup

```bash
# Create backup directory
mkdir -p backups/kafka

# Backup Kafka data
docker exec kafka tar -czf /tmp/kafka-backup.tar.gz /var/lib/kafka/data
docker cp kafka:/tmp/kafka-backup.tar.gz backups/kafka/

# Restore Kafka data
docker cp backups/kafka/kafka-backup.tar.gz kafka:/tmp/
docker exec kafka tar -xzf /tmp/kafka-backup.tar.gz -C /
```

### Application Configuration Backup

```bash
# Backup configuration files
cp docker-compose.yml backups/
cp -r ReplayService/src/main/resources/ backups/replay-service-config/
cp -r GameEventIngestService/src/main/resources/ backups/ingest-service-config/
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check Docker daemon
docker info

# Check available ports
netstat -tulpn | grep :8081

# Check disk space
df -h
```

#### Kafka Connection Issues
```bash
# Check Kafka status
docker exec kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# Check Kafka logs
docker logs kafka

# Test Kafka connectivity
docker exec kafka kafka-console-producer.sh --bootstrap-server localhost:9092 --topic test
```

#### WebSocket Connection Issues
```bash
# Check WebSocket endpoint
curl -I http://localhost:8081/ws/replay

# Check CORS configuration
curl -H "Origin: http://localhost:8000" -v http://localhost:8081/api/health
```

### Performance Tuning

#### Kafka Tuning
```properties
# kafka-server.properties
num.network.threads=3
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
num.partitions=3
num.recovery.threads.per.data.dir=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
```

#### JVM Tuning
```bash
# Add to Dockerfile
ENV JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

## Security Considerations

### Network Security
- Use internal Docker networks
- Restrict external access to necessary ports only
- Implement firewall rules
- Use VPN for remote access

### Data Security
- Encrypt data at rest
- Use TLS for data in transit
- Implement access controls
- Regular security updates

### Application Security
- Input validation
- Rate limiting
- Authentication and authorization
- Secure configuration management

## Scaling

### Horizontal Scaling
```bash
# Scale replay service
docker-compose up -d --scale replay-service=3

# Scale with Kubernetes
kubectl scale deployment replay-service --replicas=5
```

### Vertical Scaling
```bash
# Increase memory limits
docker-compose up -d --scale replay-service=1
# Edit docker-compose.yml to increase memory limits
```

## Maintenance

### Regular Maintenance Tasks

#### Daily
- Check service health
- Review error logs
- Monitor resource usage

#### Weekly
- Update dependencies
- Review performance metrics
- Backup configurations

#### Monthly
- Security updates
- Performance optimization
- Capacity planning

### Update Procedures

```bash
# Update application
git pull origin main
docker-compose build
docker-compose up -d

# Rollback if needed
docker-compose down
docker-compose up -d --force-recreate
``` 