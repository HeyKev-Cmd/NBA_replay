import React, { useState, useEffect, useRef } from 'react';

const PlayerStats = () => {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const [animatedPlayers, setAnimatedPlayers] = useState({}); // { [playerId]: { value, key } }
  // Tab state for teams
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [replayTime, setReplayTime] = useState(0); // 單位：秒
  const timerRef = useRef(null);

  // Helper to update stats based on event
  const updateStatsWithEvent = (event) => {
    let statKey = null;
    let delta = 0;
    setPlayerStats(prevStats => {
      const playerIndex = prevStats.findIndex(p => {
        const fullName = `${event.firstname} ${event.lastname}`.trim();
        return (
          (p.playerName && p.playerName.trim().toLowerCase() === fullName.toLowerCase()) ||
          (p.jerseyNumber && String(p.jerseyNumber) === String(event.player_number))
        );
      });
      if (playerIndex === -1) return prevStats; // Player not found
      // Copy stats
      const updatedStats = [...prevStats];
      const player = { ...updatedStats[playerIndex] };
      const prevPoints = player.points || 0;
      const prevRebounds = player.rebounds || 0;
      const prevAssists = player.assists || 0;
      const prevFouls = player.fouls || 0;
      // Update stat by event_type
      const eventType = (event.event_type || '').toLowerCase();
      switch (true) {
        case eventType === 'shot':
          delta = 2; statKey = 'points'; player.points = prevPoints + 2; break;
        case eventType === 'points':
          delta = 2; statKey = 'points'; player.points = prevPoints + 2; break;
        case eventType.startsWith('score'):
          const parts = eventType.split('-');
          const scoreValue = parts.length > 1 ? parseInt(parts[1], 10) : 2; // 預設2分
          delta = isNaN(scoreValue) ? 2 : scoreValue; statKey = 'points'; player.points = prevPoints + delta; break;
        case eventType === 'three-pointer':
          delta = 3; statKey = 'points'; player.points = prevPoints + 3; break;
        case eventType === 'free_throw':
          delta = 1; statKey = 'points'; player.points = prevPoints + 1; break;
        case eventType === 'rebound':
          delta = 1; statKey = 'rebounds'; player.rebounds = prevRebounds + 1; break;
        case eventType === 'assist':
          delta = 1; statKey = 'assists'; player.assists = prevAssists + 1; break;
        case eventType === 'foul':
          delta = 1; statKey = 'fouls'; player.fouls = prevFouls + 1; break;
        default:
          break;
      }
      let foundPlayerKey = null;
      if (statKey && delta > 0) {
        foundPlayerKey = player.playerName + (player.jerseyNumber ? '-' + player.jerseyNumber : '');
        const animKey = Date.now() + Math.random();
        setAnimatedPlayers(prev => ({
          ...prev,
          [foundPlayerKey + '-' + statKey]: { value: delta, key: animKey }
        }));
        setTimeout(() => {
          setAnimatedPlayers(prev => {
            const newState = { ...prev };
            delete newState[foundPlayerKey + '-' + statKey];
            return newState;
          });
        }, 1000);
        console.log('event', event);
        console.log('animatedPlayers set:', foundPlayerKey, statKey, delta);
      }
      updatedStats[playerIndex] = player;
      return updatedStats;
    });
  };

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/players');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('PlayerStats: Data received:', data);
        setPlayerStats(data);
      } catch (error) {
        console.error('PlayerStats: Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStats();
  }, []);

  // WebSocket connection for live replay (only on button click)
  useEffect(() => {
    if (!isReplaying || loading || error) return;
    const ws = new window.WebSocket('ws://localhost:8081/ws/replay');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'start_replay',
        startTime: '00:00',
        speed: parseInt(replaySpeed, 10) || 1
      }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.firstname && data.lastname && data.event_type) {
          updateStatsWithEvent(data);
        }
      } catch (e) {}
    };
    ws.onerror = (e) => {};
    ws.onclose = () => {};
    return () => {
      ws.close();
    };
  }, [isReplaying, loading, error, replaySpeed]);

  // Extract unique team names from playerStats
  const teamNames = Array.from(new Set(playerStats.map(p => p.teamName))).filter(Boolean);
  // Set default selected team when data loads
  useEffect(() => {
    if (!selectedTeam && teamNames.length > 0) {
      setSelectedTeam(teamNames[0]);
    }
  }, [teamNames, selectedTeam]);

  // Filtered stats for selected team
  const filteredStats = selectedTeam ? playerStats.filter(p => p.teamName === selectedTeam) : playerStats;

  // 停止重播
  const handleStopReplay = () => {
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ action: 'stop_replay' }));
      } catch (e) {}
      wsRef.current.close();
      wsRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsReplaying(false);
  };

  // 重播重置
  const handleResetReplay = async () => {
    handleStopReplay();
    setReplaySpeed(1);
    setReplayTime(0);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8082/api/players');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPlayerStats(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 比賽時間推進
  useEffect(() => {
    if (isReplaying) {
      timerRef.current = setInterval(() => {
        setReplayTime(prev => prev + (parseInt(replaySpeed, 10) || 1));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isReplaying, replaySpeed]);

  // 格式化比賽時間 mm:ss
  const formatReplayTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">Error: {error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getStatColor = (value, maxValue) => {
    const percentage = value / maxValue;
    if (percentage >= 0.8) return 'text-green-600 bg-green-50';
    if (percentage >= 0.6) return 'text-blue-600 bg-blue-50';
    if (percentage >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const maxPoints = Math.max(...playerStats.map(p => p.points || 0));
  const maxRebounds = Math.max(...playerStats.map(p => p.rebounds || 0));
  const maxAssists = Math.max(...playerStats.map(p => p.assists || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Player Statistics
          </h1>
          <p className="text-xl text-gray-600">View detailed game statistics for players</p>
        </div>

        {/* Start/Stop/Reset Replay Buttons + Speed Input + Time */}
        <div className="flex flex-col items-center mb-8 space-y-4">
          {/* Speed Input */}
          <div className="flex items-center space-x-2">
            <label htmlFor="replay-speed" className="font-semibold text-gray-700">Replay Speed:</label>
            <input
              id="replay-speed"
              type="number"
              min={1}
              step={1}
              className="w-24 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg text-center"
              value={replaySpeed}
              onChange={e => {
                const v = e.target.value;
                if (/^\d+$/.test(v) && parseInt(v, 10) > 0) setReplaySpeed(parseInt(v, 10));
                else if (v === '') setReplaySpeed('');
              }}
              disabled={isReplaying}
            />
            <span className="ml-6 font-semibold text-gray-700">Game Time:</span>
            <span className="text-2xl font-mono text-purple-700 w-20 text-center">{formatReplayTime(replayTime)}</span>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              className={`px-8 py-3 rounded-full font-bold text-lg border transition-colors duration-200 ${isReplaying ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'}`}
              onClick={() => setIsReplaying(true)}
              disabled={isReplaying}
            >
              {isReplaying ? 'Replaying...' : 'Start Replay'}
            </button>
            <button
              className="px-8 py-3 rounded-full font-bold text-lg border border-red-500 text-red-500 bg-white hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
              onClick={handleStopReplay}
              disabled={!isReplaying}
            >
              Stop Replay
            </button>
            <button
              className="px-8 py-3 rounded-full font-bold text-lg border border-blue-500 text-blue-500 bg-white hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50"
              onClick={handleResetReplay}
              disabled={loading}
            >
              Reset Replay
            </button>
          </div>
        </div>

        {/* Team Tabs */}
        {teamNames.length > 1 && (
          <div className="flex justify-center mb-8 space-x-4">
            {teamNames.map(team => (
              <button
                key={team}
                className={`px-6 py-2 rounded-full font-semibold border transition-colors duration-200 ${selectedTeam === team ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'}`}
                onClick={() => setSelectedTeam(team)}
              >
                {team}
              </button>
            ))}
          </div>
        )}

        {/* Stats Overview Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest Score</p>
                <p className="text-2xl font-bold text-gray-900">{maxPoints}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest Rebound</p>
                <p className="text-2xl font-bold text-gray-900">{maxRebounds}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest Assist</p>
                <p className="text-2xl font-bold text-gray-900">{maxAssists}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Players</p>
                <p className="text-2xl font-bold text-gray-900">{playerStats.length}</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Stats Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Player Statistics Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rebound
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foul
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStats.map((player, index) => {
                  const playerKey = player.playerName + (player.jerseyNumber ? '-' + player.jerseyNumber : '');
                  return (
                    <tr 
                      key={playerKey} 
                      className="hover:bg-gray-50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {player.playerName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{player.playerName}</div>
                            <div className="text-sm text-gray-500">#{player.jerseyNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{player.teamName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {player.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatColor(player.points || 0, maxPoints)}`}>
                          {player.points || 0}
                          {animatedPlayers[playerKey + '-points'] && (
                            <span key={animatedPlayers[playerKey + '-points'].key} className="float-up-anim ml-1 text-green-600 text-xs font-bold">
                              +{animatedPlayers[playerKey + '-points'].value}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatColor(player.rebounds || 0, maxRebounds)}`}>
                          {player.rebounds || 0}
                          {animatedPlayers[playerKey + '-rebounds'] && (
                            <span key={animatedPlayers[playerKey + '-rebounds'].key} className="float-up-anim ml-1 text-blue-600 text-xs font-bold">
                              +{animatedPlayers[playerKey + '-rebounds'].value}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatColor(player.assists || 0, maxAssists)}`}>
                          {player.assists || 0}
                          {animatedPlayers[playerKey + '-assists'] && (
                            <span key={animatedPlayers[playerKey + '-assists'].key} className="float-up-anim ml-1 text-green-700 text-xs font-bold">
                              +{animatedPlayers[playerKey + '-assists'].value}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                          {player.fouls || 0}
                          {animatedPlayers[playerKey + '-fouls'] && (
                            <span key={animatedPlayers[playerKey + '-fouls'].key} className="float-up-anim ml-1 text-red-600 text-xs font-bold">
                              +{animatedPlayers[playerKey + '-fouls'].value}
                            </span>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats; 