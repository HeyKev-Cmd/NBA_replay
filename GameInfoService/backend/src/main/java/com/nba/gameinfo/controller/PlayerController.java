package com.nba.gameinfo.controller;

import com.nba.gameinfo.entity.Player;
import com.nba.gameinfo.dto.PlayerStatsDTO;
import com.nba.gameinfo.repository.PlayerRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
@CrossOrigin
public class PlayerController {
    private final PlayerRepository playerRepository;
    public PlayerController(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }
    @GetMapping
    public List<PlayerStatsDTO> getAllPlayers() {
        return playerRepository.findAll().stream()
            .map(player -> new PlayerStatsDTO(
                player.getPlayerName(),
                player.getTeam().getTeamName(),
                player.getJerseyNumber(),
                player.getPosition(),
                player.getHeightCm(),
                player.getWeightKg(),
                player.getBirthDate(),
                player.getCollege(),
                player.getSalary()
            ))
            .collect(Collectors.toList());
    }
} 