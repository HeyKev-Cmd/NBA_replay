import React, { useState, useEffect } from 'react';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        console.log('Games: 開始 fetch /api/games');
        const response = await fetch('http://localhost:8081/api/games');
        console.log('Games: API 回應狀態:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Games: 收到資料:', data);
        setGames(data);
      } catch (error) {
        console.error('Games: 錯誤:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">錯誤: {error}</div>
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

  const getGameStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'live':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score1, score2) => {
    if (score1 > score2) return 'text-green-600';
    if (score1 < score2) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            NBA 比賽列表
          </h1>
          <p className="text-xl text-gray-600">查看所有 NBA 比賽資訊和比分</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <div
              key={game.gameId}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Game Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm px-2 py-1 rounded-full bg-white bg-opacity-20 ${getGameStatusColor(game.status)}`}>
                        {game.status || '未知'}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1">比賽 #{game.gameId}</h3>
                  <p className="text-sm opacity-90">{game.gameDate || '日期未定'}</p>
                </div>
              </div>

              {/* Game Details */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {game.team1Name?.charAt(0) || 'T'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">{game.team1Name || '球隊1'}</div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(game.team1Score, game.team2Score)}`}>
                      {game.team1Score || 0}
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                      <span className="text-xs font-bold text-gray-600">VS</span>
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {game.team2Name?.charAt(0) || 'T'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">{game.team2Name || '球隊2'}</div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(game.team2Score, game.team1Score)}`}>
                      {game.team2Score || 0}
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">比賽場地</span>
                    <span className="text-gray-900 font-medium">{game.venue || '未定'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">比賽時間</span>
                    <span className="text-gray-900 font-medium">{game.gameTime || '未定'}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105">
                    查看詳情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">比賽統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{games.length}</div>
              <div className="text-gray-600">總比賽數</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {games.filter(g => g.status?.toLowerCase() === 'completed').length}
              </div>
              <div className="text-gray-600">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {games.filter(g => g.status?.toLowerCase() === 'live').length}
              </div>
              <div className="text-gray-600">進行中</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {games.filter(g => g.status?.toLowerCase() === 'scheduled').length}
              </div>
              <div className="text-gray-600">已排程</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games; 