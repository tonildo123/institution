import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthProvider';
import AdminLayout from '@/layouts/AdminLayout';
import AdminLogin from '@/pages/AdminLogin';
import Users from '@/pages/Users';
import { About, Landing, Placeholder, Privacy, Terms } from '@/pages/PublicPages';
import './App.css';

/**
 * Sitio público (inicio, nosotros, privacidad, términos) y panel de administración en /admin.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/privacidad" element={<Privacy />} />
          <Route path="/terminos" element={<Terms />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="usuarios" element={<Users />} />
            <Route path="reportes" element={<Placeholder title="Reportes" />} />
            <Route path="salas" element={<Placeholder title="Salas" />} />
            <Route path="carga" element={<Placeholder title="Carga masiva" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
