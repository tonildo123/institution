import { Link, Navigate, useParams } from 'react-router-dom';
import { PublicShell } from './PublicPages';
import './tutoriales.css';
import {
  tutorialRoles,
  tutorialVideosByRole,
  type TutorialRole,
} from '@/data/tutorialVideos';

const roles = Object.keys(tutorialRoles) as TutorialRole[];

const isTutorialRole = (value: string | undefined): value is TutorialRole =>
  roles.includes(value as TutorialRole);

/** Índice de tutoriales: tres botones grandes, uno por rol. */
export const TutorialesIndex = () => (
  <PublicShell title="Tutoriales">
    <p className="tutorial-lead">Elegí tu perfil para ver los videos que te corresponden.</p>
    <div className="tutorial-role-grid">
      {roles.map((role) => (
        <Link key={role} className="tutorial-role-button" to={`/tutoriales/${role}`}>
          <span className="tutorial-role-label">{tutorialRoles[role].label}</span>
          <span className="tutorial-role-description">{tutorialRoles[role].description}</span>
        </Link>
      ))}
    </div>
  </PublicShell>
);

/** Videos embebidos de YouTube para un rol. */
export const TutorialesRole = () => {
  const { rol } = useParams();
  if (!isTutorialRole(rol)) return <Navigate to="/tutoriales" replace />;

  const videos = tutorialVideosByRole[rol];
  return (
    <PublicShell title={tutorialRoles[rol].label}>
      <p className="tutorial-lead">
        <Link to="/tutoriales">← Volver a tutoriales</Link>
      </p>
      <div className="tutorial-video-list">
        {videos.map((item) => (
          <section key={item.id} className="tutorial-video">
            <h2>{item.title}</h2>
            <div className="tutorial-video-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?rel=0&modestbranding=1`}
                title={item.title}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        ))}
      </div>
    </PublicShell>
  );
};
