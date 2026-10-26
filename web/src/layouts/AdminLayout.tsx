import React from 'react';
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';

/** Marco del panel: exige sesión administrativa y muestra la navegación. */
const AdminLayout = () => {
  const { admin, loading, logout } = useAuth();
  if (loading) return <p className="page-status">Verificando sesión…</p>;
  if (!admin) return <Navigate to="/admin" replace />;

  return (
    <div className="app">
      <nav className="app-navbar">
        <div className="navbar-brand"><Link to="/">📚 IMEP · Admin</Link></div>
        <div className="navbar-menu">
          <NavLink className="nav-link" to="/admin/usuarios">Usuarios</NavLink>
          <NavLink className="nav-link" to="/admin/reportes">Reportes</NavLink>
          <NavLink className="nav-link" to="/admin/salas">Salas</NavLink>
          <NavLink className="nav-link" to="/admin/carga">Carga masiva</NavLink>
          <button className="nav-link" onClick={() => { void logout(); }}>Salir</button>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
