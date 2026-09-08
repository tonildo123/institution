import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Users from '@/pages/Users';
import './App.css';

/**
 * Ejemplo de integración de la página Users en App.tsx
 *
 * Este archivo muestra cómo estructurar la aplicación web
 * con rutas y componentes principales.
 */

// Páginas
const Dashboard = () => (
  <div className="page-content">
    <h1>📊 Dashboard</h1>
    <p>Bienvenido al panel de administración</p>
  </div>
);

const NotFound = () => (
  <div className="page-content">
    <h1>404 - Página no encontrada</h1>
  </div>
);

/**
 * Layout principal de la aplicación
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h1>📚 Instituto</h1>
        </div>
        <nav className="navigation">
          <a href="/" className="nav-link">📊 Dashboard</a>
          <a href="/users" className="nav-link active">👥 Usuarios</a>
          <a href="/settings" className="nav-link">⚙️ Configuración</a>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <header className="header">
          <h2>Panel de Administración</h2>
          <div className="user-menu">
            <span>Admin</span>
            <button>Salir</button>
          </div>
        </header>
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
};

/**
 * Aplicación principal
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard */}
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        {/* Gestión de Usuarios */}
        <Route
          path="/users"
          element={
            <Layout>
              <Users />
            </Layout>
          }
        />

        {/* Página no encontrada */}
        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
