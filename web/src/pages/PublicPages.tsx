import React from 'react';
import { Link } from 'react-router-dom';
import './public.css';

/** Páginas públicas. Los textos de privacidad y términos son provisionales hasta recibir los oficiales. */

const PublicShell = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="public-page">
    <header className="public-header">
      <Link to="/" className="public-brand">IMEP</Link>
      <nav>
        <Link to="/nosotros">Nosotros</Link>
        <Link to="/privacidad">Privacidad</Link>
        <Link to="/terminos">Términos</Link>
      </nav>
    </header>
    <main className="public-main">
      {title && <h1>{title}</h1>}
      {children}
    </main>
    <footer className="public-footer">
      <div className="public-footer-inner">
        <span>© Instituto IMEP · KIT IMEP</span>
        <span>
          <Link to="/privacidad">Política de privacidad</Link>
          <Link to="/terminos">Términos y condiciones</Link>
        </span>
      </div>
    </footer>
  </div>
);

export const Landing = () => (
  <PublicShell>
    <section className="hero">
      <p className="hero-eyebrow">Instituto IMEP</p>
      <h1>Comunicación clara entre la escuela, las familias y los docentes</h1>
      <p>Comunicados, tareas de Classroom y seguimiento en un mismo lugar, desde el teléfono.</p>
      <div className="hero-actions">
        <Link className="button button-light" to="/nosotros">Conocé el instituto</Link>
        <Link className="button button-outline" to="/privacidad">Privacidad</Link>
      </div>
    </section>

    <section className="section">
      <h2 className="section-title">Qué encontrás en la aplicación</h2>
      <p className="section-lead">Todo lo que se comunica desde la institución, ordenado por curso y por nivel.</p>
      <div className="cards">
        <article className="card">
          <div className="card-icon">✉</div>
          <h3>Comunicados</h3>
          <p>Avisos de la institución para todos o para un nivel, curso o sala, con adjuntos.</p>
        </article>
        <article className="card">
          <div className="card-icon">📖</div>
          <h3>Classroom</h3>
          <p>Tareas y materiales de cada curso, con entrega de las familias y fecha límite.</p>
        </article>
        <article className="card">
          <div className="card-icon">🕘</div>
          <h3>Historial</h3>
          <p>Registro de lo enviado por la institución, para docentes y administración.</p>
        </article>
        <article className="card">
          <div className="card-icon">⚠</div>
          <h3>Reportes de problemas</h3>
          <p>Las familias y los docentes pueden avisar un problema y seguir su estado.</p>
        </article>
      </div>
    </section>

    <section className="section">
      <h2 className="section-title">Para familias y docentes</h2>
      <div className="split">
        <div className="panel">
          <h3>Familias</h3>
          <ul>
            <li>Ingreso con DNI y contraseña.</li>
            <li>Comunicados y tareas de cada curso de sus hijos.</li>
            <li>Entrega de tareas desde el teléfono.</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Docentes</h3>
          <ul>
            <li>Ingreso con email y contraseña.</li>
            <li>Envío de comunicados y publicación de tareas a sus cursos asignados.</li>
            <li>Seguimiento de las entregas de cada tarea.</li>
          </ul>
        </div>
      </div>
    </section>

    <section className="download">
      <div>
        <h2 className="section-title" style={{ margin: 0 }}>Descargá la aplicación</h2>
        <p>Disponible próximamente para iOS y Android.</p>
      </div>
      <span className="button button-solid" aria-disabled="true">Próximamente</span>
    </section>
  </PublicShell>
);

export const About = () => (
  <PublicShell title="Nosotros">
    <p>Texto institucional sobre qué es IMEP y KIT IMEP. Pendiente de redacción por la institución.</p>
  </PublicShell>
);

export const Privacy = () => (
  <PublicShell title="Política de privacidad">
    <p>Texto provisional. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  </PublicShell>
);

export const Terms = () => (
  <PublicShell title="Términos y condiciones">
    <p>Texto provisional. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  </PublicShell>
);

export const Placeholder = ({ title }: { title: string }) => (
  <section>
    <h2>{title}</h2>
    <p>Pendiente de implementación.</p>
  </section>
);
