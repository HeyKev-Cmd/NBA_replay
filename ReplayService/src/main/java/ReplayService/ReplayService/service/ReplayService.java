package ReplayService.ReplayService.service;

import ReplayService.ReplayService.model.GameEvent;
import ReplayService.ReplayService.model.ReplayRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.ArrayList;
import java.util.Comparator;

@Service
public class ReplayService {

    private static final Logger logger = LoggerFactory.getLogger(ReplayService.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final Properties kafkaConsumerProps;
    private final ExecutorService replayExecutor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean isReplaying = new AtomicBoolean(false);

    @Value("${kafka.topic.name}")
    private String topicName;

    public ReplayService(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper,
                         @Value("${spring.kafka.bootstrap-servers}") String bootstrapServers,
                         @Value("${spring.kafka.consumer.group-id}") String groupId) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;

        // Set up Kafka consumer properties for on-demand consumers
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
            // The running background task will detect the isReplaying flag and terminate.
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

                // Parse and sort the batch of records by game time (ascending)
                List<GameEvent> sortedEvents = new ArrayList<>();
                for (ConsumerRecord<String, String> record : records) {
                    GameEvent event = parseGameEvent(record.value());
                    if (event != null && parseGameTime(event.getTimestamp()) != null) {
                        sortedEvents.add(event);
                    }
                }
                // Sort by the game time ascending, so the earliest time comes first
                sortedEvents.sort(Comparator.comparing((GameEvent e) -> parseGameTime(e.getTimestamp())));

                for (GameEvent event : sortedEvents) {
                    logger.debug("Processing sorted event: {}", event);
                    if (!isReplaying.get()) {
                        logger.info("Stop flag detected, breaking from record processing loop.");
                        break;
                    }

                    Duration currentEventDuration = parseGameTime(event.getTimestamp());

                    // This is the first event we are replaying in this session.
                    if (lastEventDuration == null) {
                        lastEventDuration = currentEventDuration;
                        logger.info("Setting first event time to {}. No delay for this event.", formatDuration(lastEventDuration));
                    }

                    // The delay is the difference between the current event and the last one we sent.
                    long timeDiffSeconds = currentEventDuration.minus(lastEventDuration).getSeconds();

                    if (timeDiffSeconds < 0) {
                        logger.warn("Skipping event with non-ascending timestamp after sort. Event at {} is before last sent event at {}.", formatDuration(currentEventDuration), formatDuration(lastEventDuration));
                        continue;
                    }

                    long delayMillis = (long) (timeDiffSeconds * 1000 / speed);

                    logger.info("Calculated delay for event at {}: {}ms", event.getTimestamp(), delayMillis);

                    if (delayMillis > 0) {
                        try {
                            logger.debug("Sleeping for {}ms...", delayMillis);
                            Thread.sleep(delayMillis);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            logger.warn("Replay sleep interrupted.");
                            break;
                        }
                    }

                    if (!isReplaying.get()) {
                        logger.info("Stop flag detected after sleep, breaking before send.");
                        break;
                    }

                    logger.info(">>> Sending event to UI: {}", event);
                    messagingTemplate.convertAndSend("/topic/game-events", event);
                    sendReplayStatus(currentEventDuration, speed);
                    // Update the last sent event time
                    lastEventDuration = currentEventDuration;
                    sentEvent = true;
                }

                // Send status update every second, even if no event was sent
                long now = System.currentTimeMillis();
                if (!sentEvent && now - lastStatusTime >= 1000) {
                    sendReplayStatus(null, speed); // or pass the last known replay time if you want
                    lastStatusTime = now;
                }
            }
        } finally {
            isReplaying.set(false);
            logger.info("Replay finished and consumer is closed.");
            // sendReplayStatus(null, 0.0); // Final status update
        }
    }
    
    private GameEvent parseGameEvent(String message) {
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            JsonNode payloadNode = rootNode.path("value").path("payload");
            if (payloadNode.isMissingNode() || payloadNode.isNull()) {
                // Fallback for direct GameEvent JSON
                return objectMapper.readValue(message, GameEvent.class);
            } else {
                return objectMapper.treeToValue(payloadNode, GameEvent.class);
            }
        } catch (Exception e) {
            logger.error("Failed to parse message into GameEvent: {}", message, e);
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
            // Log once and then return null to avoid spamming for bad data
            logger.error("Invalid game time format for timestamp: '{}'", timestamp);
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
        var status = new java.util.HashMap<String, Object>();
        status.put("status", isReplaying.get() ? "replaying" : "stopped");
        status.put("currentReplayTime", formatDuration(currentReplayTime));
        status.put("speed", speed);
        status.put("timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/replay-status", status);
    }
    
    private void sendErrorStatus(String error) {
        var status = new java.util.HashMap<String, Object>();
        status.put("status", "error");
        status.put("error", error);
        status.put("timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/replay-status", status);
    }
} 