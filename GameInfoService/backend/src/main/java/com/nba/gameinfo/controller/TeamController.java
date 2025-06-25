package com.nba.gameinfo.controller;

import com.nba.gameinfo.entity.Team;
import com.nba.gameinfo.repository.TeamRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin
public class TeamController {
    private final TeamRepository teamRepository;
    public TeamController(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }
    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
} 