package ReplayService.ReplayService.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    
    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);
    
    @Value("${kafka.topic.name}")
    private String topicName;
    
    @Value("${spring.kafka.bootstrap-servers}")
    private String kafkaUrl;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        logger.info("Health check requested");
        
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "ReplayService");
        health.put("kafkaUrl", kafkaUrl);
        health.put("topic", topicName);
        health.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        logger.info("Status check requested");
        
        Map<String, Object> status = new HashMap<>();
        status.put("service", "ReplayService");
        status.put("description", "NBA Game Event Replay Service");
        status.put("kafkaUrl", kafkaUrl);
        status.put("topic", topicName);
        status.put("websocketEndpoint", "/ws/replay");
        status.put("websocketTopic", "/topic/game-events");
        status.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(status);
    }
} 