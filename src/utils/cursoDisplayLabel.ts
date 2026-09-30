// El nivel ya se muestra en el encabezado del grupo.
export const cursoDisplayLabel = (label: string) => label
  .replace(/^(INICIAL|PRIMARIO|SECUNDARIO|SEC)\s+/i, '')
  .replace(/SALA DE (\d+) AÑOS/i, 'Sala de $1 años')
  .replace(/TODO EL NIVEL/i, 'Todo el nivel')
  .replace(/GRADO/i, 'Grado')
  .replace(/AÑO\b/i, 'Año')
  .replace(/\bTM\b/g, 'Turno Mañana')
  .replace(/\bTT\b/g, 'Turno Tarde');

