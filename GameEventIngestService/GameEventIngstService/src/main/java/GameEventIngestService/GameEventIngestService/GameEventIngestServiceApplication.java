import GameEventIngestService.GameEventIngestService.config.GameEventConfig;
import GameEventIngestService.GameEventIngestService.config.GameLogsConfig;
import GameEventIngestService.GameEventIngestService.service.GameLogReaderService;
import GameEventIngestService.GameEventIngestService.service.KafkaProducerService;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class GameEventIngestServiceApplication {

	@Autowired
	private GameLogReaderService gameLogReaderService;

	@Autowired
	private GameEventConfig gameEventConfig;

	@Autowired
	private KafkaProducerService kafkaProducerService;

	public static void main(String[] args) {
		SpringApplication.run(GameEventIngestServiceApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void run() {
		gameLogReaderService.readGameLogs(gameEventConfig.getGame_log_file(), (cur_line, curTime) -> {
			// 02:57  Al Horford (42) foul
			JSONObject event_json=getJson(cur_line);
			log.info("EVENT: {}", event_json);
			if (event_json != null) {
				kafkaProducerService.sendMessage(gameEventConfig.getkafkaTopic(), event_json.toString());
			}
			gameEventConfig.setLastTimestampSeconds(curTime);
		});
		log.info("--- Finished Reading All Game Events ---");
	}
} 