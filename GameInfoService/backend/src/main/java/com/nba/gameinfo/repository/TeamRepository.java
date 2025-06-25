package com.nba.gameinfo.repository;

import com.nba.gameinfo.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
} 