package ReplayService.ReplayService.service;

import ReplayService.ReplayService.config.JsonWebSocketHandler;
import ReplayService.ReplayService.model.GameEvent;
import ReplayService.ReplayService.model.ReplayRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class ReplayService {

    private static final Logger logger = LoggerFactory.getLogger(ReplayService.class);

    private final JsonWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper;
    private final Properties kafkaConsumerProps;
    private final ExecutorService replayExecutor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean isReplaying = new AtomicBoolean(false);

    @Value("${kafka.topic.name}")
    private String topicName;

    public ReplayService(JsonWebSocketHandler webSocketHandler, ObjectMapper objectMapper,
                         @Value("${spring.kafka.bootstrap-servers}") String bootstrapServers,
                         @Value("${spring.kafka.consumer.group-id}") String groupId) {
        this.webSocketHandler = webSocketHandler;
        this.objectMapper = objectMapper;

        this.kafkaConsumerProps = new Properties();
        this.kafkaConsumerProps.put("bootstrap.servers", bootstrapServers);
        this.kafkaConsumerProps.put("group.id", groupId + "_replay_" + System.currentTimeMillis());
        this.kafkaConsumerProps.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        this.kafkaConsumerProps.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        this.kafkaConsumerProps.put("enable.auto.commit", "false");
        this.kafkaConsumerProps.put("auto.offset.reset", "earliest");
    }

    public void handleReplayRequest(ReplayRequest request) {
        logger.info("Handling replay request: {}", request);
        if ("start_replay".equals(request.getAction())) {
            if (isReplaying.compareAndSet(false, true)) {
                replayExecutor.submit(() -> startReplay(request.getStartTime(), request.getSpeed()));
            } else {
                logger.warn("Replay is already in progress. Ignoring start request.");
            }
        } else if ("stop_replay".equals(request.getAction())) {
            stopReplay();
        }
    }

    private void stopReplay() {
        if (isReplaying.compareAndSet(true, false)) {
            logger.info("Stopping replay...");
        }
    }

    private void startReplay(String startTime, Double speed) {
        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(kafkaConsumerProps)) {
            consumer.subscribe(Collections.singletonList(topicName));

            Duration targetDuration = parseGameTime(startTime);
            if (targetDuration == null) {
                sendErrorStatus("Invalid start time format: " + startTime);
                isReplaying.set(false);
                return;
            }

            Duration lastEventDuration = null;
            long lastStatusTime = System.currentTimeMillis();

            while (isReplaying.get()) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(1000));
                boolean sentEvent = false;

                logger.info("Polled {} records from Kafka.", records.count());

                List<GameEvent> sortedEvents = new ArrayList<>();
                for (ConsumerRecord<String, String> record : records) {
                    GameEvent event = parseGameEvent(record.value());
                    if (event != null && parseGameTime(event.getTimestamp()) != null) {
                        sortedEvents.add(event);
                    }
                }
                sortedEvents.sort(Comparator.comparing(e -> parseGameTime(e.getTimestamp())));

                for (GameEvent event : sortedEvents) {
                    logger.debug("Processing sorted event: {}", event);
                    if (!isReplaying.get()) break;

                    Duration currentEventDuration = parseGameTime(event.getTimestamp());

                    if (lastEventDuration == null) {
                        lastEventDuration = currentEventDuration;
                        logger.info("First event time: {}", formatDuration(lastEventDuration));
                    }

                    long timeDiffSeconds = currentEventDuration.minus(lastEventDuration).getSeconds();
                    if (timeDiffSeconds < 0) continue;

                    long delayMillis = (long) (timeDiffSeconds * 1000 / speed);

                    if (delayMillis > 0) {
                        try {
                            Thread.sleep(delayMillis);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }

                    if (!isReplaying.get()) break;

                    logger.info(">>> Sending event: {}", event);
                    webSocketHandler.broadcastToAll(objectMapper.writeValueAsString(event));
                    sendReplayStatus(currentEventDuration, speed);
                    lastEventDuration = currentEventDuration;
                    sentEvent = true;
                }

                long now = System.currentTimeMillis();
                if (!sentEvent && now - lastStatusTime >= 1000) {
                    sendReplayStatus(null, speed);
                    lastStatusTime = now;
                }
            }
        } catch (Exception e) {
            logger.error("Error during replay", e);
        } finally {
            isReplaying.set(false);
            logger.info("Replay finished.");
        }
    }

    private GameEvent parseGameEvent(String message) {
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            JsonNode payloadNode = rootNode.path("value").path("payload");
            if (payloadNode.isMissingNode() || payloadNode.isNull()) {
                return objectMapper.readValue(message, GameEvent.class);
            } else {
                return objectMapper.treeToValue(payloadNode, GameEvent.class);
            }
        } catch (Exception e) {
            logger.error("Failed to parse message: {}", message, e);
            return null;
        }
    }

    private Duration parseGameTime(String timestamp) {
        try {
            String[] parts = timestamp.split(":");
            long minutes = Long.parseLong(parts[0]);
            long seconds = Long.parseLong(parts[1]);
            return Duration.ofMinutes(minutes).plusSeconds(seconds);
        } catch (Exception e) {
            logger.error("Invalid game time format: '{}'", timestamp);
            return null;
        }
    }

    private String formatDuration(Duration duration) {
        if (duration == null) return "--:--";
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();
        return String.format("%02d:%02d", minutes, seconds);
    }

    private void sendReplayStatus(Duration currentReplayTime, Double speed) {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("status", isReplaying.get() ? "replaying" : "stopped");
            status.put("currentReplayTime", formatDuration(currentReplayTime));
            status.put("speed", speed);
            status.put("timestamp", System.currentTimeMillis());
            webSocketHandler.broadcastToAll(objectMapper.writeValueAsString(status));
        } catch (Exception e) {
            logger.error("Failed to send replay status", e);
        }
    }

    private void sendErrorStatus(String error) {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("status", "error");
            status.put("error", error);
            status.put("timestamp", System.currentTimeMillis());
            webSocketHandler.broadcastToAll(objectMapper.writeValueAsString(status));
        } catch (Exception e) {
            logger.error("Failed to send error status", e);
        }
    }
}
