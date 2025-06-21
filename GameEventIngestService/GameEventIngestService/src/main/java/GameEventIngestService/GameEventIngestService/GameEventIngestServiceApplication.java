package GameEventIngestService.GameEventIngestService;

import GameEventIngestService.GameEventIngestService.config.GameEventConfig;
import GameEventIngestService.GameEventIngestService.config.GameLogsConfig;
import GameEventIngestService.GameEventIngestService.service.GameLogReaderService;
import GameEventIngestService.GameEventIngestService.service.KafkaProducerService;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({GameLogsConfig.class, GameEventConfig.class})
public class GameEventIngestServiceApplication implements CommandLineRunner {

	private static final Logger log = LoggerFactory.getLogger(GameEventIngestServiceApplication.class);

	@Autowired
	private GameLogReaderService gameLogReaderService;

	@Autowired
	private GameEventConfig gameEventConfig;

	@Autowired
	private KafkaProducerService kafkaProducerService;

	public static void main(String[] args) {
		SpringApplication.run(GameEventIngestServiceApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		log.info("Game Event Ingest Service Starting...");
		log.info("Kafka topic: {}", gameEventConfig.getKafka().getTopic());
		log.info("Reading game: {}", gameLogReaderService.getGameId());
		log.info("Log file path: {}", gameLogReaderService.getLogFilePath());

		try (var events = gameLogReaderService.streamGameEvents()) {
			log.info("--- Reading Game Events Line by Line ---");
			events.forEach(line -> {
				// Here you can do any processing for each line
				String[] cur_line=line.split(" ");
				Integer curTime=parseTimestamp(cur_line[0]);
				if (gameEventConfig.getLastTimestampSeconds() != null && curTime - gameEventConfig.getLastTimestampSeconds() > 0) {
					log.info("There is a sleep event: {}", curTime - gameEventConfig.getLastTimestampSeconds());
				}
				// 02:57  Al Horford (42) foul
				JSONObject event_json=getJson(cur_line);
				log.info("EVENT: {}", event_json);
				if (event_json != null) {
					kafkaProducerService.sendMessage(gameEventConfig.getKafka().getTopic(), event_json.toString());
				}
				gameEventConfig.setLastTimestampSeconds(curTime);
			});
			log.info("--- Finished Reading All Game Events ---");
		} catch (Exception e) {
			log.error("Error reading game log stream: {}", e.getMessage(), e);
		}
	}
	private JSONObject getJson(String[] cur_line){
		JSONObject event_json = new JSONObject();
		try{
			event_json.put("firstname", cur_line[1]);
			event_json.put("lastname", cur_line[2]);
			event_json.put("player_number", cur_line[3]);
			event_json.put("event_type", cur_line[4]);
			event_json.put("timestamp", cur_line[0]);
			return event_json;
		} catch (Exception e) {
			log.error("Failed to parse json from array: '{}'", (Object)cur_line, e);
			return null;
		}
	}

	private int parseTimestamp(String timeStr) {
		try {
			String[] parts = timeStr.split(":");
			int minutes = Integer.parseInt(parts[0]);
			int seconds = Integer.parseInt(parts[1]);
			return (minutes * 60) + seconds;
		} catch (Exception e) {
			log.error("Failed to parse timestamp: '{}'", timeStr, e);
			return -1;
		}
	}
}