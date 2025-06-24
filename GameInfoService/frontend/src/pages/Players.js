import React, { useState, useEffect } from 'react';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        console.log('Players: 開始 fetch /api/players');
        const response = await fetch('http://localhost:8081/api/players');
        console.log('Players: API 回應狀態:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Players: 收到資料:', data);
        setPlayers(data);
      } catch (error) {
        console.error('Players: 錯誤:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
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

  const getPositionColor = (position) => {
    const colors = {
      'PG': 'from-blue-500 to-blue-600',
      'SG': 'from-green-500 to-green-600',
      'SF': 'from-purple-500 to-purple-600',
      'PF': 'from-orange-500 to-orange-600',
      'C': 'from-red-500 to-red-600'
    };
    return colors[position] || 'from-gray-500 to-gray-600';
  };

  const getPositionBadgeColor = (position) => {
    const colors = {
      'PG': 'bg-blue-100 text-blue-700',
      'SG': 'bg-green-100 text-green-700',
      'SF': 'bg-purple-100 text-purple-700',
      'PF': 'bg-orange-100 text-orange-700',
      'C': 'bg-red-100 text-red-700'
    };
    return colors[position] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            NBA 球員列表
          </h1>
          <p className="text-xl text-gray-600">探索所有 NBA 球員的詳細資料</p>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player, index) => (
            <div
              key={player.playerId}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Player Header */}
              <div className={`bg-gradient-to-r ${getPositionColor(player.position)} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {player.playerName.charAt(0)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm px-2 py-1 rounded-full bg-white bg-opacity-20 ${getPositionBadgeColor(player.position)}`}>
                        {player.position}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{player.playerName}</h3>
                  <p className="text-sm opacity-90">#{player.jerseyNumber}</p>
                </div>
              </div>

              {/* Player Details */}
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">球隊</span>
                    <span className="text-sm font-semibold text-gray-900">{player.teamName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">身高</span>
                    <span className="text-sm font-semibold text-gray-900">{player.height} cm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">體重</span>
                    <span className="text-sm font-semibold text-gray-900">{player.weight} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">位置</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${getPositionBadgeColor(player.position)}`}>
                      {player.position}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                  <button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                    查看統計
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200">
                    球員詳情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">球員統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {['PG', 'SG', 'SF', 'PF', 'C'].map((position) => (
              <div key={position} className="text-center">
                <div className={`text-3xl font-bold mb-2 ${getPositionBadgeColor(position).replace('bg-', 'text-').replace(' text-', '')}`}>
                  {players.filter(p => p.position === position).length}
                </div>
                <div className="text-gray-600">{position}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">{players.length}</div>
            <div className="text-gray-600">總球員數</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Players; 