package ReplayService.ReplayService.config;

import ReplayService.ReplayService.model.ReplayRequest;
import ReplayService.ReplayService.service.ReplayService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class JsonWebSocketHandler extends TextWebSocketHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(JsonWebSocketHandler.class);
    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    @Autowired
    @Lazy
    private ReplayService replayService;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("WebSocket connection established: {}", session.getId());
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        logger.info("WebSocket connection closed: {} with status: {}", session.getId(), status);
        sessions.remove(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        logger.info("Received message from {}: {}", session.getId(), message.getPayload());
        
        try {
            // Parse the JSON message
            ReplayRequest request = objectMapper.readValue(message.getPayload(), ReplayRequest.class);
            logger.info("Parsed replay request: {}", request);
            
            // Handle the replay request
            replayService.handleReplayRequest(request);
            
            // Send acknowledgment back to the client
            var response = new java.util.HashMap<String, Object>();
            response.put("type", "acknowledgment");
            response.put("action", request.getAction());
            response.put("status", "processing");
            response.put("timestamp", System.currentTimeMillis());
            
            String jsonResponse = objectMapper.writeValueAsString(response);
            session.sendMessage(new TextMessage(jsonResponse));
            
        } catch (Exception e) {
            logger.error("Error processing message: {}", message.getPayload(), e);
            
            // Send error response
            var errorResponse = new java.util.HashMap<String, Object>();
            errorResponse.put("type", "error");
            errorResponse.put("error", "Failed to process request: " + e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            String jsonErrorResponse = objectMapper.writeValueAsString(errorResponse);
            session.sendMessage(new TextMessage(jsonErrorResponse));
        }
    }

    public void broadcastToAll(String jsonMessage) {
        TextMessage message = new TextMessage(jsonMessage);
        sessions.removeIf(session -> {
            if (!session.isOpen()) {
                return true;
            }
            try {
                session.sendMessage(message);
                return false;
            } catch (IOException e) {
                logger.error("Error sending message to session {}", session.getId(), e);
                return true;
            }
        });
    }
} 