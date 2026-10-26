# Módulo Classroom

Copia del módulo de comunicaciones. Funciona igual, pero guarda sus mensajes en la colección `classroom` y no en `communications`.

## Qué se copió

- Pantallas: `src/screens/private/classroom/` (`ClassroomScreen`, `ClassroomDetailScreen`).
- Servicios: `src/services/firebase/classroom.ts` (lectura, edición y borrado en Firestore) y `src/services/classroomService.ts` (envío mediante Cloud Functions).
- Funciones: `sendClassroomToAll` y `sendClassroomToUsers` en `functions/src/index.ts`. Escriben en `classroom` y envían la notificación con `type: 'classroom'` y `classroomId`.
- Reglas: bloque `classroom/{messageId}` en `firestore.rules` y `firestore.sending.rules`, con las mismas reglas que `communications`.
- Tests: `classroomLoading.test.ts` y `classroomFunctions.test.ts`.

## Qué se comparte con Comunicaciones

- Adjuntos (imágenes, audios, videos, documentos, enlaces): `messageImages`, `messageAudio`, `messageVideo`, `messageDocuments` y el visor de enlaces. Sus archivos se guardan en las carpetas `communication-*` de Storage.
- Utilidad de audiencia `src/utils/communicationAudience.ts`.

## Navegación

- No hay pestaña separada de Classroom. La pestaña **Mensajes** tiene un selector arriba, **Mensajes | Classroom** (`MensajesTabScreen`), que por defecto muestra Mensajes. Familia recibe; preceptor y administración envían.
- Ambas pantallas quedan montadas al cambiar, así que un borrador en redacción no se pierde.
- Historial (administración y preceptor): tiene el mismo selector. Cada pestaña lee su propia colección, con la misma búsqueda y "Ver más".
- Selector compartido: `src/components/SourceTabs.tsx`.
- Las notificaciones de Classroom abren `ClassroomNotificationDetail`, mediante el enlace `institucion://classroom/{id}`. Las de comunicaciones siguen usando `institucion://message/{id}`.

## Pendiente

- **Alumnos:** todavía no existe el rol `alumno`. Subir archivos por comunicado está planificado, pero no se implementó.
- **Storage:** los adjuntos de Classroom comparten carpetas con Comunicaciones. Si se quiere separarlos, hay que copiar los servicios de adjuntos y las reglas de Storage.

## Despliegue

Antes de usar el módulo en producción:

```sh
cd functions && npm run build
firebase deploy --only functions:sendClassroomToAll,functions:sendClassroomToUsers --project institucion-59d9a
```

Y las reglas, según la fase en la que esté el proyecto (ver `message-privacy.md`).
