package GameEventIngestService.GameEventIngestService.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "game.events.logs")
public class GameLogsConfig {
    
    private static final Logger log = LoggerFactory.getLogger(GameLogsConfig.class);
    
    private String basePath;
    private String filename;
    
    public String getFullPath() {
        log.info("getFullPath called - basePath: '{}', filename: '{}'", basePath, filename);
        return basePath + "/" + filename;
    }
    
    public String getGameId() {
        log.info("getGameId called - filename: '{}'", filename);
        // Extract game ID from filename (e.g., "game1.log" -> "game1")
        return filename != null ? filename.replace(".log", "") : "unknown";
    }
    
    // Getters and setters for Spring Boot property binding
    public String getBasePath() {
        return basePath;
    }
    
    public void setBasePath(String basePath) {
        log.info("setBasePath called with: '{}'", basePath);
        this.basePath = basePath;
    }
    
    public String getFilename() {
        return filename;
    }
    
    public void setFilename(String filename) {
        log.info("setFilename called with: '{}'", filename);
        this.filename = filename;
    }
} 