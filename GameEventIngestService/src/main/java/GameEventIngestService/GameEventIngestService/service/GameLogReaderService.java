package GameEventIngestService.GameEventIngestService.service;

import GameEventIngestService.GameEventIngestService.config.GameLogsConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@Service
public class GameLogReaderService {
    
    private static final Logger log = LoggerFactory.getLogger(GameLogReaderService.class);
    
    @Autowired
    private GameLogsConfig gameLogsConfig;
    
    public Stream<String> streamGameEvents() throws IOException {
        String fullPath = gameLogsConfig.getFullPath();
        log.info("Attempting to stream game events from: {}", fullPath);
        
        Path logPath = Paths.get(fullPath);
        
        if (!Files.exists(logPath)) {
            log.error("Game log file not found at path: {}", fullPath);
            throw new IOException("Game log file not found: " + fullPath);
        }
        
        log.info("Streaming game events from file...");
        return Files.lines(logPath);
    }
    
    public String getGameId() {
        String gameId = gameLogsConfig.getGameId();
        log.debug("Retrieved game ID: {}", gameId);
        return gameId;
    }
    
    public String getLogFilePath() {
        String logFilePath = gameLogsConfig.getFullPath();
        log.debug("Retrieved log file path: {}", logFilePath);
        return logFilePath;
    }
} 