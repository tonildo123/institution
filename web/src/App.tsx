import React from 'react';
import Users from '@/pages/Users';
import './App.css';

/**
 * Aplicación Principal
 * Panel de Administración - Gestión de Usuarios
 */

function App() {
  return (
    <div className="app">
      <main className="app-main">
        <Users />
      </main>
    </div>
  );
}

export default App;
