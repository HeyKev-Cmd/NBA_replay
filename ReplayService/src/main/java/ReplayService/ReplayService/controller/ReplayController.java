package ReplayService.ReplayService.controller;

import ReplayService.ReplayService.model.ReplayRequest;
import ReplayService.ReplayService.service.ReplayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ReplayController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReplayController.class);
    
    private final ReplayService replayService;
    
    @Value("${kafka.topic.name}")
    private String topicName;
    
    public ReplayController(ReplayService replayService) {
        this.replayService = replayService;
    }
    
    @MessageMapping("/replay/request")
    @SendTo("/topic/replay-status")
    public Map<String, Object> handleReplayRequest(@Payload ReplayRequest request) {
        logger.info("Received replay request: {}", request);
        
        // Handle the replay request
        replayService.handleReplayRequest(request);
        
        // Return immediate acknowledgment
        Map<String, Object> response = new HashMap<>();
        response.put("action", request.getAction());
        response.put("status", "processing");
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }
    
    @MessageMapping("/replay/status")
    @SendTo("/topic/replay-status")
    public Map<String, Object> getReplayStatus() {
        logger.info("Replay status requested");
        
        Map<String, Object> status = new HashMap<>();
        status.put("action", "get_status");
        status.put("topic", topicName);
        status.put("timestamp", System.currentTimeMillis());
        status.put("message", "Replay service is running and listening to topic: " + topicName);
        
        // Trigger status update
        replayService.handleReplayRequest(new ReplayRequest("get_status", null, null));
        
        return status;
    }
    
    @MessageMapping("/replay/start")
    @SendTo("/topic/replay-status")
    public Map<String, Object> startReplay(@Payload Map<String, Object> request) {
        logger.info("Start replay requested: {}", request);
        
        String startTime = (String) request.get("startTime");
        Double speed = request.get("speed") != null ? 
            Double.valueOf(request.get("speed").toString()) : 1.0;
        
        ReplayRequest replayRequest = new ReplayRequest("start_replay", startTime, speed);
        replayService.handleReplayRequest(replayRequest);
        
        Map<String, Object> response = new HashMap<>();
        response.put("action", "start_replay");
        response.put("startTime", startTime);
        response.put("speed", speed);
        response.put("status", "started");
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }
    
    @MessageMapping("/replay/stop")
    @SendTo("/topic/replay-status")
    public Map<String, Object> stopReplay() {
        logger.info("Stop replay requested");
        
        ReplayRequest replayRequest = new ReplayRequest("stop_replay", null, null);
        replayService.handleReplayRequest(replayRequest);
        
        Map<String, Object> response = new HashMap<>();
        response.put("action", "stop_replay");
        response.put("status", "stopped");
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }
} 