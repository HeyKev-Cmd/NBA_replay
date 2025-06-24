package com.nba.gameinfo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    private String teamName;
    private String city;
    private String conference;
    private String division;
    private Integer foundedYear;
    private String arena;

    // getter, setter
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getConference() { return conference; }
    public void setConference(String conference) { this.conference = conference; }
    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }
    public Integer getFoundedYear() { return foundedYear; }
    public void setFoundedYear(Integer foundedYear) { this.foundedYear = foundedYear; }
    public String getArena() { return arena; }
    public void setArena(String arena) { this.arena = arena; }
} 