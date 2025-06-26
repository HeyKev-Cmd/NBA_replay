# NBA PostgreSQL Database

This is a PostgreSQL database containing NBA-related data, containerized with Docker for deployment.

## Database Structure

### Table Descriptions

1. **teams** - Team Information
   - team_id: Team ID (Primary Key)
   - team_name: Team Name
   - city: City
   - conference: Conference (Eastern/Western)
   - division: Division
   - founded_year: Year Founded
   - arena: Home Arena

2. **players** - Player Information
   - player_id: Player ID (Primary Key)
   - team_id: Team ID (Foreign Key)
   - player_name: Player Name
   - jersey_number: Jersey Number
   - position: Position
   - height_cm: Height (cm)
   - weight_kg: Weight (kg)
   - birth_date: Date of Birth
   - college: College
   - salary: Salary

3. **games** - Game Information
   - game_id: Game ID (Primary Key)
   - home_team_id: Home Team ID (Foreign Key)
   - away_team_id: Away Team ID (Foreign Key)
   - game_date: Game Date
   - game_time: Game Time
   - season: Season
   - status: Game Status
   - home_score: Home Team Score
   - away_score: Away Team Score

4. **game_events** - Game Events
   - event_id: Event ID (Primary Key)
   - game_id: Game ID (Foreign Key)
   - player_id: Player ID (Foreign Key)
   - event_type: Event Type
   - event_time: Event Time
   - quarter: Quarter
   - time_remaining: Time Remaining
   - description: Event Description
   - points: Points

5. **player_stats** - Player Statistics
   - stat_id: Stat ID (Primary Key)
   - game_id: Game ID (Foreign Key)
   - player_id: Player ID (Foreign Key)
   - minutes_played: Minutes Played
   - points: Points
   - rebounds: Rebounds
   - assists: Assists
   - steals: Steals
   - blocks: Blocks
   - turnovers: Turnovers
   - fouls: Fouls
   - field_goals_made/attempted: Field Goals Made/Attempted
   - three_pointers_made/attempted: Three Pointers Made/Attempted
   - free_throws_made/attempted: Free Throws Made/Attempted

### Views

1. **game_summary** - Game Summary View
2. **player_performance** - Player Performance View

## Starting the Database

### Using Combined Docker Compose (Recommended)

```bash
# Run in the project root directory
docker-compose up -d

# Check all service statuses
docker-compose ps

# View PostgreSQL logs
docker-compose logs nba-postgres
```

### Start Only the PostgreSQL Database

```bash
# Start only the PostgreSQL service
docker-compose up -d nba-postgres

# Check database status
docker-compose ps nba-postgres
```

### Using Docker Commands (Standalone)

```bash
# Build and start the container
docker build -t nba-postgres ./GameInfoService
docker run -d \
  --name nba-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=nba \
  -e POSTGRES_PASSWORD=1q2w3e4r \
  -e POSTGRES_DB=real_time_nba \
  -v $(pwd)/GameInfoService/init.sql:/docker-entrypoint-initdb.d/init.sql \
  nba-postgres
```

## Connecting to the Database

### Connection Information
- **Host**: localhost (or nba-postgres within Docker network)
- **Port**: 5432
- **Database**: real_time_nba
- **User**: nba
- **Password**: 1q2w3e4r

### Connect Using psql

```bash
# Enter the container
docker exec -it nba-postgres psql -U nba -d real_time_nba

# Or connect directly
psql -h localhost -p 5432 -U nba -d real_time_nba
```

### Common Query Examples

```sql
-- View all teams
SELECT * FROM teams;

-- View all players
SELECT p.player_name, t.team_name, p.position 
FROM players p 
JOIN teams t ON p.team_id = t.team_id;

-- View game summary
SELECT * FROM game_summary;

-- View player performance
SELECT * FROM player_performance 
WHERE points > 20 
ORDER BY points DESC;

-- View events for a specific game
SELECT ge.event_time, p.player_name, ge.event_type, ge.description
FROM game_events ge
JOIN players p ON ge.player_id = p.player_id
WHERE ge.game_id = 1
ORDER BY ge.event_time;
```

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop only PostgreSQL
docker-compose stop nba-postgres

# Stop and remove all containers and data
docker-compose down -v
```

## Database Backup and Restore

### Backup Database

```bash
docker exec nba-postgres pg_dump -U nba real_time_nba > backup.sql
```

### Restore Database

```bash
docker exec -i nba-postgres psql -U nba real_time_nba < backup.sql
```

## Integration with Other Services

The PostgreSQL database is integrated into the real-time NBA system:

- **Kafka**: For event streaming
- **GameEventIngestService**: Game event ingestion service, can store events in the database
- **Redpanda Console**: Kafka management interface

### Service Dependencies

```
Kafka ← GameEventIngestService → PostgreSQL
```

GameEventIngestService will wait for both Kafka and PostgreSQL to be ready before starting.

## Notes

1. The database initialization script (`init.sql`) only runs the first time the container starts
2. If you modify `init.sql`, you need to recreate the container for changes to take effect
3. Data is persisted in a Docker volume
4. The default database port is 5432; make sure this port is not used by other services
5. Within the Docker network, other services can use `nba-postgres` as the hostname to connect to the database 