import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      name: '球隊資訊',
      description: '查看所有 NBA 球隊的詳細資訊，包括城市、聯盟、分區等',
      icon: UserGroupIcon,
      href: '/teams',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: '球員資料',
      description: '瀏覽球員基本資料和戰績統計',
      icon: UserIcon,
      href: '/players',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: '球員統計',
      description: '查看球員的得分、籃板、助攻、犯規等統計數據',
      icon: ChartBarIcon,
      href: '/player-stats',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: '比賽列表',
      description: '瀏覽所有比賽資訊和比分',
      icon: CalendarIcon,
      href: '/games',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: '比賽事件',
      description: '查看比賽中的即時事件和精彩時刻',
      icon: BoltIcon,
      href: '/game-events',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50'
    },
    {
      name: '儀表板',
      description: '球隊統計概覽和數據分析',
      icon: ChartBarIcon,
      href: '/dashboard',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NBA 球隊與球員資訊系統
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            這是一個整合了 NBA 球隊、球員資料和戰績統計的資訊系統，
            提供完整的籃球資料查詢功能和即時數據分析。
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={feature.name}
              to={feature.href}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-8">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Arrow */}
                <div className="absolute top-6 right-6 text-gray-300 group-hover:text-blue-500 transition-colors duration-300">
                  <svg className="h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">系統概覽</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10</div>
              <div className="text-gray-600">支球隊</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">10</div>
              <div className="text-gray-600">位球員</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">6</div>
              <div className="text-gray-600">個功能模組</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">即時更新</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 