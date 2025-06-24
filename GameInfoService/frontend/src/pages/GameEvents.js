import React, { useState, useEffect } from 'react';

const GameEvents = () => {
  const [gameEvents, setGameEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameEvents = async () => {
      try {
        console.log('GameEvents: 開始 fetch /api/game-events');
        const response = await fetch('http://localhost:8081/api/game-events');
        console.log('GameEvents: API 回應狀態:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('GameEvents: 收到資料:', data);
        setGameEvents(data);
      } catch (error) {
        console.error('GameEvents: 錯誤:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameEvents();
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

  const getEventTypeColor = (eventType) => {
    const colors = {
      'score': 'from-green-500 to-green-600',
      'foul': 'from-red-500 to-red-600',
      'timeout': 'from-yellow-500 to-yellow-600',
      'substitution': 'from-blue-500 to-blue-600',
      'quarter': 'from-purple-500 to-purple-600'
    };
    return colors[eventType?.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  const getEventTypeIcon = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case 'score':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'foul':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'timeout':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'substitution':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getEventTypeBadgeColor = (eventType) => {
    const colors = {
      'score': 'bg-green-100 text-green-800',
      'foul': 'bg-red-100 text-red-800',
      'timeout': 'bg-yellow-100 text-yellow-800',
      'substitution': 'bg-blue-100 text-blue-800',
      'quarter': 'bg-purple-100 text-purple-800'
    };
    return colors[eventType?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            NBA 比賽事件
          </h1>
          <p className="text-xl text-gray-600">即時追蹤比賽中的精彩時刻</p>
        </div>

        {/* Game Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameEvents.map((event, index) => (
            <div
              key={event.eventId}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Event Header */}
              <div className={`bg-gradient-to-r ${getEventTypeColor(event.eventType)} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      {getEventTypeIcon(event.eventType)}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm px-2 py-1 rounded-full bg-white bg-opacity-20 ${getEventTypeBadgeColor(event.eventType)}`}>
                        {event.eventType || '未知'}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1">事件 #{event.eventId}</h3>
                  <p className="text-sm opacity-90">{event.gameId ? `比賽 #${event.gameId}` : '比賽未定'}</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">事件時間</span>
                    <span className="text-sm font-semibold text-gray-900">{event.eventTime || '未定'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">球員</span>
                    <span className="text-sm font-semibold text-gray-900">{event.playerName || '未指定'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">球隊</span>
                    <span className="text-sm font-semibold text-gray-900">{event.teamName || '未指定'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">事件類型</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${getEventTypeBadgeColor(event.eventType)}`}>
                      {event.eventType || '未知'}
                    </span>
                  </div>
                </div>

                {/* Event Description */}
                {event.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">描述:</span> {event.description}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105">
                    查看詳情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">事件統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {['score', 'foul', 'timeout', 'substitution', 'quarter'].map((eventType) => (
              <div key={eventType} className="text-center">
                <div className={`text-3xl font-bold mb-2 ${getEventTypeBadgeColor(eventType).replace('bg-', 'text-').replace(' text-', '')}`}>
                  {gameEvents.filter(e => e.eventType?.toLowerCase() === eventType).length}
                </div>
                <div className="text-gray-600 capitalize">{eventType}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">{gameEvents.length}</div>
            <div className="text-gray-600">總事件數</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameEvents; 