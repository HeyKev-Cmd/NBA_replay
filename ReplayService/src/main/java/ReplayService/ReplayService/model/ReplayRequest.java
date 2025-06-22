package ReplayService.ReplayService.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ReplayRequest {
    
    @JsonProperty("action")
    private String action; // "start_replay", "stop_replay", "get_status"
    
    @JsonProperty("startTime")
    private String startTime; // "05:00" format
    
    @JsonProperty("speed")
    private Double speed; // 1.0 = normal speed, 2.0 = 2x speed, 0.5 = half speed
    
    // Default constructor
    public ReplayRequest() {}
    
    // Constructor
    public ReplayRequest(String action, String startTime, Double speed) {
        this.action = action;
        this.startTime = startTime;
        this.speed = speed != null ? speed : 1.0;
    }
    
    // Getters and Setters
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public String getStartTime() {
        return startTime;
    }
    
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
    
    public Double getSpeed() {
        return speed;
    }
    
    public void setSpeed(Double speed) {
        this.speed = speed;
    }
    
    @Override
    public String toString() {
        return "ReplayRequest{" +
                "action='" + action + '\'' +
                ", startTime='" + startTime + '\'' +
                ", speed=" + speed +
                '}';
    }
} 