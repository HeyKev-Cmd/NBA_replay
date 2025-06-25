import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsResponse, playersResponse] = await Promise.all([
          fetch('http://localhost:8082/api/teams'),
          fetch('http://localhost:8082/api/players')
        ]);

        if (!teamsResponse.ok || !playersResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const teamsData = await teamsResponse.json();
        const playersData = await playersResponse.json();

        setTeams(teamsData);
        setPlayers(playersData);
      } catch (error) {
        console.error('Dashboard: 錯誤:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const stats = [
    {
      name: '總球隊數',
      value: teams.length,
      icon: UserGroupIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: '總球員數',
      value: players.length,
      icon: UserIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: '西區球隊',
      value: teams.filter(t => t.conference === 'Western').length,
      icon: TrophyIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      name: '東區球隊',
      value: teams.filter(t => t.conference === 'Eastern').length,
      icon: StarIcon,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  const quickActions = [
    {
      name: '查看球隊',
      description: '瀏覽所有 NBA 球隊資訊',
      href: '/teams',
      icon: UserGroupIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: '查看球員',
      description: '瀏覽所有球員資料',
      href: '/players',
      icon: UserIcon,
      color: 'from-green-500 to-green-600'
    },
    {
      name: '球員統計',
      description: '查看球員戰績統計',
      href: '/player-stats',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: '比賽列表',
      description: '查看比賽資訊',
      href: '/games',
      icon: CalendarIcon,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const topPlayers = players
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            NBA 資訊系統儀表板
          </h1>
          <p className="text-xl text-gray-600">即時掌握 NBA 球隊與球員數據</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <ArrowTrendingUpIcon className="h-6 w-6 mr-2 text-blue-600" />
              快速操作
            </h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="block p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {action.name}
                      </h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                    <div className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Players */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <TrophyIcon className="h-6 w-6 mr-2 text-yellow-600" />
              得分排行榜
            </h2>
            <div className="space-y-4">
              {topPlayers.map((player, index) => (
                <div
                  key={player.playerId}
                  className="flex items-center p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-yellow-700' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{player.playerName}</h3>
                    <p className="text-xs text-gray-500">{player.teamName} • {player.position}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{player.points || 0}</div>
                    <div className="text-xs text-gray-500">得分</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conference Distribution */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">聯盟分佈</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {teams.filter(t => t.conference === 'Western').length}
              </div>
              <div className="text-gray-600">西區球隊</div>
              <div className="mt-2 text-sm text-gray-500">
                {teams.filter(t => t.conference === 'Western').map(t => t.teamName).join(', ')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {teams.filter(t => t.conference === 'Eastern').length}
              </div>
              <div className="text-gray-600">東區球隊</div>
              <div className="mt-2 text-sm text-gray-500">
                {teams.filter(t => t.conference === 'Eastern').map(t => t.teamName).join(', ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 