/** Videos de tutoriales de KIT IMEP, agrupados por rol. */

export type TutorialRole = 'docente' | 'familia' | 'directivo';

export interface TutorialVideo {
  id: string;
  title: string;
  youtubeId: string;
}

export const tutorialRoles: Record<TutorialRole, { label: string; description: string }> = {
  docente: {
    label: 'Soy docente',
    description: 'Tutoriales para enviar comunicados, publicar tareas y seguir el historial.',
  },
  familia: {
    label: 'Soy familia',
    description: 'Tutoriales para ingresar, leer comunicados y tareas, y reportar problemas.',
  },
  directivo: {
    label: 'Soy directivo / no docente',
    description: 'Tutoriales para administrar usuarios, enviar mensajes y revisar el historial.',
  },
};

const video = {
  activarNotificaciones: { id: 'n1', title: 'KIT IMEP N1 · Activar notificaciones', youtubeId: 'Pb-gks_XR9c' },
  ingresarBiometria: { id: 'f5', title: 'KIT IMEP F5 · Ingresar con Face ID o huella', youtubeId: 'IVrXk_AFets' },
  reportarImagen: { id: 'f4', title: 'KIT IMEP F4 · Reportar imagen', youtubeId: 'NOmwp0r11sk' },
  leerComunicados: { id: 'f3', title: 'KIT IMEP F3 · Leer comunicados y tareas', youtubeId: 'WL5jbg09VW4' },
  historial: { id: 'd4', title: 'KIT IMEP D4 · Historial', youtubeId: 'IxCLUXDhKao' },
  ingresarFamilias: { id: 'f1', title: 'KIT IMEP F1 · Ingresar familias', youtubeId: 'JDIwLUsKGME' },
  publicarTarea: { id: 'd3', title: 'KIT IMEP D3 · Publicar tarea Classroom', youtubeId: 'sd02q77z1i4' },
  enviarMensaje: { id: 'd2', title: 'KIT IMEP D2 · Enviar mensaje', youtubeId: 'lQkb9Qowb3Y' },
  ingresarDocentes: { id: 'd1', title: 'KIT IMEP D1 · Ingresar docentes / no docente', youtubeId: '_eBuNKDwDPs' },
  directivoExtra: { id: 'directivo-extra', title: 'Tutorial para directivos y no docentes', youtubeId: 'JtBHaFPi2Ww' },
} satisfies Record<string, TutorialVideo>;

/** Videos comunes a los tres roles. */
const comunes: TutorialVideo[] = [
  video.activarNotificaciones,
  video.ingresarBiometria,
  video.reportarImagen,
  video.leerComunicados,
  video.historial,
];

export const tutorialVideosByRole: Record<TutorialRole, TutorialVideo[]> = {
  familia: [...comunes, video.ingresarFamilias],
  docente: [...comunes, video.publicarTarea, video.enviarMensaje],
  directivo: [...comunes, video.enviarMensaje, video.ingresarDocentes, video.directivoExtra],
};
