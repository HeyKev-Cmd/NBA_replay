package com.nba.gameinfo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "players")
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long playerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    private String playerName;
    private Integer jerseyNumber;
    private String position;
    private Integer heightCm;
    private Integer weightKg;
    private String birthDate;
    private String college;
    private Double salary;

    // getter, setter
    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
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
} 