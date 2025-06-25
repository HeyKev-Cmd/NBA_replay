import React, { useState, useEffect, useRef } from 'react';

const PlayerStats = () => {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  // Helper to update stats based on event
  const updateStatsWithEvent = (event) => {
    console.log('event: ', event);
    setPlayerStats(prevStats => {
      // Find player by name and jersey number
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
      // Update stat by event_type
      const eventType = (event.event_type || '').toLowerCase();

      switch (true) {
        case eventType === 'shot':
          player.points = (player.points || 0) + 2;
          break;
        case eventType === 'points':
          player.points = (player.points || 0) + 2;
          break;
        case eventType.startsWith('score'):
          const parts = eventType.split('-');
          const scoreValue = parts.length > 1 ? parseInt(parts[1], 10) : 2; // 預設2分
          player.points = (player.points || 0) + (isNaN(scoreValue) ? 2 : scoreValue);
          break;
        case eventType === 'three':
        case eventType === 'three_point':
        case eventType === 'three-pointer':
          player.points = (player.points || 0) + 3;
          break;
        case eventType === 'free_throw':
          player.points = (player.points || 0) + 1;
          break;
        case eventType === 'rebound':
          player.rebounds = (player.rebounds || 0) + 1;
          break;
        case eventType === 'assist':
          player.assists = (player.assists || 0) + 1;
          break;
        case eventType === 'foul':
          player.fouls = (player.fouls || 0) + 1;
          break;
        default:
          break;
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

  // WebSocket connection for live replay
  useEffect(() => {
    if (loading || error) return;
    const ws = new window.WebSocket('ws://localhost:8081/ws/replay');
    wsRef.current = ws;

    ws.onopen = () => {
      // Send start replay message
      ws.send(JSON.stringify({
        action: 'start_replay',
        startTime: '00:00',
        speed: 1.0
      }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Only process if it looks like a game event
        if (data.firstname && data.lastname && data.event_type) {
          updateStatsWithEvent(data);
        }
      } catch (e) {
        // Ignore non-JSON or non-event messages
      }
    };
    ws.onerror = (e) => {
      // Optionally handle error
    };
    ws.onclose = () => {
      // Optionally handle close
    };
    return () => {
      ws.close();
    };
  }, [loading, error]);

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

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        </div>

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
                {playerStats.map((player, index) => (
                  <tr 
                    key={player.playerId} 
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatColor(player.points || 0, maxPoints)}`}>
                        {player.points || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatColor(player.rebounds || 0, maxRebounds)}`}>
                        {player.rebounds || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatColor(player.assists || 0, maxAssists)}`}>
                        {player.assists || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                        {player.fouls || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats; 