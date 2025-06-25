package com.nba.gameinfo.repository;

import com.nba.gameinfo.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, Long> {
} 