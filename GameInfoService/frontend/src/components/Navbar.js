import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  BoltIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    // { name: '首頁', href: '/', icon: HomeIcon },
    // { name: '儀表板', href: '/dashboard', icon: ChartBarIcon },
    // { name: '球隊', href: '/teams', icon: UserGroupIcon },
    // { name: '球員', href: '/players', icon: UserIcon },
    { name: 'Player Stats', href: '/player-stats', icon: ChartBarIcon },
    // { name: '比賽', href: '/games', icon: CalendarIcon },
    // { name: '比賽事件', href: '/game-events', icon: BoltIcon },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">NBA Replay</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white bg-opacity-20 text-white shadow-lg'
                        : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white bg-opacity-95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 