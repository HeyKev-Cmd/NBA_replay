package com.nba.gameinfo.dto;

public class PlayerStatsDTO {
    private String playerName;
    private String teamName;
    private Integer jerseyNumber;
    private String position;
    private Integer heightCm;
    private Integer weightKg;
    private String birthDate;
    private String college;
    private Double salary;
    private int points = 0;
    private int rebounds = 0;
    private int assists = 0;
    private int fouls = 0;

    public PlayerStatsDTO(String playerName, String teamName, Integer jerseyNumber, String position, Integer heightCm, Integer weightKg, String birthDate, String college, Double salary) {
        this.playerName = playerName;
        this.teamName = teamName;
        this.jerseyNumber = jerseyNumber;
        this.position = position;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
        this.birthDate = birthDate;
        this.college = college;
        this.salary = salary;
    }
    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public Integer getJerseyNumber() { return jerseyNumber; }
    public void setJerseyNumber(Integer jerseyNumber) { this.jerseyNumber = jerseyNumber; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public Integer getHeightCm() { return heightCm; }
    public void setHeightCm(Integer heightCm) { this.heightCm = heightCm; }
    public Integer getWeightKg() { return weightKg; }
    public void setWeightKg(Integer weightKg) { this.weightKg = weightKg; }
    public String getBirthDate() { return birthDate; }
    public void setBirthDate(String birthDate) { this.birthDate = birthDate; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public int getRebounds() { return rebounds; }
    public void setRebounds(int rebounds) { this.rebounds = rebounds; }
    public int getAssists() { return assists; }
    public void setAssists(int assists) { this.assists = assists; }
    public int getFouls() { return fouls; }
    public void setFouls(int fouls) { this.fouls = fouls; }
} 