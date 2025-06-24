package ReplayService.ReplayService.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * WebSocket configuration for handling raw JSON messages via WebSocket without STOMP.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private JsonWebSocketHandler jsonWebSocketHandler;

    /**
     * Registers a custom WebSocket handler for raw JSON messages at "/ws/json".
     *
     * @param registry The WebSocketHandlerRegistry to register handlers with.
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(jsonWebSocketHandler, "/ws/replay")
                .setAllowedOriginPatterns("*"); // Also allow /ws/replay for raw JSON
    }
}
