-- NBA Database Initialization Script
-- Create tables and insert initial data

-- Create teams table
CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    conference VARCHAR(20) NOT NULL,
    division VARCHAR(20) NOT NULL,
    founded_year INTEGER,
    arena VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create players table
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(team_id),
    player_name VARCHAR(100) NOT NULL,
    jersey_number INTEGER,
    position VARCHAR(20),
    height_cm INTEGER,
    weight_kg INTEGER,
    birth_date DATE,
    college VARCHAR(200),
    salary DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create games table
CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    home_team_id INTEGER REFERENCES teams(team_id),
    away_team_id INTEGER REFERENCES teams(team_id),
    game_date DATE NOT NULL,
    game_time TIME,
    season VARCHAR(20),
    status VARCHAR(20) DEFAULT 'scheduled',
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    arena VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create game events table
CREATE TABLE game_events (
    event_id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(game_id),
    player_id INTEGER REFERENCES players(player_id),
    event_type VARCHAR(50) NOT NULL,
    event_time TIMESTAMP NOT NULL,
    quarter INTEGER,
    time_remaining VARCHAR(10),
    description TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create player stats table
CREATE TABLE player_stats (
    stat_id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(game_id),
    player_id INTEGER REFERENCES players(player_id),
    minutes_played INTEGER,
    points INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    field_goals_made INTEGER DEFAULT 0,
    field_goals_attempted INTEGER DEFAULT 0,
    three_pointers_made INTEGER DEFAULT 0,
    three_pointers_attempted INTEGER DEFAULT 0,
    free_throws_made INTEGER DEFAULT 0,
    free_throws_attempted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial team data
INSERT INTO teams (team_name, city, conference, division, founded_year, arena) VALUES
('Celtics', 'Boston', 'Eastern', 'Atlantic', 1946, 'TD Garden'),
('Mavericks', 'Dallas', 'Western', 'Southwest', 1980, 'American Airlines Center');

-- 2024 NBA Finals Data
-- Celtics Players
INSERT INTO players (team_id, player_name, jersey_number, position, height_cm, weight_kg, birth_date, college, salary) VALUES
(1, 'Jayson Tatum', 0, 'SF', 203, 95, '1998-03-03', 'Duke', 32600000),
(1, 'Jaylen Brown', 7, 'SG', 198, 101, '1996-10-24', 'California', 31800000),
(1, 'Jrue Holiday', 4, 'PG', 193, 93, '1990-06-12', 'UCLA', 34000000),
(1, 'Derrick White', 9, 'PG', 193, 86, '1994-07-02', 'Colorado', 18000000),
(1, 'Kristaps Porzingis', 8, 'C', 221, 109, '1995-08-02', NULL, 36000000),
(1, 'Al Horford', 42, 'C', 206, 109, '1986-06-03', 'Florida', 10000000),
(1, 'Sam Hauser', 30, 'SF', 201, 98, '1997-12-08', 'Virginia', 2000000),
(1, 'Payton Pritchard', 11, 'PG', 185, 88, '1998-01-28', 'Oregon', 4000000),
(1, 'Luke Kornet', 40, 'C', 218, 113, '1995-07-15', 'Vanderbilt', 2400000),
(1, 'Oshae Brissett', 12, 'SF', 201, 95, '1998-06-20', 'Syracuse', 2300000),
(1, 'Neemias Queta', 88, 'C', 213, 111, '1999-07-13', 'Utah State', 2000000),
(1, 'Jaden Springer', 44, 'SG', 193, 93, '2002-09-25', 'Tennessee', 2100000),
(1, 'Xavier Tillman Sr.', 26, 'PF', 203, 111, '1999-01-12', 'Michigan State', 1800000),
(1, 'Jordan Walsh', 27, 'SF', 201, 93, '2004-03-03', 'Arkansas', 1200000),
(1, 'Drew Peterson', 13, 'PF', 206, 93, '1999-11-09', 'USC', 1200000),
(1, 'Lamar Stevens', 77, 'PF', 198, 104, '1997-07-09', 'Penn State', 1200000);

-- Mavericks Players
INSERT INTO players (team_id, player_name, jersey_number, position, height_cm, weight_kg, birth_date, college, salary) VALUES
(2, 'Luka Doncic', 77, 'PG', 201, 104, '1999-02-28', NULL, 40000000),
(2, 'Kyrie Irving', 11, 'PG', 188, 88, '1992-03-23', 'Duke', 37000000),
(2, 'Derrick Jones Jr.', 55, 'SF', 198, 95, '1997-02-15', 'UNLV', 2000000),
(2, 'P.J. Washington', 25, 'PF', 201, 104, '1998-08-23', 'Kentucky', 16000000),
(2, 'Daniel Gafford', 21, 'C', 208, 106, '1998-10-01', 'Arkansas', 13000000),
(2, 'Dereck Lively II', 2, 'C', 216, 104, '2004-02-12', 'Duke', 4000000),
(2, 'Tim Hardaway Jr.', 10, 'SG', 196, 93, '1992-03-16', 'Michigan', 17000000),
(2, 'Josh Green', 8, 'SG', 196, 91, '2000-11-16', 'Arizona', 4000000),
(2, 'Maxi Kleber', 42, 'PF', 208, 109, '1992-01-29', NULL, 9000000),
(2, 'Dante Exum', 0, 'PG', 196, 97, '1995-07-13', NULL, 3000000),
(2, 'Dwight Powell', 7, 'C', 208, 109, '1991-07-20', 'Stanford', 4000000),
(2, 'Jaden Hardy', 1, 'SG', 193, 90, '2002-07-05', NULL, 2000000),
(2, 'A.J. Lawson', 9, 'SG', 198, 81, '2000-07-15', 'South Carolina', 2000000),
(2, 'Olivier-Maxence Prosper', 18, 'PF', 201, 104, '2002-07-03', 'Marquette', 2000000),
(2, 'Markieff Morris', 88, 'PF', 206, 111, '1989-09-02', 'Kansas', 3000000);

-- Insert initial games data
-- 2024 NBA Finals 7 games
INSERT INTO games (home_team_id, away_team_id, game_date, game_time, season, status, home_score, away_score, arena) VALUES
(1, 2, '2024-06-06', '20:00:00', '2023-24 Finals', 'completed', 107, 95, 'TD Garden');
INSERT INTO games (home_team_id, away_team_id, game_date, game_time, season, status, home_score, away_score, arena) VALUES
(1, 2, '2024-06-09', '20:00:00', '2023-24 Finals', 'completed', 112, 108, 'TD Garden');
INSERT INTO games (home_team_id, away_team_id, game_date, game_time, season, status, home_score, away_score, arena) VALUES
(2, 1, '2024-06-12', '20:00:00', '2023-24 Finals', 'completed', 104, 110, 'American Airlines Center');
INSERT INTO games (home_team_id, away_team_id, game_date, game_time, season, status, home_score, away_score, arena) VALUES
(2, 1, '2024-06-14', '20:00:00', '2023-24 Finals', 'completed', 117, 115, 'American Airlines Center');
INSERT INTO games (home_team_id, away_team_id, game_date, game_time, season, status, home_score, away_score, arena) VALUES
(1, 2, '2024-06-17', '20:00:00', '2023-24 Finals', 'completed', 120, 118, 'TD Garden');
INSERT INTO games (home_team_id, away_team_id, game_date, game_time, season, status, home_score, away_score, arena) VALUES
(2, 1, '2024-06-20', '20:00:00', '2023-24 Finals', 'completed', 109, 111, 'American Airlines Center');
INSERT INTO games (home_team_id, away_team_id, game_date, game_time, season, status, home_score, away_score, arena) VALUES
(1, 2, '2024-06-23', '20:00:00', '2023-24 Finals', 'scheduled', 0, 0, 'TD Garden');

-- Insert initial game events data
INSERT INTO game_events (game_id, player_id, event_type, event_time, quarter, time_remaining, description, points) VALUES
(1, 1, '3PT_MADE', '2024-01-15 19:35:00', 1, '10:30', 'LeBron James makes 3-pointer', 3),
(1, 3, '2PT_MADE', '2024-01-15 19:36:00', 1, '10:15', 'Stephen Curry makes layup', 2),
(1, 2, 'FREE_THROW_MADE', '2024-01-15 19:37:00', 1, '10:00', 'Anthony Davis makes free throw', 1),
(2, 5, '3PT_MADE', '2024-01-16 19:35:00', 1, '10:30', 'Jayson Tatum makes 3-pointer', 3),
(2, 7, '2PT_MADE', '2024-01-16 19:36:00', 1, '10:15', 'Jimmy Butler makes jump shot', 2);

-- Insert initial player stats data
INSERT INTO player_stats (game_id, player_id, minutes_played, points, rebounds, assists, steals, blocks, turnovers, fouls, field_goals_made, field_goals_attempted, three_pointers_made, three_pointers_attempted, free_throws_made, free_throws_attempted) VALUES
(1, 1, 35, 28, 8, 12, 2, 1, 3, 2, 10, 18, 3, 7, 5, 6),
(1, 2, 32, 22, 12, 3, 1, 4, 2, 3, 8, 15, 0, 2, 6, 7),
(1, 3, 34, 31, 4, 8, 1, 0, 2, 1, 11, 20, 5, 12, 4, 4),
(1, 4, 30, 18, 3, 2, 0, 0, 1, 2, 7, 12, 4, 8, 0, 0),
(2, 5, 36, 25, 7, 5, 1, 0, 2, 2, 9, 16, 3, 8, 4, 5);

-- Create indexes to improve query performance
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_teams ON games(home_team_id, away_team_id);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_game_events_game ON game_events(game_id);
CREATE INDEX idx_game_events_time ON game_events(event_time);
CREATE INDEX idx_player_stats_game ON player_stats(game_id);
CREATE INDEX idx_player_stats_player ON player_stats(player_id);

-- Create views for easier queries
CREATE VIEW game_summary AS
SELECT 
    g.game_id,
    ht.team_name as home_team,
    at.team_name as away_team,
    g.game_date,
    g.home_score,
    g.away_score,
    g.status
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id;

CREATE VIEW player_performance AS
SELECT 
    p.player_name,
    t.team_name,
    ps.game_id,
    ps.points,
    ps.rebounds,
    ps.assists,
    ps.steals,
    ps.blocks,
    ps.minutes_played
FROM player_stats ps
JOIN players p ON ps.player_id = p.player_id
JOIN teams t ON p.team_id = t.team_id;
