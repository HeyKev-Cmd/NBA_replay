package GameEventIngestService.GameEventIngestService.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "game.events")
public class GameEventConfig {
    private Integer lastTimestampSeconds;
    private final Kafka kafka = new Kafka();

    public Integer getLastTimestampSeconds() {
        return lastTimestampSeconds;
    }

    public void setLastTimestampSeconds(Integer lastTimestampSeconds) {
        this.lastTimestampSeconds = lastTimestampSeconds;
    }

    public Kafka getKafka() {
        return kafka;
    }

    public static class Kafka {
        private String topic;

        public String getTopic() {
            return topic;
        }

        public void setTopic(String topic) {
            this.topic = topic;
        }
    }
} 