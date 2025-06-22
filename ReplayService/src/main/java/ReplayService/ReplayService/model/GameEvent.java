package ReplayService.ReplayService.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GameEvent {
    @JsonProperty("firstname")
    private String firstname;
    
    @JsonProperty("lastname")
    private String lastname;
    
    @JsonProperty("event_type")
    private String eventType;
    
    @JsonProperty("player_number")
    private String playerNumber;
    
    @JsonProperty("timestamp")
    private String timestamp;

    // Default constructor
    public GameEvent() {}

    // Constructor with all fields
    public GameEvent(String firstname, String lastname, String eventType, String playerNumber, String timestamp) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.eventType = eventType;
        this.playerNumber = playerNumber;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getPlayerNumber() {
        return playerNumber;
    }

    public void setPlayerNumber(String playerNumber) {
        this.playerNumber = playerNumber;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "GameEvent{" +
                "firstname='" + firstname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", eventType='" + eventType + '\'' +
                ", playerNumber='" + playerNumber + '\'' +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
} 