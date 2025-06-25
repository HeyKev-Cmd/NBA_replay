import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Players from './pages/Players';
import PlayerStats from './pages/PlayerStats';
import Games from './pages/Games';
import GameEvents from './pages/GameEvents';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/players" element={<Players />} />
            <Route path="/player-stats" element={<PlayerStats />} />
            <Route path="/games" element={<Games />} />
            <Route path="/game-events" element={<GameEvents />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 