# NBA PostgreSQL 資料庫

這是一個包含 NBA 相關資料的 PostgreSQL 資料庫，使用 Docker 容器化部署。

## 資料庫結構

### 表格說明

1. **teams** - 球隊資訊
   - team_id: 球隊ID (主鍵)
   - team_name: 球隊名稱
   - city: 城市
   - conference: 聯盟 (Eastern/Western)
   - division: 分區
   - founded_year: 成立年份
   - arena: 主場館

2. **players** - 球員資訊
   - player_id: 球員ID (主鍵)
   - team_id: 所屬球隊ID (外鍵)
   - player_name: 球員姓名
   - jersey_number: 球衣號碼
   - position: 位置
   - height_cm: 身高(公分)
   - weight_kg: 體重(公斤)
   - birth_date: 出生日期
   - college: 大學
   - salary: 薪資

3. **games** - 比賽資訊
   - game_id: 比賽ID (主鍵)
   - home_team_id: 主隊ID (外鍵)
   - away_team_id: 客隊ID (外鍵)
   - game_date: 比賽日期
   - game_time: 比賽時間
   - season: 賽季
   - status: 比賽狀態
   - home_score: 主隊得分
   - away_score: 客隊得分

4. **game_events** - 比賽事件
   - event_id: 事件ID (主鍵)
   - game_id: 比賽ID (外鍵)
   - player_id: 球員ID (外鍵)
   - event_type: 事件類型
   - event_time: 事件時間
   - quarter: 節次
   - time_remaining: 剩餘時間
   - description: 事件描述
   - points: 得分

5. **player_stats** - 球員統計
   - stat_id: 統計ID (主鍵)
   - game_id: 比賽ID (外鍵)
   - player_id: 球員ID (外鍵)
   - minutes_played: 上場時間
   - points: 得分
   - rebounds: 籃板
   - assists: 助攻
   - steals: 抄截
   - blocks: 阻攻
   - turnovers: 失誤
   - fouls: 犯規
   - field_goals_made/attempted: 投籃命中/出手
   - three_pointers_made/attempted: 三分球命中/出手
   - free_throws_made/attempted: 罰球命中/出手

### 檢視表

1. **game_summary** - 比賽摘要檢視
2. **player_performance** - 球員表現檢視

## 啟動資料庫

### 使用合併後的 Docker Compose (推薦)

```bash
# 在專案根目錄執行
docker-compose up -d

# 查看所有服務狀態
docker-compose ps

# 查看 PostgreSQL 日誌
docker-compose logs nba-postgres
```

### 只啟動 PostgreSQL 資料庫

```bash
# 只啟動 PostgreSQL 服務
docker-compose up -d nba-postgres

# 查看資料庫狀態
docker-compose ps nba-postgres
```

### 使用 Docker 指令 (獨立啟動)

```bash
# 建立並啟動容器
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

## 連接資料庫

### 連接資訊
- **主機**: localhost (或 nba-postgres 在 Docker 網路內)
- **埠號**: 5432
- **資料庫**: real_time_nba
- **使用者**: nba
- **密碼**: 1q2w3e4r

### 使用 psql 連接

```bash
# 進入容器
docker exec -it nba-postgres psql -U nba -d real_time_nba

# 或直接連接
psql -h localhost -p 5432 -U nba -d real_time_nba
```

### 常用查詢範例

```sql
-- 查看所有球隊
SELECT * FROM teams;

-- 查看所有球員
SELECT p.player_name, t.team_name, p.position 
FROM players p 
JOIN teams t ON p.team_id = t.team_id;

-- 查看比賽摘要
SELECT * FROM game_summary;

-- 查看球員表現
SELECT * FROM player_performance 
WHERE points > 20 
ORDER BY points DESC;

-- 查看特定比賽的事件
SELECT ge.event_time, p.player_name, ge.event_type, ge.description
FROM game_events ge
JOIN players p ON ge.player_id = p.player_id
WHERE ge.game_id = 1
ORDER BY ge.event_time;
```

## 停止服務

```bash
# 停止所有服務
docker-compose down

# 只停止 PostgreSQL
docker-compose stop nba-postgres

# 停止並移除所有容器和資料
docker-compose down -v
```

## 資料備份與還原

### 備份資料庫

```bash
docker exec nba-postgres pg_dump -U nba real_time_nba > backup.sql
```

### 還原資料庫

```bash
docker exec -i nba-postgres psql -U nba real_time_nba < backup.sql
```

## 與其他服務的整合

PostgreSQL 資料庫已整合到整個 NBA 即時系統中：

- **Kafka**: 用於事件串流
- **GameEventIngestService**: 遊戲事件攝取服務，可以將事件儲存到資料庫
- **Redpanda Console**: Kafka 管理介面

### 服務依賴關係

```
Kafka ← GameEventIngestService → PostgreSQL
```

GameEventIngestService 會等待 Kafka 和 PostgreSQL 都準備就緒後才啟動。

## 注意事項

1. 資料庫初始化腳本 (`init.sql`) 只會在容器首次啟動時執行
2. 如果修改了 `init.sql`，需要重新建立容器才能生效
3. 資料會持久化保存在 Docker volume 中
4. 預設的資料庫連接埠是 5432，請確保該埠號未被其他服務佔用
5. 在 Docker 網路內，其他服務可以使用 `nba-postgres` 作為主機名稱連接資料庫 