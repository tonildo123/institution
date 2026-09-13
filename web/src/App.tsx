import React, { useState } from 'react';
import Users from '@/pages/Users';
import Communications from '@/pages/Communications';
import './App.css';

/**
 * Aplicación Principal
 * Panel de Administración
 */

type PageType = 'users' | 'communications';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('users');

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="app-navbar">
        <div className="navbar-brand">
          <h1>📚 Instituto Admin</h1>
        </div>
        <div className="navbar-menu">
          <button
            className={`nav-link ${currentPage === 'users' ? 'active' : ''}`}
            onClick={() => setCurrentPage('users')}
          >
            👥 Usuarios
          </button>
          <button
            className={`nav-link ${currentPage === 'communications' ? 'active' : ''}`}
            onClick={() => setCurrentPage('communications')}
          >
            📤 Comunicaciones
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="app-main">
        {currentPage === 'users' && <Users />}
        {currentPage === 'communications' && <Communications />}
      </main>
    </div>
  );
}

export default App;
