import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import './login.css';

/** Ingreso al panel de administración con email y contraseña. */
const AdminLogin = () => {
  const { admin, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <p className="page-status">Verificando sesión…</p>;
  if (admin) return <Navigate to="/admin/usuarios" replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/admin/usuarios', { replace: true });
    } catch (failure: any) {
      setError(failure.message || 'No se pudo iniciar sesión. Verificá tu conexión e intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <p className="login-brand">IMEP</p>
        <p className="login-subtitle">Panel de administración</p>
        <label>
          Email
          <input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <p role="alert" className="login-error">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        <p className="login-back"><a href="/">Volver al sitio</a></p>
      </form>
    </main>
  );
};

export default AdminLogin;
