import React, { useState, useEffect } from 'react';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log('Teams: 開始 fetch /api/teams');
        const response = await fetch('http://localhost:8082/api/teams');
        console.log('Teams: API 回應狀態:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Teams: 收到資料:', data);
        setTeams(data);
      } catch (error) {
        console.error('Teams: 錯誤:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
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

  const getConferenceColor = (conference) => {
    return conference === 'Eastern' ? 'from-red-500 to-pink-500' : 'from-blue-500 to-purple-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NBA 球隊列表
          </h1>
          <p className="text-xl text-gray-600">探索所有 NBA 球隊的詳細資訊</p>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team, index) => (
            <div
              key={team.teamId}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Team Header */}
              <div className={`bg-gradient-to-r ${getConferenceColor(team.conference)} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {team.teamName.charAt(0)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">{team.conference}</div>
                      <div className="text-xs opacity-75">{team.division}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{team.teamName}</h3>
                  <p className="text-sm opacity-90">{team.city}</p>
                </div>
              </div>

              {/* Team Details */}
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">成立年份</span>
                    <span className="text-sm font-semibold text-gray-900">{team.foundedYear}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">主場館</span>
                    <span className="text-sm font-semibold text-gray-900 truncate ml-2">{team.arena}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">聯盟</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      team.conference === 'Eastern' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {team.conference}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                    查看詳情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">聯盟統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {teams.filter(t => t.conference === 'Western').length}
              </div>
              <div className="text-gray-600">西區球隊</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {teams.filter(t => t.conference === 'Eastern').length}
              </div>
              <div className="text-gray-600">東區球隊</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{teams.length}</div>
              <div className="text-gray-600">總球隊數</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams; 